pragma solidity >=0.5.0 <0.6.0;

import "./gamehelper.sol";

contract GameMove is GameHelper {

    function move(uint _gameId) external onlyPlayerOf(_gameId) {
        //leaving this blank until FEN is implemented

    }

    function setPosition(uint _gameId, string calldata position) external onlyPlayerOf(_gameId){
        games[_gameId].position = position;
    }
}