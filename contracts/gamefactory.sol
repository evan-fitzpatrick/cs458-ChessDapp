pragma solidity >=0.5.0 <0.6.0;

import "./ownable.sol";
import "./safemath.sol";

contract GameFactory is Ownable {
    using SafeMath for uint256;
    using SafeMath32 for uint32;
    using SafeMath16 for uint16;
    using SafeMath8 for uint8;

    event NewGame(
        uint256 gameId,
        address owner,
        address indexed player1,
        address indexed player2
    );

    string defaultPosition =
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

    struct ChessGame {
        address owner;
        address white;
        address black;
        bool turn; //false for white true for black
        string position;
    }

    ChessGame[] public games;

    mapping(uint256 => address) public gameToOwner;
    mapping(uint256 => address[2]) public gameToPlayers;
    mapping(address => uint256) ownerGameCount;

    function createGame(address _white, address _black) public {
        uint256 id =
            games.push(
                ChessGame(msg.sender, _white, _black, true, defaultPosition)
            ) - 1;
        gameToOwner[id] = msg.sender;
        gameToPlayers[id] = [_white, _black];
        ownerGameCount[msg.sender] = ownerGameCount[msg.sender].add(1);
        emit NewGame(id, msg.sender, _white, _black);
    }
}
