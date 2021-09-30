require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("@nomiclabs/hardhat-etherscan");
require('dotenv').config();


// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.7",
    settings: {
      optimizer: {
        enabled: true,
        runs: 100,
      },
    },
  },
  networks: {
    hardhat: {
      mining: {
        //auto: false,
        //interval: [10000, 15000]
      }
    },
    rinkeby: { //for deploying to Rinkeby testnet (compatible with Opensea)
      url: process.env.RINKEBY_RPC,
      accounts: [process.env.RINKEBY_PRIVATE_KEY],
      gasMultiplier: 1
    },
    mainnet: { //for deploying to mainnet
      url: process.env.MAINNET_RPC,
      accounts: [process.env.MAINNET_PRIVATE_KEY],
      gasMultiplier: 1.2 //don't want this to fail!
    },
  },
  gasReporter: {
    currency: 'USD',
    // Your API key for Coinmarketcap
    // Optional, allows getting gas price estimates in currency
    coinmarketcap: process.env.COINMARKETCAP_KEY
  },
  etherscan: {
    // Your API key for Etherscan. Only needed for the hardhat-etherscan plugin for verifying contracts
    // Obtain one at https://etherscan.io/
    apiKey: process.env.ETHERSCAN_KEY
  }
};
