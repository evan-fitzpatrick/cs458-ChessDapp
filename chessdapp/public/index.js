import { new_move } from "./chessboard_gui.js";
import { COLOR } from "./src/cm-chessboard/Chessboard.js";
import initBlockchain from "./init_blockchain.js";

// global variables (default values)
var player_color = COLOR.white;
var game_id = "_";

// connect to contract
var chess_contract;
var provider;
var signer;
var userAddress;

initBlockchain().then(contract_data => {
    chess_contract = contract_data.chess_contract;
    provider = contract_data.provider;
    signer = contract_data.signer;
    userAddress = contract_data.userAddress;
})
    .then(() => initialize_page())
    .catch(err => console.log(err));

// setup gui interactions and event listeners
function initialize_page() {

    // wait for "start_new_game" button to be clicked
    document.getElementById("start_new_game").onclick = async (e) => {
        // if there is already a game in process, confirm with the user
        if (game_id != "_") {
            if (!window.confirm("Stop This Game and Start a new One?")) {
                return;
            }
        }

        // read and confirm player_2 address from text input
        const opponent_address = document.getElementById("other_player_address").value;

        if (opponent_address != "" && !ethers.utils.isAddress(opponent_address)) {
            window.alert("Invalid Opponent address! (leave blank to play against Stockfish)");
            document.getElementById("other_player_address").value = "";
            return;
        }

        // send a new game request to the contract
        chess_contract.createGame(userAddress, opponent_address);
    }


    // event NewGame(uint gameId, address owner, address player1, address player2);

    // Listen for a game I just started
    const my_game_filter = chess_contract.filters.NewGame(null, null, userAddress, null);
    chess_contract.on(my_game_filter, (id, sender, player_1, player_2) => {
        game_id = id;
        player_color = COLOR.white;

        // start game
        new_move(player_color, game_id, "start", chess_contract);

        setup_move_listener();
    });

    // Listen for a game someone else started with me
    const other_game_filter = chess_contract.filters.NewGame(null, null, null, userAddress);
    chess_contract.on(other_game_filter, (id, sender, player_1, player_2) => {
        if (window.confirm(`Accept new Game with: ${sender}?`)) {
            game_id = id;
            player_color = COLOR.black;

            setup_move_listener();
        }
    });


    // moveSuccessful event : (game_id, fen_string)

    let move_successful_filter;

    function setup_move_listener() {
        // stop listening for old game_id
        chess_contract.off(move_successful_filer);

        // setup filter for current game_id
        move_successful_filter = chess_contract.filters.moveSuccessful(game_id, null);

        chess_contract.on(move_successful_filter, (id, fen) => {
            new_move(player_color, game_id, fen, chess_contract);
        });
    }
}

