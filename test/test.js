// We import Chai to use its asserting functions here.
const chai = require("chai");
const { solidity } = require("ethereum-waffle");
chai.use(solidity);
const assertArrays = require('chai-arrays');
const { BigNumber } = require("@ethersproject/bignumber");
chai.use(assertArrays);
const { expect } = chai;

// `describe` is a Mocha function that allows you to organize your tests. It's
// not actually needed, but having your tests organized makes debugging them
// easier. All Mocha functions are available in the global scope.

// `describe` receives the name of a section of your test suite, and a callback.
// The callback must define the tests of that section. This callback can't be
// an async function.
describe("Wapuus ERC721", function () {
  // Mocha has four functions that let you hook into the the test runner's
  // lifecyle. These are: `before`, `beforeEach`, `after`, `afterEach`.

  // They're very useful to setup the environment for tests, and to clean it
  // up after they run.

  // A common pattern is to declare some variables, and assign them in the
  // `before` and `beforeEach` callbacks.

  let Token;
  let hardhatToken;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  // `beforeEach` will run before each test, re-deploying the contract every
  // time. It receives a callback, which can be async.
  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    Token = await ethers.getContractFactory("Wapuus_ERC721");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // To deploy our contract, we just have to call Token.deploy() and await
    // for it to be deployed(), which happens once its transaction has been
    // mined.
    hardhatToken = await Token.deploy();

    await hardhatToken.flipSaleState();
  });

  // You can nest describe calls to create subsections.
  describe("Deployment", function () {
    // `it` is another Mocha function. This is the one you use to define your
    // tests. It receives the test name, and a callback function.

    // If the callback function is async, Mocha will `await` it.
    it("Should set the right owner", async function () {
      // Expect receives a value, and wraps it in an Assertion object. These
      // objects have a lot of utility methods to assert values.

      // This test expects the owner variable stored in the contract to be equal
      // to our Signer's owner.
      expect(await hardhatToken.owner()).to.equal(owner.address);
    });
  });

  describe("Transactions", function () {

    it("Sale be able to be changed by owner", async function () {
      await hardhatToken.flipSaleState()
      expect(await hardhatToken.saleIsActive()).to.equal(
        false
      );
    });

    it("Owner reserve preminting", async function () {
      
      await hardhatToken.reserveWapuus(owner.address, 50)
    });

    it("Owner change mint price", async function () {
      await hardhatToken.setMintPrice(ethers.utils.parseUnits('0.01', 'ether'))
      expect(await hardhatToken.wapuuPrice()).to.equal(
        ethers.utils.parseUnits('0.01', 'ether')
      );
    });

    it("Minting works and changes total supply", async function () {
      const price = await hardhatToken.wapuuPrice()
      // Check balances.
      expect(await hardhatToken.totalSupply()).to.equal(0);
      
      await hardhatToken.connect(addr1).mintWapuus(1, {value: price.mul(1)})
      
      // Check balances.
      expect(await hardhatToken.totalSupply()).to.equal(1);
    });


    it("Exceed per mint limit", async function () {
      const price = await hardhatToken.wapuuPrice()
      
      //expect(await hardhatToken.connect(addr1).mintWapuus(21, {value: price})).to.be.reverted;
    });

    it("Withdrawl by owner", async function () {
      const price = await hardhatToken.wapuuPrice()
      // Check balances.
      expect(await hardhatToken.totalSupply()).to.equal(0);
      
      await hardhatToken.connect(addr1).mintWapuus(1, {value: price})
      
      //witdraw by owner
      await hardhatToken.withdraw()
      //await expect(() => hardhatToken.withdraw()).to.changeBalance(owner, 59963370207901401n);
    });

    it("Withdrawl by non-owner", async function () {
      //withdraw with other wallet
      //expect(await hardhatToken.connect(addr1).withdraw()).to.be.reverted;
    });

    it("Change license", async function () {
      await hardhatToken.changeLicense("test1")
      expect(await hardhatToken.LICENSE_TEXT()).to.equal(
        "test1"
      );
    });

    it("Lock license", async function () {
      await hardhatToken.changeLicense("test1")

      await hardhatToken.lockLicense()
      expect(hardhatToken.changeLicense("test2")).to.be.reverted;
    });

    it("Set baseURI", async function () {
      const price = await hardhatToken.wapuuPrice()
      await hardhatToken.mintWapuus(1, {value: price})
      
      await hardhatToken.setBaseURI("https://api.web3wp.com/wapuus/")
      expect(await hardhatToken.tokenURI(0)).to.equal(
        "https://api.web3wp.com/wapuus/0"
      );
    });

    it("Change Wapuu Name", async function () {
      const price = await hardhatToken.wapuuPrice()
      await hardhatToken.mintWapuus(1, {value: price})


      const renamePrice = await hardhatToken.wapuuRenamePrice()
      await hardhatToken.changeWapuuName(0,"Bubba Gumper", {value: renamePrice})
      expect(await hardhatToken.viewWapuuName(0)).to.equal(
        "Bubba Gumper"
      );
    });

    it("Owner change Royalty", async function () {
      await hardhatToken.setRoyaltyBPS(100)
      expect(await hardhatToken.royaltyBPS()).to.equal(
        100
      );
    });

    it("Get Royalties", async function () {
      //const royalties = await hardhatToken.getRoyalties(2);
      //console.log("Royalties" , royalties)

      const royalties2 = await hardhatToken.getRaribleV2Royalties(1);
      console.log("Royalties V2" , royalties2[0].account, royalties2[0].value.toString())
      expect(royalties2[0].account).to.equal(owner.address);

      const royalties3 = await hardhatToken.royaltyInfo(3,ethers.utils.parseUnits('1', 'ether'));
      console.log("Royalties Mintable" , ethers.utils.formatEther(royalties3.royaltyAmount))
      expect(royalties3.receiver).to.equal(owner.address);
    });
  });
});

