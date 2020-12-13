const axios = require('axios');

function log_txhash(result) {
	axios.post('http://127.0.0.1:5000/processData', result)
	  // .then(function (response) {
	  //   console.log(response);
	  // })
	  .catch(function (error) {
	    console.log(error);
	  });
}

module.exports = async function(callback) {
	try {
		let txList = await axios.get('http://127.0.0.1:5000/getList');
		
		let data_to_write = [];
		for (let idx = 0; idx < txList.data.length; idx++) {
			web3.eth.getTransactionReceipt(txList.data[idx], (err, receipt) => {
				if (err) console.log(txList.data[idx]);
				console.log(receipt);
				data_to_write.push({
					"txHash": txList.data[idx],
					"blockNumber": receipt.blockNumber,
					"gasUsed": receipt.gasUsed
				})
			})
		}



		setTimeout(function() {
			console.log(data_to_write.length);
			log_txhash(data_to_write);
		}, 300000)
	} catch (err) {
		console.log(err)
	}
}