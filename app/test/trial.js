const Registrar = artifacts.require("Registrar");
const Summary = artifacts.require("Summary");

const axios = require('axios');

function log_result(result) {
	axios.post('http://127.0.0.1:5000/log_trial', result)
	  // .then(function (response) {
	  //   console.log(response);
	  // })
	  .catch(function (error) {
	    console.log(error);
	  });
}




module.exports = async function(callback) {
	let RC = await Registrar.deployed();
	let accounts = await web3.eth.getAccounts();
	var auth = accounts[0];
	var patientA = accounts[1];
	var doctorA = accounts[2];
	var doctorB = accounts[3];

	// Step 1: Register users
	log_result(await RC.registerUser("PatientA", accounts[1], {from: auth}));
	log_result(await RC.registerUser("DoctorA", accounts[2], {from: auth}));
	log_result(await RC.registerUser("DoctorB", accounts[3], {from: auth}));

	// var patientAsumm;
	// var doctorAsumm;
	// var doctorBsumm;
	let patientAsumm = await RC.contractRegistry("PatientA");
	// RC.contractRegistry("PatientA").then(function(result) {patientAsumm = result; console.log(patientAsumm);});
	// RC.contractRegistry("DoctorA").then(function(result) {doctorAsumm = result});
	// RC.contractRegistry("DoctorB").then(function(result) {doctorBsumm = result});
	// console.log(patientAsumm);
	let patientA_SC = await Summary.at(patientAsumm);
	// let doctorA_SC = await Summary.at(doctorAsumm);
	// let doctorB_SC = await Summary.at(doctorBsumm);

	// Step 2: PatientA - DoctorA relationship
	log_result(await patientA_SC.newPPR({from: doctorA}));
	// TODO: fix storing contract address in steward's SC
	// and in step 4
	// doctorA_SC.newPPR({from: patientA}).then(function(result) {
	// 	log_result(result);
	// });

	// Step3: DoctorA adds 30 records for patient A
	var counter = 0;
	for (counter = 0; counter < 30; counter++) {
		qstring = "select where id=A" + counter.toString();
		hash = "pAdA_" + counter.toString();
		log_result(await patientA_SC.newRecord(qstring, hash, {from: doctorA}));
	}


	// Step 4: PatientA authorize DoctorB to full history
	try {
		log_result(await patientA_SC.newPermission(accounts[3], "select where id=A", {from: patientA}));
	} catch (err) {
		console.log(err);
	}
	// Step 5: DoctorB requests full PatientA data
	log_result(await patientA_SC.transferData({from: doctorB}));

	// Step 6: PatientA - DoctorB relationship
	log_result(await patientA_SC.newPPR({from: doctorB}));
	// TODO
	// doctorB_SC.newPPR({from: patientA}).then(function(result) {
	// 	log_result(result);
	// });
	
	// Step 7: DoctorB adds 10 records for PatientA
	for (counter = 0; counter < 10; counter++) {
		qstring = "select where id=A" + counter.toString();
		hash = "pAdB_" + counter.toString();
		log_result(await patientA_SC.newRecord(qstring, hash, {from: doctorB}));
	}

	// Step 8: PatientA authorize DoctorA to full history
	try {
		log_result(await patientA_SC.newPermission(accounts[2], "select where id=A", {from: patientA}));
	} catch (err) {
		console.log(err);
	}
	// Step 9: DoctorA requests PatientA data
	log_result(await patientA_SC.transferData({from: doctorA}));


	// Step 10: DoctorA adds 10 records for PatientA
	for (counter = 30; counter < 40; counter++) {
		qstring = "select where id=A" + counter.toString();
		hash = "pAdA_" + counter.toString();
		log_result(await patientA_SC.newRecord(qstring, hash, {from: doctorA}));
	}

	// Step 11: DoctorB requests patientA data
	log_result(await patientA_SC.transferData({from: doctorB}));

	done();

}