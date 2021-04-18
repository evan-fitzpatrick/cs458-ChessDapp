pragma solidity >=0.5.0 <0.6.0;

import "./gamehelper.sol";

contract GameMove is GameHelper {

    function move(uint _gameId, uint8 _piece, uint8[2] _start, uint8[2] _destination) external onlyPlayerOf(_gameId) {
        // _piece corresponds to type of piece being moved. (E.g. black pawn, white knight, black rook, etc.)
        // Both _start and _destination are coordinate locations. (e.g. [0,0] = a1, [2,4] = c5)

        uint8[8][8] memory gameBoard = games[_gameId].board;

        require(_start[0] <= 7 && _start[1] <= 7 && _destination[0] <= 7 && _destination[1] <= 7); //Make sure move is on the board
        require(gameBoard[_start[0]][_start[1]] == _piece); //Require board matches with desired move

        //todo: logic to make sure move is allowed

        games[_gameId].board[_start[0]][_start[1]] = 0;
        games[_gameId].board[_destination[0]][_destination[1]] = _piece;
    }
}