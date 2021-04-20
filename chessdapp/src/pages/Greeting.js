import React, { Component } from "react";
import Chessboard from "chessboardjsx";

class Greeting extends Component {
  render() {
    const imgStyle = {
      display: "block",
      marginLeft: "auto",
      marginRight: "auto",
      width: "50%"
    };

    return (
      <div>
        <br />
        <h2 style={{ color: "DarkRed", textAlign: "center" }}>
          {" "}
          Welcome to the CSU <b> CryptoZombies</b> game!
        </h2>
        <br />
        <Chessboard position="start"/>
        <br /> <br />
        <p style={{ textAlign: "center" }}>
          This Colorado State University CS458 blockchain game allows you to create one original zombie
          on the Ethereum blockchain.
          <br /> Once created, your zombie can eat cryptokitties to create new
          zombies.
          <br /> Additionally, your zombie can attack other zombies (you have a
          70% chance of winning).
          <br /> <br /> To get started, select a button from the menu bar above.
        </p>
      </div>
    );
  }
}

export default Greeting;
