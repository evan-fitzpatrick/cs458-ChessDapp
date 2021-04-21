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

    const zombieNames = ["Zombie 1", "Zombie 2"];
    let CG;
    let CGInstance;
    let alice;
    let bob;



    // `beforeEach` will run before each test, re-deploying the contract every
    // time. It receives a callback, which can be async.

    beforeEach(async function () {
        [alice, bob] = await ethers.getSigners();
        CG = await ethers.getContractFactory("CryptoZombies");
        CGInstance = await CG.deploy();
    });


    // You can nest describe calls to create subsections.
    describe("Deployment and game creation", function () {
        it("Should be able to create a new game", async () => {
            await expect(CGInstance.createGame(alice.address))
                .to.emit(CGInstance, 'NewGame')
                //.withArgs(0, zombieNames[0], 8229335091878300);
            const x = await CGInstance.games(0);
            //console.log(x);
            expect(x.opponent).to.equal(alice.address);
        });
    });


    describe("Simple game ownership and transfer", function () {
        it("should transfer a zombie", async () => {
            const result = await CGInstance.createGame(alice.address);
            const gameId = 0;
            await CGInstance.transferFrom(alice.address, bob.address, gameId);
            const newOwner = await CGInstance.ownerOf(gameId);
            expect(newOwner).to.equal(bob.address);
        })
    });

    describe("Two-step transfer scenario", async () => {
        it("should approve and then transfer a zombie when the approved address calls transferFrom", async () => {
            const result = await CGInstance.createRandomZombie(zombieNames[0]);
            const zombieId = 0;
            await CGInstance.approve(bob.address, zombieId);
            await CGInstance.connect(bob).transferFrom(alice.address, bob.address, zombieId);
            const newOwner = await CGInstance.ownerOf(zombieId);
            expect(newOwner).to.equal(bob.address);
        })

        it("should approve and then transfer a zombie when the owner calls transferFrom", async () => {
            const result = await CGInstance.createRandomZombie(zombieNames[0]);
            const zombieId = 0;
            await CGInstance.approve(bob.address, zombieId);
            await CGInstance.transferFrom(alice.address, bob.address, zombieId);
            const newOwner = await CGInstance.ownerOf(zombieId);
            expect(newOwner).to.equal(bob.address);
        })
    })

     describe("attack scenarios", async () => {
         it("zombie should be able to attack another zombie", async () => {
            let result;

            result = await CGInstance.setCooldownTime(0);  // so we don't have to wait
            result = await CGInstance.createRandomZombie(zombieNames[0]);
            const firstZombieId = 0;
            result = await CGInstance.connect(bob).createRandomZombie(zombieNames[1]);
            const secondZombieId = 1;
            await CGInstance.attack(firstZombieId, secondZombieId);
            const z = await CGInstance.zombies(0);
            //console.log(z);
            expect(z[4]+z[5]).to.equal(1);
        })

        it("should be able to feed on a cryptokitty and create a new zombie", async () => {
            let result;
            result = await CGInstance.setCooldownTime(0);  // so we don't have to wait
            result = await CGInstance.createRandomZombie(zombieNames[0]);
            const firstZombieId = 0;
            await CGInstance.feedOnKitty(firstZombieId, 15);
            const newZombie = await CGInstance.zombies(1);
            expect (newZombie[0]).to.equal("NoName");
        })
    })

})
