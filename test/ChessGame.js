//const utils = require("./helpers/utils");
//const { time } = require("@openzeppelin/test-helpers");
const { expect } = require('chai');
//const waffle = require('ethereum-waffle');
const { waffle } = require("hardhat");
const { deployContract } = waffle;
const provider = waffle.provider;


// `describe` is a Mocha function that allows you to organize your test. It's
// not actually needed, but having your test organized makes debugging them
// easier. All Mocha functions are available in the global scope.

// `describe` receives the name of a section of your test suite, and a callback.
// The callback must define the test of that section. This callback can't be
// an async function.


describe("ChessGame", function () {
    // Mocha has four functions that let you hook into the the test runner's
    // lifecyle. These are: `before`, `beforeEach`, `after`, `afterEach`.

    // They're very useful to setup the environment for test, and to clean it
    // up after they run.

    // A common pattern is to declare some variables, and assign them in the
    // `before` and `beforeEach` callbacks.

    let CG;
    let CGInstance;
    let AppContractFactory;
    let AppInstance;
    let OracleContractFactory;
    let OracleInstance;
    let alice;
    let bob;
    let billy;


    // `beforeEach` will run before each test, re-deploying the contract every
    // time. It receives a callback, which can be async.

    beforeEach(async function () {
        [alice, bob, billy] = await ethers.getSigners();
        CG = await ethers.getContractFactory("ChessGame");
        CGInstance = await CG.deploy();
        AppContractFactory = await ethers.getContractFactory("AppContract");
        AppInstance = await AppContractFactory.deploy();
        OracleContractFactory = await ethers.getContractFactory("Oracle");
        OracleInstance = await OracleContractFactory.deploy();
    });


    // You can nest describe calls to create subsections.
    describe("Deployment and game creation", function () {
        it("Should be able to create a new game", async () => {
            await expect(CGInstance.createGame(alice.address, billy.address))
                .to.emit(CGInstance, 'NewGame')
                //.withArgs(0, zombieNames[0], 8229335091878300);
            const x = await CGInstance.games(0);
            //console.log(x);
            expect(x.white).to.equal(alice.address);
        });
    });


    describe("Simple game ownership and transfer", function () {
        it("should transfer a zombie", async () => {
            const result = await CGInstance.createGame(alice.address, billy.address);
            const gameId = 0;
            await CGInstance.transferFrom(alice.address, bob.address, gameId);
            const newOwner = await CGInstance.ownerOf(gameId);
            expect(newOwner).to.equal(bob.address);
        })
    });

    describe("Two-step transfer scenario", async () => {
        it("should approve and then transfer a game when the approved address calls transferFrom", async () => {
            const result = await CGInstance.createGame(alice.address, billy.address);
            const gameId = 0;
            await CGInstance.approve(bob.address, gameId);
            await CGInstance.connect(bob).transferFrom(alice.address, bob.address, gameId);
            const newOwner = await CGInstance.ownerOf(gameId);
            expect(newOwner).to.equal(bob.address);
        })

        it("should approve and then transfer a game when the owner calls transferFrom", async () => {
            const result = await CGInstance.createGame(alice.address, billy.address);
            const gameId = 0;
            await CGInstance.approve(bob.address, gameId);
            await CGInstance.transferFrom(alice.address, bob.address, gameId);
            const newOwner = await CGInstance.ownerOf(gameId);
            expect(newOwner).to.equal(bob.address);
        })
    })

    describe("Testing Position of the board", function () {
        it("should initialize board to the correct value", async () => {
            const result = await CGInstance.createGame(alice.address, billy.address);
            const gameId = 0;
            const position = await CGInstance.getPosition(gameId);
            expect(position).to.equal("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
        })
/*
        it("should be able to change the position of the board", async () => {
            const result = await CGInstance.createGame(alice.address, billy.address);
            const gameId = 0;
            await CGInstance.setPosition(gameId, "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1");
            const position = await CGInstance.getPosition(gameId);
            expect(position).to.equal("rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1");
        })
*/

        it("should be able to change the position of the board", async () => {
            const result = await CGInstance.createGame(alice.address, billy.address);
            const gameId = 0;
            console.log("Test 1");
            await CGInstance.setPosition(gameId, "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1");
            console.log("Iest 2");
            const position = await CGInstance.getPosition(gameId);
            console.log(position);
            expect(position).to.equal("rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1");
        })

/*
        it("should be able to make a move", async () => {
            const result = await CGInstance.createGame(alice.address, billy.address);
            const gameId = 0;
            console.log("Test 1");
            await CGInstance.makeMove(gameId, "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1");
            console.log("Test 2");
            const position = await CGInstance.getPosition(gameId);
            console.log(position);
            expect(position).to.equal("rnbqkbnr/pppppppp/8/8/8/2N5/PPPPPPPP/R1BQKBNR b KQkq - 1 1");
        })
*/
    })

    describe("Application Contract should call Oracle", function () {
        it ("Should emit event when setting oracle contract address", async () => {
            await expect(AppInstance.setOracleInstanceAddress(OracleInstance.address))
                .to.emit(AppInstance,'newOracleAddressEvent')
                .withArgs(OracleInstance.address);
        })

        it("Should emit a GOT NEW REQUEST message", async () => {
            const _fenString = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
            await AppInstance.setOracleInstanceAddress(OracleInstance.address);
            //await expect(AppInstance.updateEthPrice())
            await expect(AppInstance.requestNextMove('b1c3',_fenString))
                .to.emit(AppInstance, 'ReceivedNewRequestIdEvent')
        })
    })
})
