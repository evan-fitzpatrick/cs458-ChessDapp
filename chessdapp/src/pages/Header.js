import React, { Component } from "react";

class Header extends Component {
  render() {
    const imgStyle = {
      display: "block",
      marginLeft: "auto",
      marginRight: "auto",
      width: "50%"
    };

    return (
      <div>
        <img src="static/images/ChessDapp.png" style={imgStyle} width="400px" alt="Zombie rising from grave" />
      </div>
    );
  }
}

export default Header;
