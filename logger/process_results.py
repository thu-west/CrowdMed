import json

with open("txBlockNum.txt") as f:
	fileObj = json.loads(f.read())

numList = [x["blockNumber"] for x in fileObj]
txList = list(dict.fromkeys(numList).keys())

with open("blockNumList.txt", "w+") as fo:
	fo.write(json.dumps(txList))
