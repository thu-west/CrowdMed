pragma solidity ^0.5.8;
/*
* Contract containing list of PPR contracts for a user
* With improvement 1: Store patient data in summary contract
*/

contract Summary {
	
	address public owner;

	enum statusEnum { Valid, Pending, Invalid } // pending - needs attention from owner
	struct PPRstruct {
		uint256 accessGroup;
		statusEnum currStatus;
	}
	mapping(address => PPRstruct) public PPRlist; // mapping of steward's address to PPRstruct
	address[] public stewardList; // array of stewards

	struct dataRecord {
		address creator;
		string queryString;
		string dataHash;
	}
	dataRecord[] public patientData; // data records
	uint256 public numRecords;
	string[] public accessGroups;
	string private researchAccess;

	// events
	event PPRadded(address steward);
	event statusUpdated(address steward);
	event permissionUpdated(address viewer);
	event newData(address provider);
	event dataTransferred(address requester);
	event permissionGroup();
	event GroupEdited(uint256 numGroup);
	event researchPermission();

	constructor(address owner_) public {
		owner = owner_;
		accessGroups.push("");
		researchAccess = "";
	}

	/* Add new PPR to PPRarray
	* PPR created by steward
	*  Default status "Pending"
	*/
	function newPPRsteward() public {
	    require(msg.sender != owner);
	    PPRlist[msg.sender] = PPRstruct(0, statusEnum.Pending);
	    stewardList.push(msg.sender);
	    emit PPRadded(msg.sender);
	}
	
	/* Overloaded function for PPR created by owner 
	* Default status "Valid"
	*/
	function newPPRpatient(address other, uint256 accessGroup_) public {
	    require(msg.sender == owner);
	    PPRlist[other] = PPRstruct(accessGroup_, statusEnum.Valid);
	    stewardList.push(other);
	    emit PPRadded(other);
	}
	

	/* Update PPR status */
	function updatePPR(address steward, statusEnum newStatus) public {
	    PPRlist[steward].currStatus = newStatus;
	    emit statusUpdated(steward);
	}

	function newRecord(string memory queryString_, string memory dataHash_) public {
		patientData.push(dataRecord(msg.sender, queryString_, dataHash_));
		numRecords = patientData.length;
	    emit newData(msg.sender);
	}

	function newPermission(address viewer, uint256 accessGroup_) public {
		require(msg.sender == owner);
		PPRlist[viewer].accessGroup = accessGroup_;
		emit permissionUpdated(viewer);
	}

	function newPermissionGroup(string memory queryString_) public {
		require(msg.sender == owner);
		accessGroups.push(queryString_);
		emit permissionGroup();
	}

	function updateResearch(string memory queryString_) public {
		require(msg.sender == owner);
		researchAccess = queryString_;
		emit researchPermission();
	}

	function getResearch() public returns(string memory) {
		require(msg.sender == owner);
		return researchAccess;
	}


	function editPermission(uint256 group_, string memory queryString_) public {
		require(msg.sender == owner);
		accessGroups[group_] = queryString_;
		emit GroupEdited(group_);
	}

	function transferData() public returns(string memory) {
		uint256 ret_group = PPRlist[msg.sender].accessGroup;
		string memory ret_val = accessGroups[ret_group];
		emit dataTransferred(msg.sender);
		return ret_val;
	}

	function transferResearcher() public returns(string memory) {
		emit dataTransferred(msg.sender);
		return researchAccess;
	}

	function getNumGroups() public returns(uint256) {
		return accessGroups.length;
	}

	function getAllStewards() public returns(address[] memory) {
		return stewardList;
	}
}