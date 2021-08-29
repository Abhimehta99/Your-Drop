var SimpleStorage = artifacts.require("SimpleStorage");

module.exports = async function(deployer) {
  deployer.deploy(SimpleStorage);
};
