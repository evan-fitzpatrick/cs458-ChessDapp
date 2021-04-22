pragma solidity >=0.5.0 <0.6.0;

import "./gamehelper.sol";

contract GameMove is GameHelper {

    event moveSuccessful(uint gameId, string gamePosition);

    function move(uint _gameId) external onlyPlayerOf(_gameId) {
        //leaving this blank until FEN parsing is implemented

    }

    function setPosition(uint _gameId, string calldata _position) external onlyPlayerOf(_gameId){
        //No validation to make sure that the position is valid, or follows from a legal move of previous position, yet
        games[_gameId].position = _position;
        emit moveSuccessful(_gameId, _position);
    }
}