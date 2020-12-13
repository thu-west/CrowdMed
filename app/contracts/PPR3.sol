pragma solidity ^0.5.8;

/*
* Contract denoting a patient-provider relationship
* Contains information needed to obtain patient's data
* And list of approved viewers
* With improvement 1: Store patient data in Summary contract
*/

contract PPR {
	address public owner; // owner of data i.e. patient
	address public viewer; // other party in PPR e.g. doctor
	uint256 public accessGroup;

	constructor(address owner_, address viewer_, uint256 accessGroup_) public {
        owner = owner_;
        viewer = viewer_;
        accessGroup = accessGroup_; // default empty string
	}
	
	// Allow patient to update accessPermissions
    function editPermission(uint256 accessGroup_) public {
        accessGroup = accessGroup_;
    }
}