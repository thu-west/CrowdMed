(function($) {
    $(function() {
      $(document).tooltip({ selector: '[data-toggle="tooltip"]' });
      $(document).popover({ selector: '[data-toggle="popover"]' });
    });
  })(jQuery);

$('#inspectionWindow').on('shown.bs.modal', function () {
  $('#inspectTrigger').trigger('focus')
})

var web3 = null;
var SCinstance = null;
var RCinstance = null;
var account= null;
var viewTitles = ["Home", "Permission Settings", "Medical Records", "Local Data", "Authorized Viewers", "Tags"];
const RCabi = "[{\"constant\": true, \"inputs\": [], \"name\": \"owner\", \"outputs\": [{\"name\": \"\", \"type\": \"address\"}], \"payable\": false, \"stateMutability\": \"view\", \"type\": \"function\"}, {\"constant\": true, \"inputs\": [{\"name\": \"\", \"type\": \"address\"}], \"name\": \"addrLookup\", \"outputs\": [{\"name\": \"identifier\", \"type\": \"string\"}, {\"name\": \"description\", \"type\": \"string\"}, {\"name\": \"role\", \"type\": \"uint8\"}], \"payable\": false, \"stateMutability\": \"view\", \"type\": \"function\"}, {\"constant\": true, \"inputs\": [{\"name\": \"\", \"type\": \"string\"}], \"name\": \"IDlookup\", \"outputs\": [{\"name\": \"ethAddr\", \"type\": \"address\"}, {\"name\": \"description\", \"type\": \"string\"}, {\"name\": \"role\", \"type\": \"uint8\"}, {\"name\": \"summContract\", \"type\": \"address\"}], \"payable\": false, \"stateMutability\": \"view\", \"type\": \"function\"}, {\"inputs\": [], \"payable\": false, \"stateMutability\": \"nonpayable\", \"type\": \"constructor\"}, {\"constant\": false, \"inputs\": [{\"name\": \"identifier\", \"type\": \"string\"}, {\"name\": \"newUser\", \"type\": \"address\"}, {\"name\": \"desc\", \"type\": \"string\"}, {\"name\": \"roleIN\", \"type\": \"uint8\"}], \"name\": \"registerUser\", \"outputs\": [], \"payable\": false, \"stateMutability\": \"nonpayable\", \"type\": \"function\"}]";
const RCaddress = "0x4feA27839E8334BE828085f6cD2fBEb59344D273";
const SearchAddr = "0x45c32F7589F85C4370B8FaC140Aef4A9645a5648";
var userData = null;
var SearchInstance = null;

const eventMap = {
  "newData": "Medical record created",
  "dataTransferred": "Medical data transfer",
  "permissionGroup": "Permission group created",
  "PPRadded": "New viewer authorised",
  "permissionUpdated": "Viewer's group changed",
  "statusUpdated": "Viewer's status updated",
  "researchPermission": "Researcher access settings updated",
  "GroupEdited": "Permission group edited"
};

const reversePPRmap = {
  "Pending": 1,
  "Valid": 0,
  "Invalid": 2
}

