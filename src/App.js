import "./App.css";
import react, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { contractAddress, contractABI } from "./constant";
import NavBar from "./components/Navbar";
import { Bank, PiggyBank, Coin } from "react-bootstrap-icons";
import StakeModal from "./components/StakeModal";

function App() {
  // general states
  const [provider, setProvider] = useState(undefined);
  const [signer, setSigner] = useState(undefined);
  const [contract, setContract] = useState(undefined);
  const [signerAddress, setSignerAddress] = useState(undefined);

  // asset == Position (in contract)
  const [assetIds, setAssetIds] = useState([]);
  const [assets, setAssets] = useState([]);

  // staking related states
  const [showStakeModal, setShowStakeModal] = useState(false);
  const [stakingLength, setStakingLength] = useState(undefined);
  const [stakingPercent, setStakingPercent] = useState(undefined);
  const [amount, setAmount] = useState(0);

  // helpers functions
  const toWei = (ether) => ethers.utils.parseEther(ether);
  const toEther = (wei) => ethers.utils.formatEther(wei);

  useEffect(() => {
    const onLoad = async () => {
      const provider = await new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);

      const contract = await new ethers.Contract(contractAddress, contractABI);
      setContract(contract);
    };
    onLoad();
  }, []);

  const isConnected = () => signer !== undefined;

  const getSigner = async () => {
    provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    return signer;
  };

  const getAssetIds = async (address, signer) => {
    const assetIds = await contract
      .connect(signer)
      .getPositionIdsForAddress(address);
    return assetIds;
  };

  const calcDaysRemaining = (unlockDate) => {
    const timeNow = Date.now() / 1000;
    const secondsRemaining = unlockDate - timeNow;
    return Math.max((secondsRemaining / 60 / 60 / 24).toFixed(0), 0);
  };

  const getAssets = async (ids, signer) => {
    const queriedAssets = await Promise.all(
      ids.map((id) => contract.connect(signer).getPositionById(id))
    );

    queriedAssets.map(async (asset) => {
      const parsedAsset = {
        positionId: asset.positionId,
        percentInterest: Number(asset.percentInterest) / 100,
        daysRemaining: calcDaysRemaining(Number(asset.unlockDate)),
        etherInterest: toEther(asset.weiInterest),
        etherStaked: toEther(asset.weiStaked),
        open: asset.open,
      };

      setAssets((prev) => [...prev, parsedAsset]);
    });
  };

  const connectAndLoad = async () => {
    const signer = await getSigner(provider);
    setSigner(signer);

    const signerAddress = await signer.getAddress();
    setSignerAddress(signerAddress);

    const assetIds = await getAssetIds(signerAddress, signer);
    setAssetIds(assetIds);

    getAssets(assetIds, signer);
    console.log(signerAddress);
  };

  const openStakingModal = (stakingLength, stakingPercent) => {
    setShowStakeModal(true);
    setStakingLength(stakingLength);
    setStakingPercent(stakingPercent);
  };

  const stakeEther = () => {
    const wei = toWei(amount);
    const data = { value: wei };
    contract.connect(signer).stakeEther(stakingLength, data);
  };

  const withdraw = (positionId) => {
    contract.connect(signer).closePosition(positionId);
  };

  return (
    <div className="App">
      <div>
        <NavBar isConnected={isConnected} connect={connectAndLoad} />
      </div>

      <div className="appBody">
        <div className="marketContainer" style={{height: "max-content", paddingBottom: "2vh"}}>
          <div className="subContainer">
            <span
              style={{
                backgroundColor: "white",
                padding: "1vh",
                marginRight: "1vw",
              }}
            >
              <Bank style={{ color: "black", fontSize: "2rem" }} />
            </span>
            <span className="marketHeader">Polygon Market</span>
          </div>

          <div className="row">
            <div className="col-md-6" style={{marginTop: "1vh"}}>
              <div
                onClick={() => openStakingModal(2, "5%")}
                className="marketOption"
              >
                <div className="glyphContainer hoverButton">
                  <span className="glyph">
                    <Coin />
                  </span>
                </div>
                <div className="optionData">
                  <span>2 Days</span>
                  <span className="optionPercent">5%</span>
                </div>
              </div>
            </div>

            <div className="col-md-6" style={{marginTop: "1vh"}}>
              <div
                onClick={() => openStakingModal(30, "7%")}
                className="marketOption"
              >
                <div className="glyphContainer hoverButton">
                  <span className="glyph">
                    <Coin />
                  </span>
                </div>
                <div className="optionData">
                  <span>1 Month</span>
                  <span className="optionPercent">7%</span>
                </div>
              </div>
            </div>

            <div className="col-md-6" style={{marginTop: "2vh"}}>
              <div
                onClick={() => openStakingModal(90, "10%")}
                className="marketOption"
              >
                <div className="glyphContainer hoverButton">
                  <span className="glyph">
                    <Coin />
                  </span>
                </div>
                <div className="optionData">
                  <span>3 Months</span>
                  <span className="optionPercent">10%</span>
                </div>
              </div>
            </div>

            <div className="col-md-6" style={{marginTop: "2vh"}}>
              <div
                onClick={() => openStakingModal(180, "12%")}
                className="marketOption"
              >
                <div className="glyphContainer hoverButton">
                  <span className="glyph">
                    <Coin />
                  </span>
                </div>
                <div className="optionData">
                  <span>6 Months</span>
                  <span className="optionPercent">12%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="assetContainer">
          <div className="subContainer">
            <span className="marketHeader">Staked Assets</span>
          </div>
          <div>
            <div className="row columnHeaders">
              <div className="col-md-2">Assets</div>
              <div className="col-md-2">Percent Interest</div>
              <div className="col-md-2">Staked</div>
              <div className="col-md-2">Interest</div>
              <div className="col-md-2">Days Remaining</div>
              <div className="col-md-2"></div>
            </div>
          </div>
          <br />
          {assets.length > 0 &&
            assets.map((a, idx) => (
              <div className="row">
                <div className="col-md-2">
                  <span>
                    <PiggyBank
                      style={{
                        color: "white",
                        fontSize: "2rem",
                        marginBottom: "1vh",
                        fontWeight: "500",
                      }}
                    />
                  </span>
                </div>
                <div className="col-md-2">{a.percentInterest} %</div>
                <div className="col-md-2">{a.etherStaked}</div>
                <div className="col-md-2">{a.etherInterest}</div>
                <div className="col-md-2">{a.daysRemaining}</div>
                <div className="col-md-2">
                  {a.open ? (
                    <div
                      onClick={() => withdraw(a.positionId)}
                      className="orangeMiniButton"
                    >
                      Withdraw
                    </div>
                  ) : (
                    <span>closed</span>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
      {showStakeModal && (
        <StakeModal
          onClose={() => setShowStakeModal(false)}
          stakingLength={stakingLength}
          stakingPercent={stakingPercent}
          amount={amount}
          setAmount={setAmount}
          stakeEther={stakeEther}
        />
      )}
    </div>
  );
}

export default App;
