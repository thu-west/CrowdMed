from flask import Flask, request, jsonify
import json
import random
app = Flask(__name__)

@app.route('/')
def hello_world():
    return 'Hello, World!'

@app.route('/logHash', methods=['POST'])
def loghash():
	content = request.get_json(force=True)
	with open("txhash.txt", "a+") as fo:
		fo.write(json.dumps(content))
		fo.write("\n")

	return 'Hello, World!'

@app.route('/logReceipt', methods=['POST'])
def logreceipt():
	content = request.get_json(force=True)
	with open("txReceipt.txt", "a+") as fo:
		fo.write(json.dumps(content))
		fo.write("\n")

	return 'Hello, World!'

@app.route('/log_base', methods=['POST'])
def log_event():
	content = request.get_json(force=True)
	d = {}
	try:
		d['tx'] = content['tx']
		d['gasUsed'] = content['receipt']['gasUsed']
		d['cumulativeGasUsed'] = content['receipt']['cumulativeGasUsed']
		d['logs'] = [{'logIndex': x['logIndex'], 'event': x['event'], 'args': x['args']} for x in content['logs']]
		with open("logs_expt_base.txt","a+") as fo:
			fo.write(json.dumps(d))
			fo.write("\n")
	except:
		print(content)
	
	return 'Hello, World!'

@app.route('/log_base_mem', methods=['POST'])
def log_event_mem():
	content = request.get_json(force=True)
	d = {}
	try:
		d['tx'] = content['tx']
		d['gasUsed'] = content['receipt']['gasUsed']
		d['cumulativeGasUsed'] = content['receipt']['cumulativeGasUsed']
		d['logs'] = [{'logIndex': x['logIndex'], 'event': x['event'], 'args': x['args']} for x in content['logs']]
		with open("logs_expt_base_mem.txt","a+") as fo:
			fo.write(json.dumps(d))
			fo.write("\n")
	except:
		print(content)
	
	return 'Hello, World!'

@app.route('/log_1', methods=['POST'])
def log_improv1():
	content = request.get_json(force=True)
	d = {}
	try:
		d['tx'] = content['tx']
		d['gasUsed'] = content['receipt']['gasUsed']
		d['cumulativeGasUsed'] = content['receipt']['cumulativeGasUsed']
		d['logs'] = [{'logIndex': x['logIndex'], 'event': x['event'], 'args': x['args']} for x in content['logs']]
		with open("logs_expt_1.txt","a+") as fo:
			fo.write(json.dumps(d))
			fo.write("\n")
	except:
		print(content)
	
	return 'Hello, World!'

@app.route('/log_1_mem', methods=['POST'])
def log_improv1_mem():
	content = request.get_json(force=True)
	d = {}
	try:
		d['tx'] = content['tx']
		d['gasUsed'] = content['receipt']['gasUsed']
		d['cumulativeGasUsed'] = content['receipt']['cumulativeGasUsed']
		d['logs'] = [{'logIndex': x['logIndex'], 'event': x['event'], 'args': x['args']} for x in content['logs']]
		with open("logs_expt_1_mem.txt","a+") as fo:
			fo.write(json.dumps(d))
			fo.write("\n")
	except:
		print(content)
	
	return 'Hello, World!'

@app.route('/log_search', methods=['POST'])
def log_search():
	content = request.get_json(force=True)
	d = {}
	try:
		d['tx'] = content['tx']
		d['gasUsed'] = content['receipt']['gasUsed']
		d['cumulativeGasUsed'] = content['receipt']['cumulativeGasUsed']
		d['logs'] = [{'logIndex': x['logIndex'], 'event': x['event'], 'args': x['args']} for x in content['logs']]
		with open("logs_search.txt","a+") as fo:
			fo.write(json.dumps(d))
			fo.write("\n")
	except:
		print(content)
	
	return 'Hello, World!'

@app.route('/log_trial', methods=['POST'])
def log_trial():
	content = request.get_json(force=True)
	d = {}
	try:
		d['tx'] = content['tx']
		d['gasUsed'] = content['receipt']['gasUsed']
		d['cumulativeGasUsed'] = content['receipt']['cumulativeGasUsed']
		d['logs'] = [{'logIndex': x['logIndex'], 'event': x['event'], 'args': x['args']} for x in content['logs']]
		with open("logs_trial.txt","a+") as fo:
			fo.write(json.dumps(d))
			fo.write("\n")
	except:
		print(content)
	
	return 'Hello, World!'

@app.route('/get_entry', methods=['GET'])
def get_entry():
	with open("data_sim.txt", "r") as f:
		line = random.sample(f.readlines(),1)[0]
	return jsonify({"query": line.split('|')[0], "hash": line.split('|')[1]})

@app.route('/getList', methods=['GET'])
def get_txlist():
	with open("nodes_2_txList.txt", "r") as f:
		txlist = json.loads(f.read())
	print(len(txlist))
	return jsonify(txlist)

@app.route('/processData', methods=['POST'])
def process_data():
	content = request.get_json(force=True)
	with open("txBlockNum.txt", "w+") as f:
		f.write(json.dumps(content))
	return 'Hello, World!'

