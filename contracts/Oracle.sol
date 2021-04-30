pragma solidity >=0.5.0 <0.6.0;

import "hardhat/console.sol";  // for debugging
import "./AppContractInterface.sol";
import "./ownable.sol";  // to get the Ownable "onlyOwner" modifier


contract Oracle is Ownable {

    // define contract variables to be held in the blockchain
    uint private randNonce = 0;
    uint private modulus = 10000;
    mapping(uint256=>bool) pendingRequests;  // keep track of legitimate requests

    // define events
    event GetLatestMoveEvent(string _proposedMove, string _fenString, address callerAddress, uint id);
    event SetLatestMoveEvent(string _fenString, string nextMove, address callerAddress, uint id);

    // function to get the the next move from the Oracle server
    function getLatestMove(string memory _proposedMove, string memory _fenString) public returns (uint256) {
        randNonce++;
        uint id = uint(keccak256(abi.encodePacked(now, msg.sender, randNonce))) % modulus;
        pendingRequests[id] = true;  // keep track of legitimate requests using self-generated id number
        emit GetLatestMoveEvent(_proposedMove, _fenString, msg.sender, id);
        console.log("        ORACLE: emitting request to server for", msg.sender, "using ID", id);
        return id;
    }

    // function called by the Oracle Server to set the FEN string and return the next move to the callback
    function setLatestMove(string memory _fenString, string memory _nextMove, address _callerAddress, uint256 _id) public onlyOwner {
        require(pendingRequests[_id], "This request is not in my pending list.");
        delete pendingRequests[_id];  // once serviced, delete the request to save storage
        AppContractInterface appContractInstance;
        appContractInstance = AppContractInterface(_callerAddress);
        appContractInstance.callBack(_fenString, _nextMove, _id);
        console.log("ORACLE: setting latest move");
        emit SetLatestMoveEvent(_fenString, _nextMove, _callerAddress, _id);
    }
}
