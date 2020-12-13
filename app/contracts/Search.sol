pragma solidity ^0.5.8;

/*
* Contract for searching for patients
*/

contract Search {

	address public owner; // registering authority

	
	mapping(string => address[]) public keywordIndex;
	mapping(address => string[]) private reverseIndex;

	// events
	event SearchEvent();
	event UpdateEvent();

	constructor() public {
		owner = msg.sender;
	}

	/* Register new user i.e. add newUser address to addressResgistry
	* Create new summary contract and add to contractRegistry
	*/
	function updateIndex(string memory tokens, address patient) public {
		keywordIndex[tokens].push(patient);
		reverseIndex[patient].push(tokens);
		emit UpdateEvent();
	}

	function getNumTags() public returns (uint256) {
		return reverseIndex[msg.sender].length;
	}

	function retrieveTags(uint256 idx) public returns (string memory){
		return reverseIndex[msg.sender][idx];
	}

	function searchIndex(string memory query) public returns (address[] memory) {
		emit SearchEvent();
		return keywordIndex[query];
	}
}