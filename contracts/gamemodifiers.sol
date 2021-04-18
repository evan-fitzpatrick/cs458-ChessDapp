pragma solidity >=0.5.0 <0.6.0;

import "./gamefactory.sol";

//planning on using this class as a way to determine piece behavior/if a move is valid.

contract GameModifiers is GameFactory {

    modifier onlyOwnerOf(uint _gameId) {
        require(msg.sender == gameToOwner[_gameId]);
        _;
    }

    modifier onlyPlayerOf(uint _gameId) {
        require(msg.sender == gameToPlayers[_gameId][0] || msg.sender == gameToPlayers[_gameId][1]);
        _;
    }
}
