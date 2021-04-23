pragma solidity >=0.5.0 <0.6.0;

import "./gamemodifiers.sol";

contract GameHelper is GameModifiers {

    function getGamesByOwner(address _owner) external view returns(uint[] memory) {
        uint[] memory result = new uint[](ownerGameCount[_owner]);
        uint counter = 0;
        for (uint i = 0; i < games.length; i++) {
            if (gameToOwner[i] == _owner) {
            result[counter] = i;
            counter++;
            }
        }
    return result;
    }

    function withdraw() external onlyOwner {
        address payable _owner = address(uint160(owner()));
        _owner.transfer(address(this).balance);
    }

    function getPosition(uint _gameId) external view returns(string memory){
        return games[_gameId].position;
    }

}
