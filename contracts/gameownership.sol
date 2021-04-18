pragma solidity >=0.5.0 <0.6.0;

import "./gamemove.sol";
import "./erc721.sol";
import "./safemath.sol";

contract GameOwnership is GameMove, ERC721 {

    using SafeMath for uint256;

    mapping (uint => address) gameApprovals;

    function balanceOf(address _owner) external view returns (uint256) {
        return ownerGameCount[_owner];
    }

    function ownerOf(uint256 _tokenId) external view returns (address) {
        return gameToOwner[_tokenId];
    }

    // No reason to transfer a chess game? maybe for fun with NFTs? It's already built with the cryptoZombies stuff.
    function _transfer(address _from, address _to, uint256 _tokenId) private {
        ownerGameCount[_to] = ownerGameCount[_to].add(1);
        ownerGameCount[msg.sender] = ownerGameCount[msg.sender].sub(1);
        gameToOwner[_tokenId] = _to;
        emit Transfer(_from, _to, _tokenId);
    }

    function transferFrom(address _from, address _to, uint256 _tokenId) external payable {
        require (gameToOwner[_tokenId] == msg.sender || gameApprovals[_tokenId] == msg.sender);
        _transfer(_from, _to, _tokenId);
    }

    function approve(address _approved, uint256 _tokenId) external payable onlyOwnerOf(_tokenId) {
        gameApprovals[_tokenId] = _approved;
        emit Approval(msg.sender, _approved, _tokenId);
    }

}
