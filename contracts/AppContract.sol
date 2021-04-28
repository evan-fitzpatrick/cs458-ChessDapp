pragma solidity >=0.5.0 <0.6.0;

import "hardhat/console.sol";
import "./OracleInterface.sol";
import "./ownable.sol";  // to get the Ownable "onlyOwner" modifier

contract AppContract is Ownable {

    // contract variables held in blockchain storage

    string private nextMove;
    OracleInterface private oracleInstance;
    address private oracleAddress;
    mapping(uint256=>bool) myRequests;  // keeps track of all requests that I make

    // define events to be emitted

    event newOracleAddressEvent(address oracleAddress);
    event ReceivedNewRequestIdEvent(uint256 id);
    event MoveUpdatedEvent(string fenString, string nextMove, uint256 id);

    // You never know if the oracle has been recompiled and moved somewhere else on the blockchain
    // so define a function to set the oracle contract address

    function setOracleInstanceAddress (address _oracleInstanceAddress) public onlyOwner {
        console.log("setting oracle address");
        oracleAddress = _oracleInstanceAddress;
        oracleInstance = OracleInterface(oracleAddress);
        emit newOracleAddressEvent(oracleAddress);
    }

    // Applications call this to fetch the dollar price of Ether.  It calls the oracle but can't return data yet.

    function requestNextMove(string memory _proposedMove, string memory _fenString) public {
        console.log("calling Oracle:");
        uint256 id = oracleInstance.getLatestMove(_proposedMove, _fenString);  // oracle returns a unique ID to each request
        console.log("new ID from oracle: ", id);  // debug output;  can delete this later.
        myRequests[id] = true;
        emit ReceivedNewRequestIdEvent(id);
    }

    // This function is called by the oracle smart contract when it finally has some data to return.
    // First make sure that nobody except the oracle can invoke the callback by decorating it with a modifier
    // Then make sure the id number matches a request actually made by me.
    // Finally, set the price, delete the request from the pending list and emit an event that your app will listen for

    function callback(string memory _fenString, string memory _nextMove, uint256 _id) public onlyOracle {
        require(myRequests[_id], "This request is not in my pending list.");
        nextMove = _nextMove; // Not sure what this line is doing?
        delete myRequests[_id];
        emit MoveUpdatedEvent(_fenString, nextMove, _id);
    }

    // the modifier that ensures only the oracle can call the callback.

    modifier onlyOracle() {
        require(msg.sender == oracleAddress, "You are not authorized to call this function.");
        _;
    }
}

