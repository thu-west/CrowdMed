const Registrar = artifacts.require("Registrar");
const Summary = artifacts.require("Summary");

module.exports = async function(callback) {
	try {
		let RC = await Registrar.deployed();
	let accounts = await web3.eth.getAccounts();
	let auth = accounts[0];
	let patients = accounts.slice(1, 7);
	let doctors = accounts.slice(7, 10);
	

	// Step 1: Register users
	var counter = 0;
	for (counter = 0; counter < 6; counter++) {
		var patient_id = "Patient" + counter.toString();
		await RC.registerUser(patient_id, patients[counter], "", 0, {from: auth});
	}
	for (counter = 0; counter < 3; counter++) {
		var doctor_id = "Doctor" + counter.toString();
		await RC.registerUser(doctor_id, doctors[counter], "", 1, {from: auth});
	}
	
	var patient_SC = new Array(6);
	for(counter = 0; counter < 6; counter++) {
		patient_id = "Patient" + counter.toString();
		var temp = await RC.IDlookup(patient_id);
		patient_SC[counter] = await Summary.at(temp.summContract);
	}


	// Step 2A: Add permission group for each patient
	for (counter = 0; counter < 6; counter++) {
		log_result(await patient_SC[counter].newPermissionGroup("generic query", {from: patients[counter]}));
	}

	// Step 2B: Doctor0 adds 10 records for Patient
	for (counter = 0; counter < 6; counter++) {
		var record_counter = 0;
		for (record_counter = 0; record_counter < 10; record_counter++) {
			// get (qstring, hash) pair from file
			var resp = await axios.get('http://127.0.0.1:5000/get_entry')
			var query = resp.data.query;
			var hash = resp.data.hash;
			log_result(await patient_SC[counter].newRecord(query, hash, {from: doctors[0]}));
		}
	}

	// Step 3: For doctors[1:10]
	var idx = 1;
	for (idx = 1; idx < 10; idx++) {
		// For each patient
		for (counter = 0; counter < 500; counter++) {
			// Step 3A: Create PPR for doctors[idx]
			log_result(await patient_SC[counter].newPPR({from: doctors[idx]}));
			// Step 3B: Authorize doctors[idx] to previous data
			log_result(await patient_SC[counter].newPermission(doctors[idx], 0, {from: patients[counter]}));
			// Step 3C: doctors[idx] requests data
			log_result(await patient_SC[counter].transferData({from: doctors[idx]}));
			// Step 3D: doctors[idx] adds 10 records for patient
			for (record_counter = 0; record_counter < 10; record_counter++) {
				// get (qstring, hash) pair from file
				var resp = await axios.get('http://127.0.0.1:5000/get_entry')
				var query = resp.data.query;
				var hash = resp.data.hash;
				log_result(await patient_SC[counter].newRecord(query, hash, {from: doctors[idx]}));
			}
		}
	}
	} catch (err) {
		console.log(err)
	}

	done();

}