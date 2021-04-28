pragma solidity >=0.5.0 <0.6.0;
contract AppContractInterface {
    function callback(string memory _fenString, string memory _nextMove, uint256 _id) public;
}
