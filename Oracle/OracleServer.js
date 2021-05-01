const Stockfish = require('stockfish');
const { Chess } = require('chess.js');
const ethers = require('ethers');
const OracleJSON = require('../build/contracts/Oracle.sol/Oracle.json')

const SLEEP_INTERVAL        = process.env.SLEEP_INTERVAL || 3000
const CHUNK_SIZE            = process.env.CHUNK_SIZE || 3
const MAX_RETRIES           = process.env.MAX_RETRIES || 5
var pendingRequests = []


function askStockFish(fenString, id) {
    return new Promise((resolve, reject) => {
        console.log("ORACLE request ID number:", id.toString(), "  Calling Stockfish!");
        var stockfish = Stockfish();

        stockfish.postMessage(`position fen ${fenString}`);
        stockfish.postMessage('go movetime 1000');

        stockfish.onmessage = (message) => {
            if (message.indexOf("bestmove") > -1) {
                //console.log("String returned by Stockfish:", message);

                let moveArray = message.split(' ');
                //console.log("Move made by Stockfish:",  moveArray[1]);

                resolve(moveArray[1]);
            }
        };
    });
}

async function validateLatestMove(proposedMove, fenString, id) {

    //console.log("Proposed Move:", proposedMove, "FEN string:", fenString);

    if(proposedMove.localeCompare('stockfish') === 0 ) {
        proposedMove = await askStockFish(fenString, id);
    }

    const chess = new Chess(fenString);

    //console.log("Testing Move:", proposedMove);

    if (proposedMove.localeCompare('(none)') === 0 || chess.move(proposedMove, { sloppy: true } ) === null) {
        console.log("ORACLE request ID number:", id.toString(), "  Error: Invalid Move!");
        return fenString;
    }

    //console.log(chess.ascii());

    return chess.fen();

}


async function filterEvents (OracleInstance) {
    OracleInstance.on('GetLatestMoveEvent', (proposedMove, fenString, caller, id) => {
        console.log("ORACLE request ID number:", id.toString(), "  From:", caller);
        pendingRequests.push({ proposedMove, fenString, caller, id });
    });

    OracleInstance.on('SetLatestMoveEvent', (fenString, nextMove, caller, id) => {
        console.log("ORACLE request ID number:", id.toString(), "  Old String:", fenString, "  New String:", nextMove);
    });
}

async function processQueue (OracleInstance) {
    //console.log("processing queue, length=", pendingRequests.length);
    let processedRequests = 0;
    while (pendingRequests.length > 0 && processedRequests < CHUNK_SIZE) {
        const request = pendingRequests.shift();
        //console.log("Request: ", request);
        await processRequest(OracleInstance, request.proposedMove, request.fenString, request.id, request.caller)
        processedRequests++
    }
}

async function processRequest (OracleInstance, proposedMove, fenString, id, caller) {
    let retries = 0;
    while (retries < MAX_RETRIES) {
        try {
            const nextMove = await validateLatestMove(proposedMove, fenString, id);
            await setLatestMoveLocal(OracleInstance, caller, fenString, nextMove, id)
            return
        } catch (error) {
            if (retries === MAX_RETRIES - 1) {
                await setLatestMoveLocal(OracleInstance, caller, fenString, 'processRequest Error', id)
                console.log("ORACLE request ID number:", id.toString(), "  Error: Bad Process Request!");
                return
            }
            retries++
        }
    }
}

async function setLatestMoveLocal (OracleInstance, callerAddress, fenString, nextMove, id) {

    //const idInt = ethers.BigNumber.from(id); // Not sure what this line is doing?

    try {
        await OracleInstance.setLatestMove(fenString, nextMove, callerAddress, id.toString());
        //await OracleInstance.
    } catch (error) {
        console.log('Error encountered while calling setLatestMove.')
        // Do some error handling
    }
}

async function init () {
    // get info for ganache or hardhat testnet
    const provider = await new ethers.providers.JsonRpcProvider();
    //console.log("provider", provider);

        //   the following 2 lines are used if contract is on rinkeby instead of ganache or hardhat testnet
        //let provider;
        //window.ethereum.enable().then(provider = new ethers.providers.Web3Provider(window.ethereum));

    const signer = await provider.getSigner()
    //console.log("signer", signer);
    const userAddress =  await signer.getAddress();
    //console.log("user address", userAddress);

    // initialize shadow contract

    let OracleInstance = null;
    const abi = OracleJSON.abi;
    //console.log(abi);

    // MAKE SURE YOU SET THIS CORRECTLY AFTER DEPLOYMENT OR NOTHING WILL WORK!!!!!
    OracleInstance = new ethers.Contract('0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512', abi, signer);

    // listen for events
    filterEvents(OracleInstance);

    return { OracleInstance, signer }
}

(async () => {
    const { OracleInstance, signer } = await init()
    process.on( 'SIGINT', () => {
        console.log('\nUser terminated program')
        process.exit( )
    })
    setInterval(async () => {
        await processQueue(OracleInstance)
    }, SLEEP_INTERVAL)
})()
