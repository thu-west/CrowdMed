const Registrar = artifacts.require("Registrar");
const Summary = artifacts.require("Summary");

const axios = require('axios');

function log_txhash(result) {
	axios.post('http://127.0.0.1:5000/logHash', result)
	  // .then(function (response) {
	  //   console.log(response);
	  // })
	  .catch(function (error) {
	    console.log(error);
	  });
}

function log_result(result) {
	axios.post('http://127.0.0.1:5000/logReceipt', result)
	  // .then(function (response) {
	  //   console.log(response);
	  // })
	  .catch(function (error) {
	    console.log(error);
	  });
}


module.exports = async function(callback) {
	try {
		let RC = await Registrar.deployed();
		let accounts = await web3.eth.getAccounts();
		let auth = accounts[0];
		let patients = accounts.slice(1, 501);
		let doctors = accounts.slice(501, 509);

		await web3.eth.personal.unlockAccount(patients[0], "123", 60000);

		console.log("accounts unlocked");

		// Step 5: Data retrieval
		let temp = await RC.IDlookup("Patient0");
		console.log(temp.summContract);
		let SC = await Summary.at(temp.summContract);
		
		let data_to_write = [];
		for(let count = 0; count < 500; count++) {
			SC.transferData({from: doctors[0]})
			.on("transactionHash", hash => {
				let currTime = new Date()
				let d = {
					'time': currTime.getTime(),
					'txHash': hash
				}
				data_to_write.push(d);
			})
		}
		

		setTimeout(function() {
			log_txhash(data_to_write);
		}, 120000)

		// 		// get SC data
		// 		let temp = await RC.IDlookup(patient_id);
		// 		patient_SC[counter] = await Summary.at(temp.summContract);
		// 		// SC loaded
		// 		// doctor0 add records
		// 		let record_counter = 0;
		// 		for (record_counter = 0; record_counter < 5; record_counter++) {
		// 			var query = "163353";
		// 			var hash = "1259408622";
		// 			patient_SC[counter].newRecord(query, hash, {from: doctors[0]})
		// 			.on("transactionHash", function(hash) {
		// 				let currTime = new Date()
		// 				let d = {
		// 					'time': currTime.getTime(),
		// 					'txHash': hash
		// 				}
		// 				log_txhash(d);
		// 			})
		// 			.on("receipt", function(receipt) {
		// 				log_receipt(receipt);
		// 			})
		// 		}
		// 		// create permission group
		// 		let qstring = '{"rec":["163353","145834"],"fields":{"AdmissionInfo":["HADM_ID"],"PatientInfo":["DOD_HOSP","DOD_SSN","EXPIRE_FLAG"],"Prescriptions":["HADM_ID","ICUSTAY_ID","STARTDATE","ENDDATE","DRUG"]}}'
		// 		patient_SC[counter].newPermissionGroup(qstring, {from: patients[counter]})
		// 		.on("transactionHash", function(hash) {
		// 			let currTime = new Date()
		// 			let d = {
		// 				'time': currTime.getTime(),
		// 				'txHash': hash
		// 			}
		// 			log_txhash(d);
		// 		})
		// 		.on("receipt", function(receipt) {
		// 			log_receipt(receipt);
		// 			// permission group created
		// 			// authorise doctors1-7
		// 			for (let doctor_idx = 1; doctor_idx < 8; doctor_idx++) {
		// 				patient_SC[counter].newPPRpatient(doctors[doctor_idx], 1, {from: doctors[idx]})
		// 				.on("transactionHash", function(hash) {
		// 					let currTime = new Date()
		// 					let d = {
		// 						'time': currTime.getTime(),
		// 						'txHash': hash
		// 					}
		// 					log_txhash(d);
		// 				})
		// 				.on("receipt", function(receipt) {
		// 					log_receipt(receipt);
		// 					// doctors[doctor_idx] authorised
		// 					// doctors[doctor_idx] retrieve data
		// 					patient_SC[counter].transferData({from: doctors[doctor_idx]})
		// 					.on("transactionHash", function(hash) {
		// 						let currTime = new Date()
		// 						let d = {
		// 							'time': currTime.getTime(),
		// 							'txHash': hash
		// 						}
		// 						log_txhash(d);
		// 					})
		// 					.on("receipt", function(receipt) {
		// 						log_receipt(receipt);
		// 					})
		// 				})
		// 			}
		// 		})
		// 		// doctors1-7 add data
		// 		for (let doctor_idx = 1; doctor_idx < 8; doctor_idx++) {
		// 			for (record_counter = 0; record_counter < 5; record_counter++) {
		// 				// get (qstring, hash) pair from file
		// 				var query = "163353";
		// 				var hash = "1259408622";
		// 				patient_SC[counter].newRecord(query, hash, {from: doctors[doctor_idx]})
		// 				.on("transactionHash", function(hash) {
		// 					let currTime = new Date()
		// 					let d = {
		// 						'time': currTime.getTime(),
		// 						'txHash': hash
		// 					}
		// 					log_txhash(d);
		// 				})
		// 				.on("receipt", function(receipt) {
		// 					log_receipt(receipt);
		// 				})
		// 			}
		// 		}
		// 	})
		// }
		// for (counter = 0; counter < 8; counter++) {
		// 	var doctor_id = "Doctor" + counter.toString();
		// 	RC.registerUser(doctor_id, doctors[counter], "", 1, {from: auth})
		// 	.on("transactionHash", function(hash) {
		// 		let currTime = new Date()
		// 		let d = {
		// 			'time': currTime.getTime(),
		// 			'txHash': hash
		// 		}
		// 		log_txhash(d);
		// 	})
		// 	.on("receipt", function(receipt) {
		// 		log_receipt(receipt);
		// 	})
		// }

		// console.log("users registered");
		// let patient_id = "Patient0";
		// console.log(await RC.owner.call());
		// console.log(await RC.IDlookup(patient_id));
		
		// var patient_SC = new Array(10);
		// for(counter = 0; counter < 10; counter++) {
		// 	patient_id = "Patient" + counter.toString();
		// 	var temp = await RC.IDlookup(patient_id);
		// 	// console.log(temp.summContract);
		// 	patient_SC[counter] = await Summary.at(temp.summContract);
		// }


		// // Step 2A: Add permission group for each patient
		// for (counter = 0; counter < 10; counter++) {
		// 	let qstring = '{"rec":["163353","145834"],"fields":{"AdmissionInfo":["HADM_ID"],"PatientInfo":["DOD_HOSP","DOD_SSN","EXPIRE_FLAG"],"Prescriptions":["HADM_ID","ICUSTAY_ID","STARTDATE","ENDDATE","DRUG"]}}'
		// 	patient_SC[counter].newPermissionGroup(qstring, {from: patients[counter]})
		// 	.on("transactionHash", function(hash) {
		// 		let currTime = new Date()
		// 		let d = {
		// 			'time': currTime.getTime(),
		// 			'txHash': hash
		// 		}
		// 		log_txhash(d);
		// 	})
		// 	.on("receipt", function(receipt) {
		// 		log_receipt(receipt);
		// 	})
		// }

		// Step 2B: Doctor0 adds 5 records for Patient
		// for (counter = 0; counter < 10; counter++) {
		// 	let record_counter = 0;
		// 	for (record_counter = 0; record_counter < 5; record_counter++) {
		// 		var query = "163353";
		// 		var hash = "1259408622";
		// 		patient_SC[counter].newRecord(query, hash, {from: doctors[0]})
		// 		.on("transactionHash", function(hash) {
		// 			let currTime = new Date()
		// 			let d = {
		// 				'time': currTime.getTime(),
		// 				'txHash': hash
		// 			}
		// 			log_txhash(d);
		// 		})
		// 		.on("receipt", function(receipt) {
		// 			log_receipt(receipt);
		// 		})
		// 	}
		// }

		// // Step 3: For doctors[1:10]
		// var idx = 1;
		// for (idx = 1; idx < 4; idx++) {
		// 	// For each patient
		// 	for (counter = 0; counter < 10; counter++) {
		// 		// Step 3A: Create PPR for doctors[idx]
		// 		patient_SC[counter].newPPRpatient(doctors[idx], 1, {from: doctors[idx]})
		// 		.on("transactionHash", function(hash) {
		// 			let currTime = new Date()
		// 			let d = {
		// 				'time': currTime.getTime(),
		// 				'txHash': hash
		// 			}
		// 			log_txhash(d);
		// 		})
		// 		.on("receipt", function(receipt) {
		// 			log_receipt(receipt);
		// 		})
		// 		// Step 3C: doctors[idx] requests data
		// 		patient_SC[counter].transferData({from: doctors[idx]})
		// 		.on("transactionHash", function(hash) {
		// 			let currTime = new Date()
		// 			let d = {
		// 				'time': currTime.getTime(),
		// 				'txHash': hash
		// 			}
		// 			log_txhash(d);
		// 		})
		// 		.on("receipt", function(receipt) {
		// 			log_receipt(receipt);
		// 		})
		// 		// Step 3D: doctors[idx] adds 10 records for patient
		// 		for (record_counter = 0; record_counter < 5; record_counter++) {
		// 			// get (qstring, hash) pair from file
		// 			var query = "163353";
		// 			var hash = "1259408622";
		// 			patient_SC[counter].newRecord(query, hash, {from: doctors[idx]})
		// 			.on("transactionHash", function(hash) {
		// 				let currTime = new Date()
		// 				let d = {
		// 					'time': currTime.getTime(),
		// 					'txHash': hash
		// 				}
		// 				log_txhash(d);
		// 			})
		// 			.on("receipt", function(receipt) {
		// 				log_receipt(receipt);
		// 			})
		// 		}
		// 	}
		// }
	} catch (err) {
		console.log(err)
	}

}