describe("Wapuus ERC1155", function () {
  // Mocha has four functions that let you hook into the the test runner's
  // lifecyle. These are: `before`, `beforeEach`, `after`, `afterEach`.

  // They're very useful to setup the environment for tests, and to clean it
  // up after they run.

  // A common pattern is to declare some variables, and assign them in the
  // `before` and `beforeEach` callbacks.

  let Token;
  let hardhatToken;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  // `beforeEach` will run before each test, re-deploying the contract every
  // time. It receives a callback, which can be async.
  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    Token = await ethers.getContractFactory("Wapuus");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // To deploy our contract, we just have to call Token.deploy() and await
    // for it to be deployed(), which happens once its transaction has been
    // mined.
    hardhatToken = await Token.deploy();

    await hardhatToken.flipSaleState();
  });

  // You can nest describe calls to create subsections.
  describe("Deployment", function () {
    // `it` is another Mocha function. This is the one you use to define your
    // tests. It receives the test name, and a callback function.

    // If the callback function is async, Mocha will `await` it.
    it("Should set the right owner", async function () {
      // Expect receives a value, and wraps it in an Assertion object. These
      // objects have a lot of utility methods to assert values.

      // This test expects the owner variable stored in the contract to be equal
      // to our Signer's owner.
      expect(await hardhatToken.owner()).to.equal(owner.address);
    });
  });

  describe("Transactions", function () {

    it("Sale be able to be changed by owner", async function () {
      await hardhatToken.flipSaleState()
      expect(await hardhatToken.saleIsActive()).to.equal(
        false
      );
    });

    it("Owner reserve preminting", async function () {
      
      await hardhatToken.reserveWapuus(owner.address, 50)
    });

    it("Owner change mint price", async function () {
      await hardhatToken.setMintPrice(ethers.utils.parseUnits('0.01', 'ether'))
      expect(await hardhatToken.wapuuPrice()).to.equal(
        ethers.utils.parseUnits('0.01', 'ether')
      );
    });

    it("Minting works and changes total supply", async function () {
      const price = await hardhatToken.wapuuPrice();
      // Check balances.
      expect(await hardhatToken.totalSupply()).to.equal(0);
      
      await hardhatToken.connect(addr1).mintWapuus(1, {value: price.mul(1)})
      // Check balances.
      expect(await hardhatToken.totalSupply()).to.equal(1);
    });

    it("balanceOfWapuu() is accurate", async function () {
      const price = await hardhatToken.wapuuPrice();
      // Check balances.
      expect(await hardhatToken.balanceOfWapuu(owner.address)).to.equal(0);
      
      await hardhatToken.mintWapuus(10, {value: price.mul(10)})
      await hardhatToken.connect(addr1).mintWapuus(5, {value: price.mul(5)})

      // Check balances.
      expect(await hardhatToken.balanceOfWapuu(owner.address)).to.equal(10);
      expect(await hardhatToken.balanceOfWapuu(addr1.address)).to.equal(5);
    });

    it("tokensOfOwner() is accurate", async function () {
      const price = await hardhatToken.wapuuPrice();
      // Check balances.
      expect(await hardhatToken.tokensOfOwner(owner.address)).to.equalTo([]);
      
      await hardhatToken.mintWapuus(2, {value: price.mul(2)})

      // Check balances.
      let balance = await hardhatToken.tokensOfOwner(owner.address);
      expect(balance).to.be.array();
    });

    it("Exceed per mint limit", async function () {
      const price = await hardhatToken.wapuuPrice()
      //const response = await hardhatToken.connect(addr1).mintWapuus(21, {value: price.mul(21)})
      //await expect(response.wait()).to.be.reverted;
    });

    it("Withdrawl by owner", async function () {
      const price = await hardhatToken.wapuuPrice()
      // Check balances.
      expect(await hardhatToken.totalSupply()).to.equal(0);
      
      await hardhatToken.connect(addr1).mintWapuus(1, {value: price})
      
      //witdraw by owner
      await hardhatToken.withdraw()
      //await expect(() => hardhatToken.withdraw()).to.changeBalance(owner, 59963370207901401n);
    });

    it("Withdrawl by non-owner", async function () {
      //withdraw with other wallet
      //expect(await hardhatToken.connect(addr1).withdraw()).to.be.reverted;
    });

    it("Change license", async function () {
      await hardhatToken.changeLicense("test1")
      expect(await hardhatToken.LICENSE_TEXT()).to.equal(
        "test1"
      );
    });

    it("Lock license", async function () {
      await hardhatToken.changeLicense("test1")

      await hardhatToken.lockLicense()
      //expect(await hardhatToken.changeLicense("test2")).to.be.reverted;
    });

    it("Check baseURI", async function () {
      const price = await hardhatToken.wapuuPrice()
      await hardhatToken.mintWapuus(1, {value: price})
      
      expect(await hardhatToken.uri(0)).to.equal(
        "https://api.web3wp.com/wapuus/{id}"
      );
    });

    it("Set baseURI", async function () {
      await hardhatToken.setURI("https://api.web3wp.com/test/{id}")
      expect(await hardhatToken.uri(1)).to.equal(
        "https://api.web3wp.com/test/{id}"
      );
    });

    it("Change Wapuu Name", async function () {
      const price = await hardhatToken.wapuuPrice()
      await hardhatToken.mintWapuus(1, {value: price})


      const renamePrice = await hardhatToken.wapuuRenamePrice()
      await hardhatToken.changeWapuuName(0,"Bubba Gumper", {value: renamePrice})
      expect(await hardhatToken.viewWapuuName(0)).to.equal(
        "Bubba Gumper"
      );
    });

    it("Owner change Royalty", async function () {
      await hardhatToken.setRoyaltyBPS(100)
      expect(await hardhatToken.royaltyBPS()).to.equal(
        100
      );
    });

    it("Get Royalties", async function () {
      //const royalties = await hardhatToken.getRoyalties(2);
      //console.log("Royalties" , royalties)

      const royalties2 = await hardhatToken.getRaribleV2Royalties(1);
      console.log("Royalties V2" , royalties2[0].account, royalties2[0].value.toString())
      expect(royalties2[0].account).to.equal(owner.address);
      
      const royalties3 = await hardhatToken.royaltyInfo(3,ethers.utils.parseUnits('1', 'ether'));
      console.log("Royalties Mintable" , ethers.utils.formatEther(royalties3.royaltyAmount))
      expect(royalties3.receiver).to.equal(owner.address);
    });
  });
});