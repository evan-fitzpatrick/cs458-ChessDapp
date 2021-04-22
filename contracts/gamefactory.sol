pragma solidity >=0.5.0 <0.6.0;

import "./ownable.sol";
import "./safemath.sol";

contract GameFactory is Ownable {

    using SafeMath for uint256;
    using SafeMath32 for uint32;
    using SafeMath16 for uint16;
    using SafeMath8 for uint8;

    event NewGame(uint gameId, address owner, address player1, address player2);

    //Using integers to represent pieces.
    // 0 = blank square
    // 1 = pawn
    // 2 = knight
    // 3 = bishop
    // 4 = rook
    // 5 = queen
    // 6 = king
    // adding 8 makes it a black piece (e.g. 9 = (1 + 8), so that's a black pawn
    // Might be a good idea to revise this for clarity later.

    string defaultPosition = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

    struct ChessGame {
        address owner;
        address player1;
        address player2;

        string position;
    }

    ChessGame[] public games;

    mapping (uint => address) public gameToOwner;
    mapping (uint => address[2]) public gameToPlayers;
    mapping (address => uint) ownerGameCount;

    function createGame(address _player1, address _player2) public {
        uint id = games.push(ChessGame(msg.sender, _player1, _player2, defaultPosition)) - 1;
        gameToOwner[id] = msg.sender;
        gameToPlayers[id] = [_player1, _player2];
        ownerGameCount[msg.sender] = ownerGameCount[msg.sender].add(1);
        emit NewGame(id, msg.sender, _player1, _player2);
    }
}