String.prototype.hashCode = function() {
    var hash = 0;
    if (this.length == 0) {
        return hash;
    }
    for (var i = 0; i < this.length; i++) {
        var char = this.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

var PatientVue = new Vue({
  el: '#main-content',
  data: {
    roleMap: ["Patient", "Medical Provider", "Medical Researcher"],
    // main page and navigation
    viewmode: 0,
    viewTitle: viewTitles[0],
    eventsList: [],
    showEvent: null,
    reportMsg: false,
    reportedAddr: null,
    // permission group mode
    permissionGroups: [],
    researchStr: "",
    noResearch: false,
    editSettings: false,
    createGroupView: false,
    selectedRecords: null,
    researcher: false,
    focusGroup: null,
    customFields: [],
    // authorized viewers mode
    query: "",
    searchResult: null,
    submitSuccess: false,
    searchSuccess: false,
    authUsers: [],
    newUser: false,
    numGroups: null,
    groupIn: null,
    PPRstatusMap: ["Valid", "Pending", "Invalid"],
    editGroup: null,
    editStatus: null,
    newGroup: null,
    newStatus: null,
    selectedFields: {},
    // medical records mode
    emrList: {},
    numRecords: null,
    accessObj: null,
    // tag creation mode
    tagType: "DOB",
    tagValue: "",
    tags: [],
    pendingTags: null,
  },
  methods: {
    resetVariables: function() {
      this.createGroupView = false;
      this.searchResult = null;
      this.submitSuccess = false;
      this.searchSuccess = false;
      this.authUsers = [];
      this.editSettings = false;
      this.researcher = false;
      this.editGroup = null;
      this.editStatus = null;
      this.customFields = [];
    },
    switchView: function(newView) {
      this.viewmode = newView;
      this.viewTitle = viewTitles[newView];
      this.resetVariables();
    },
    activityFeed: function() {
      SCinstance.getPastEvents("allEvents", {fromBlock: 0, toBlock: "latest"}, (err, events) => {
        let temp = [];
        for (let i = 0; i < events.length; i++) {
          web3.eth.getBlock(events[i].blockNumber, (err, blockObj) => {
            web3.eth.getTransactionReceipt(events[i].transactionHash, (err, txObj) => {
              let x = new Date(blockObj.timestamp * 1000);
              if (txObj.from == account) {
                temp.push({
                  "timestamp": x.toLocaleString(),
                  "event": eventMap[events[i].event],
                  "sender": "Me",
                  "description": "",
                  "role": "",
                  "txHash": events[i].transactionHash
                });
              }
              else {
                RCinstance.methods.addrLookup(txObj.from).call((err, userdata) => {
                  temp.push({
                    "timestamp": x.toLocaleString(),
                    "event": eventMap[events[i].event],
                    "sender": userdata.identifier,
                    "description": userdata.description,
                    "txHash": events[i].transactionHash
                  });
                });
              }
            });
          });
        };
        this.eventsList = temp;
      });
    },
    inspectEvent: function(idx) {
      this.reportMsg = false;
      this.reportedAddr = null;
      web3.eth.getTransactionReceipt(this.eventsList[idx].txHash, (err, txObj) => {
        this.showEvent = this.eventsList[idx];
        this.showEvent.logs = txObj.logs;
      });
    },
    reportUser: function(addr) {
      this.reportMsg = true;
      this.reportedAddr = addr;
    },
    search: function() {
      RCinstance.methods.IDlookup(this.query).call((err, result) => {
        if (!err) { this.searchSuccess = true; this.searchResult = result; console.log(this.searchResult) }
      });
    },
    loadPermissionGroups: function () {
      this.researcher = false;
      this.editSettings = false;
      this.permissionGroups = [];
      this.focusGroup = null;
      SCinstance.methods.getResearch().call({from: account}, (err, researchStr) => {
        if (researchStr == "") {
          this.researchStr = "#";
          this.noResearch = false;
        }
        else {
          this.researchStr = "/viewEMRGroup?mode=1&query=" + researchStr;
          this.noResearch = true;
        }
      });
      SCinstance.methods.getNumGroups().call((err, numGroups) => {
        for (let i = 1; i < numGroups; i++) {
          SCinstance.methods.accessGroups(i).call((err, accessString) => {
            let temp = this.permissionGroups;
            temp.push("/viewEMRGroup?mode=1&query=" + accessString);
            this.permissionGroups = temp;
          })
        }
      });
    },
    initSelect: function() {
      this.loadEMR();
    },
    formAccessString: function() {
      let accessString = {groups: [], customFields: this.customFields};
      for (creator in this.selectedRecords) {
        let creatorObj = {rec:[], fields: this.emrList[creator].selectedFields};
        for (let idx = 0; idx < this.selectedRecords[creator].length; idx++) {
          if (this.selectedRecords[creator][idx]) {
            creatorObj['rec'].push(this.emrList[creator].record[idx].queryStr);
          }
        }
        accessString['groups'].push(creatorObj);
      }
      this.accessObj = accessString;
    },
    previewGroup: function () {
      this.formAccessString();
      // console.log(this.accessObj);
      // console.log(JSON.stringify(this.accessObj));
      let url = "/viewEMRGroup?mode=1&query=" + JSON.stringify(this.accessObj);
      window.open(url, "_blank");
    },
    addField: function() {
      this.customFields.push({"label": "", "content": ""})
    },
    createGroup: function() {
      this.formAccessString();
      if (this.editSettings) {
        SCinstance.methods.editPermission(this.focusGroup, JSON.stringify(this.accessObj)).send({from: account}, (err, txHash) => {
          console.log(txHash);
          this.createGroupView = false;
          this.loadPermissionGroups();
        });
      }
      else if (this.researcher) {
        SCinstance.methods.updateResearch(JSON.stringify(this.accessObj)).send({from: account}, (err, txHash) => {
          console.log(txHash);
          this.createGroupView = false;
          this.loadPermissionGroups();
        });
      } else {
        SCinstance.methods.newPermissionGroup(JSON.stringify(this.accessObj)).send({from: account}, (err, txHash) => {
          console.log(txHash);
          this.createGroupView = false;
          this.loadPermissionGroups();
        });
      }
    },
    loadEMR: function() {
      this.emrList = {};
      this.selectedRecords = {};
      for(let i = 0; i < this.numRecords; i++) {
        SCinstance.methods.patientData(i).call((err, res) => {
          let temp = this.emrList;
          RCinstance.methods.addrLookup(res.creator).call((err, userdata) => {
            if (temp[res.creator]) {
              temp[res.creator]['record'].push({
                url: "/viewEMR?mode=1&query=" + res.queryString + "&hash=" + res.dataHash + "&creator=" + res.creator,
                queryStr: res.queryString,
                sender: userdata.identifier,
                description: userdata.description
              });
              this.emrList = temp;
              this.$forceUpdate();
              this.selectedRecords[res.creator].push(true);
            }
            else {
              axios.get("http://localhost:8888/viewEMR", {params: {
                mode: 3
              }}).then(response => {
                temp[res.creator] = {};
                temp[res.creator]['record'] = [{
                  url: "/viewEMR?mode=1&query=" + res.queryString + "&hash=" + res.dataHash + "&creator=" + res.creator,
                  queryStr: res.queryString,
                  sender: userdata.identifier,
                  description: userdata.description
                }]
                temp[res.creator]['selectedFields'] = JSON.parse(JSON.stringify(response.data));
                temp[res.creator]['fieldList'] = JSON.parse(JSON.stringify(response.data));
                this.emrList = temp;
                this.$forceUpdate();
                this.selectedRecords[res.creator] = [true];
              }); 
            }
          });
        });
      }
    },
    loadAuthUsers: function() {
      this.getNumGroups();
      SCinstance.methods.getAllStewards().call((err, authUsers) => {
        let addrList = authUsers;
        this.editGroup = new Array(addrList.length).fill(false);
        this.editStatus = new Array(addrList.length).fill(false);
        for (let i = 0; i < addrList.length; i++) {
          let temp = this.authUsers;
          SCinstance.methods.PPRlist(addrList[i]).call((err, PPRinfo) => {
            RCinstance.methods.addrLookup(addrList[i]).call((err, userdata) => {
              let item = PPRinfo;
              item.addr = addrList[i];
              item.identifier = userdata.identifier;
              temp.push(item);
              this.authUsers = temp;
            });
          });
        }
      });
    },
    createPPR: function() {
      SCinstance.methods.newPPRpatient(this.searchResult[0], this.groupIn).send({from: account}, (err, result) => {
        if (!err) { 
          this.submitSuccess = true; 
          this.searchResult = null;
          this.searchSuccess = false;
        }
      });
    },
    getNumGroups: function() {
      SCinstance.methods.getNumGroups().call((err, numGroups) => {
        this.numGroups = parseInt(numGroups) - 1;       
      });
    },
    changeTruth: function(obj, idx) {
      if (obj == 0) {
        let temp = new Array(this.editGroup.length).fill(false);
        temp[idx] = true;
        this.editGroup = temp;
      } else {
        let temp = new Array(this.editStatus.length).fill(false);
        temp[idx] = true;
        this.editStatus = temp;
      }
    },
    updateGroup: function(uid) {
      SCinstance.methods.newPermission(this.authUsers[uid].addr, this.newGroup).send({from: account}, (err, txHash) => {
        console.log(txHash);
      });
    },
    updateStatus: function(uid) {
      SCinstance.methods.updatePPR(this.authUsers[uid].addr, reversePPRmap[this.newStatus]).send({from: account}, (err, txHash) => {
        console.log(txHash);
      });
    },
    loadTags: function() {
      this.tags = [];
      this.pendingTags = [];
      axios.get("http://localhost:8888/getTags")
      .then(result => {
        this.pendingTags = result.data;
      });
      SearchInstance = new web3.eth.Contract(SearchJSON.abi, SearchAddr);
      SearchInstance.methods.getNumTags().call({from: account}, (err, numTags) => {
        for (let i = 0; i < numTags; i++) {
          let temp = this.tags;
          SearchInstance.methods.retrieveTags(i).call({from: account}, (err, tag) => {
            temp.push({
              type: tag.split(":")[0],
              value: tag.split(":")[1]
            });
            this.tags = temp;
          })
        }
      })
    },
    submitTag: function(mode) {
      let tagString = "";
      if (mode == -1) {
        tagString = this.tagType + ":" + this.tagValue.toLowerCase();
        console.log(tagString);
      } else {
        tagString = this.pendingTags[mode].tagType + ":" + this.pendingTags[mode].tagValue.toLowerCase();
      }
      SearchInstance.methods.updateIndex(tagString, account).send({from: account}, (err, txHash) => {
        console.log(err);
        console.log(txHash);
        if (mode != -1) {
          axios.post("http://localhost:8888/removeTag", {params: {
            type: this.pendingTags[mode].tagType,
            value: this.pendingTags[mode].tagValue,
            sender: this.pendingTags[mode].sender
          }})
          .then(response => {
            console.log(response.data.msg);
            this.loadTags();
          })
        }
        else {
          this.loadTags();
        }
      });
    },
  },
  mounted: function() {
    if (window.ethereum) {
      web3 = new Web3(window.ethereum);
      window.ethereum.enable();
      account = window.ethereum.selectedAddress;
      // load registrar contract
      RCinstance = new web3.eth.Contract(JSON.parse(RCabi), RCaddress);
      // get summary contract address
      RCinstance.methods.IDlookup(document.getElementById("userID").innerHTML).call((err, userData) => {
        SCinstance = new web3.eth.Contract(SCjson.abi, userData.summContract);
        this.activityFeed();
        SCinstance.methods.numRecords().call().then((result) => {
          this.numRecords = parseInt(result);
        });
      });
      
      return;
    }
    alert("Please install Metamask.");
    return;
  },
  delimiters: ["||", "||"]
});