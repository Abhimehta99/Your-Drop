const path = require("path");
const MNEMONIC="Add you MNEMONIC here";
const HDWalletProvider = require("@truffle/hdwallet-provider");
const AccountIndex = 0;

module.exports = {
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    //testnet
    goerli_infura: {
      provider: function() {
        return new HDWalletProvider(MNEMONIC, "https://goerli.infura.io/v3/1d4a6ed69f994fcf87d2e2dad7d42ccf", AccountIndex)
      },
      network_id: 5
    }
  },
  compilers: {
    solc: {
      version:"^0.8.1",//setting solc version
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
};
