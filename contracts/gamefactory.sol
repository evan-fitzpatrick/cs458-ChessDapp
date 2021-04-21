pragma solidity >=0.5.0 <0.6.0;

import "./ownable.sol";
import "./safemath.sol";

contract GameFactory is Ownable {

    using SafeMath for uint256;
    using SafeMath32 for uint32;
    using SafeMath16 for uint16;
    using SafeMath8 for uint8;

    event NewGame(uint gameId, address owner, address opponent);

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

    uint8[8][8] startingBoard = [[12, 10, 11, 13, 14, 11, 10, 12],
        [9, 9, 9, 9, 9, 9, 9, 9],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [4, 2, 3, 5, 6, 3, 2, 4]];

    struct ChessGame {
        uint8[8][8] board;
        address owner;
        address opponent;
        bool whitesTurn;
    }

    ChessGame[] public games;

    mapping (uint => address) public gameToOwner;
    mapping (uint => address[2]) public gameToPlayers;
    mapping (address => uint) ownerGameCount;

    function createGame(address _player2) public {
        uint id = games.push(ChessGame(startingBoard, msg.sender, _player2, true)) - 1;
        gameToOwner[id] = msg.sender;
        gameToPlayers[id] = [msg.sender, _player2];
        ownerGameCount[msg.sender] = ownerGameCount[msg.sender].add(1);
        emit NewGame(id, msg.sender, _player2);
    }
}
