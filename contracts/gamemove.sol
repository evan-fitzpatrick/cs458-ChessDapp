pragma solidity >=0.5.0 <0.6.0;

import "./gamehelper.sol";

contract GameMove is GameHelper {
    event moveSuccessful(uint256 gameId, string gamePosition);
    event requestMove(uint256 gameId, string gamePosition);

    function makeMove(uint256 _gameId, string calldata _position) external onlyPlayerOf(_gameId) {
        //Todo: validate turns
        emit requestMove(_gameId, _position);
    }

    function setPosition(uint256 _gameId, string calldata _position) external onlyOracle(){
        //No validation to make sure that the position is valid, or follows from a legal move of previous position, yet
        games[_gameId].position = _position;
        emit moveSuccessful(_gameId, _position);
    }
}
