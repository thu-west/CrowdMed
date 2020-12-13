const Search = artifacts.require("Search");
const axios = require('axios');

function log_result(result) {
	axios.post('http://127.0.0.1:5000/log_search', result)
	  // .then(function (response) {
	  //   console.log(response);
	  // })
	  .catch(function (error) {
	    console.log(error);
	  });
}




module.exports = async function(callback) {
	let SC = await Search.deployed();
	let accounts = await web3.eth.getAccounts();
	var auth = accounts[0];
	var patientA = accounts[1];
	var doctor = accounts[2];
	var researcher = accounts[3];
	var patientB = accounts[4];

	log_result(await SC.updateIndex("gender:female", patientA, {from:patientA}));
	log_result(await SC.updateIndex("age:50", patientA, {from:patientA}));
	log_result(await SC.updateIndex("weight:70", patientA, {from:patientA}));
	log_result(await SC.updateIndex("height:170", patientA, {from:patientA}));
	log_result(await SC.searchIndex("gender:female", {from:researcher}));
	log_result(await SC.searchIndex("diabetes", {from:researcher}));
	log_result(await SC.updateIndex("gender:female", patientB, {from:patientB}));
	log_result(await SC.updateIndex("age:40", patientB, {from:patientB}));
	log_result(await SC.updateIndex("weight:50", patientB, {from:patientB}));
	log_result(await SC.updateIndex("height:160", patientB, {from:patientB}));
	log_result(await SC.updateIndex("diabetes", patientA, {from:doctor}));
	log_result(await SC.updateIndex("diabetes", patientB, {from:doctor}));

	log_result(await SC.searchIndex("gender:female", {from:researcher}));
	log_result(await SC.searchIndex("diabetes", {from:researcher}));
	log_result(await SC.searchIndex("age:40", {from:researcher}));
	log_result(await SC.searchIndex("weight:50", {from:researcher}));
	log_result(await SC.searchIndex("height:100", {from:researcher}));

	done();

}