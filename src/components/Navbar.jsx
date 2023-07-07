import React from "react";

const NavBar = (props) => {
  return (
    <>
      <div className="navBar">
        <div className="navButton">
          <img style={{height: "10vh", marginTop: "-1.5vh"}} src={require("./Yield-Forge-transparent-1.png")} />
        </div>
        {props.isConnected() ? (
          <div className="connectButton">Connected</div>
        ) : (
          <div onClick={() => props.connect()} className="connectButton" style={{marginTop: "1.5vh"}}>
            Connect Wallet
          </div>
        )}
      </div>
    </>
  );
};

export default NavBar;
