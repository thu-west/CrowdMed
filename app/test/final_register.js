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

		// for(let idx = 1; idx < 509; idx++) {
		// 	web3.eth.personal.unlockAccount(accounts[idx], "123", 60000);
		// }

		// console.log("accounts unlocked");

		// Step 1: Register users
		let data_to_write = [];
		var counter = 0;
		for (counter = 0; counter < 500; counter++) {
			let patient_id = "Patient" + counter.toString();
			RC.registerUser(patient_id, patients[counter], "", 0, {from: auth})
			.on("transactionHash", hash => {
				let currTime = new Date()
				let d = {
					'time': currTime.getTime(),
					'txHash': hash
				}
				data_to_write.push(d);
			})
			.on("receipt", receipt => {
				// log_result(receipt)
			})
		}

		for (counter = 0; counter < 8; counter++) {
			var doctor_id = "Doctor" + counter.toString();
			RC.registerUser(doctor_id, doctors[counter], "", 1, {from: auth})
			.on("transactionHash", function(hash) {
				let currTime = new Date()
				let d = {
					'time': currTime.getTime(),
					'txHash': hash
				}
				data_to_write.push(d);
			})
			.on("receipt", function(receipt) {
				// log_receipt(receipt);
			})
		}

		console.log("users registered");

		setTimeout(function() {
			log_txhash(data_to_write);
		}, 120000)
	} catch (err) {
		console.log(err)
	}

}