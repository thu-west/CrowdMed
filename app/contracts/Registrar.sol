pragma solidity ^0.5.8;

import * as S from "./Summary.sol";

/*
* Contract mapping (hashed) real-world identifier to Ethereum address
* and address of summary contract
* Only authority can register new user
*/

contract Registrar {

	address public owner;

	struct IDdata {
		address ethAddr;
		string description;
		uint8 role; // 0 - Patient, 1 - Provider, 2 - Researcher
		S.Summary summContract;
	}
	
	struct userdata {
		string identifier;
		string description;
		uint8 role; // 0 - Patient, 1 - Provider, 2 - Researcher
	}

	// mapping of identifier to eth address
	mapping(string => IDdata) public IDlookup;
	
	mapping(address => userdata) public addrLookup;

	// events
	// event NewUserRegistered(string identifier);

	constructor() public {
		owner = msg.sender;
	}

	/* Register new user i.e. add newUser address to addressResgistry
	* Create new summary contract and add to contractRegistry
	*/
	function registerUser(string memory identifier, address newUser, string memory desc, uint8 roleIN) public {
		require(msg.sender == owner);
		// require(registry[identifier] == address(0), "User already exists");

		S.Summary summ = new S.Summary(newUser);
		IDlookup[identifier] = IDdata(newUser, desc, roleIN, summ);
		addrLookup[newUser] = userdata(identifier, desc, roleIN);
		// emit NewUserRegistered(identifier);
	}
}