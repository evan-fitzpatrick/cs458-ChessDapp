pragma solidity >=0.5.0 <0.6.0;
contract OracleInterface {
    function getLatestMove(string memory _proposedMove, string memory _fenString) public returns (uint256);
}
