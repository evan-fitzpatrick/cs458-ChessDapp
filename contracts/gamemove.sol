pragma solidity >=0.5.0 <0.6.0;

import "./gamehelper.sol";

import "hardhat/console.sol";
import "./OracleInterface.sol";
import "./ownable.sol";


contract GameMove is GameHelper {

    //string private nextMove;
    OracleInterface private oracleInstance;
    address private oracleAddress;
    mapping(uint256=>bool) myRequests;
    mapping(uint256=>uint256) gameIDs;

    event newOracleAddressEvent(address oracleAddress);
    event moveSuccessful(uint256 gameId, string gamePosition);
    event requestMove(uint256 gameId, string gamePosition);

    function setOracleInstanceAddress (address _oracleInstanceAddress) public onlyOwner {
        //console.log("setting oracle address");
        oracleAddress = _oracleInstanceAddress;
        oracleInstance = OracleInterface(oracleAddress);
        emit newOracleAddressEvent(oracleAddress);
    }

    // This function needs to be passed a move.
    // Right now it is set to default to stockfish.
    function makeMove(uint256 _gameId, string calldata _position) external onlyPlayerOf(_gameId) {
        //console.log("calling Oracle:");
        uint256 id = oracleInstance.getLatestMove('stockfish', _position);
        //console.log("new ID from oracle: ", id);
        myRequests[id] = true;
        gameIDs[id] = _gameId;
        emit requestMove(_gameId, _position);
    }

    function setPosition(string calldata _position, uint256 _id) external onlyOracle() {
        require(myRequests[_id], "This request is not in my pending list.");
        games[gameIDs[_id]].position = _position;
        emit moveSuccessful(gameIDs[_id], _position);
    }



    // the modifier that ensures only the oracle can call the callback.
    modifier onlyOracle() {
        require(msg.sender == oracleAddress, "You are not authorized to call this function.");
        _;
    }
}
