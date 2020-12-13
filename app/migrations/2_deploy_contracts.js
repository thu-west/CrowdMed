const Registrar = artifacts.require("./Registrar.sol")
// const Summary = artifacts.require("./Summary.sol")
const Search = artifacts.require("./Search.sol")

module.exports = function(deployer) {
	deployer.deploy(Registrar);
	deployer.deploy(Search);
	// deployer.deploy(PPR);
};