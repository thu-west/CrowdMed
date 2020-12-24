import json

filenames = ["authorisation.txt",\
			"creation_1000.txt",\
			"creation_500.txt",\
			"creation_4000.txt",\
			"registration.txt",\
			"transfer.txt"]

directory = "nodes_2/"

txList = []
for file in filenames:
	with open(directory + file) as f:
		fileObj = json.loads(f.read())
	print(len(fileObj))
	for item in fileObj:
		txList.append(item["txHash"])

print(len(txList))
with open(directory[:-1] + "_txList.txt", "w+") as fo:
	fo.write(json.dumps(txList))
