var web3 = null;
var RCinstance = null;
var account= null;
var viewTitles = ["Home", "Permission Settings", "Medical Records", "Local Data"];
const RCabi = "[{\"constant\": true, \"inputs\": [], \"name\": \"owner\", \"outputs\": [{\"name\": \"\", \"type\": \"address\"}], \"payable\": false, \"stateMutability\": \"view\", \"type\": \"function\"}, {\"constant\": true, \"inputs\": [{\"name\": \"\", \"type\": \"address\"}], \"name\": \"addrLookup\", \"outputs\": [{\"name\": \"identifier\", \"type\": \"string\"}, {\"name\": \"description\", \"type\": \"string\"}, {\"name\": \"role\", \"type\": \"uint8\"}], \"payable\": false, \"stateMutability\": \"view\", \"type\": \"function\"}, {\"constant\": true, \"inputs\": [{\"name\": \"\", \"type\": \"string\"}], \"name\": \"IDlookup\", \"outputs\": [{\"name\": \"ethAddr\", \"type\": \"address\"}, {\"name\": \"description\", \"type\": \"string\"}, {\"name\": \"role\", \"type\": \"uint8\"}, {\"name\": \"summContract\", \"type\": \"address\"}], \"payable\": false, \"stateMutability\": \"view\", \"type\": \"function\"}, {\"inputs\": [], \"payable\": false, \"stateMutability\": \"nonpayable\", \"type\": \"constructor\"}, {\"constant\": false, \"inputs\": [{\"name\": \"identifier\", \"type\": \"string\"}, {\"name\": \"newUser\", \"type\": \"address\"}, {\"name\": \"desc\", \"type\": \"string\"}, {\"name\": \"roleIN\", \"type\": \"uint8\"}], \"name\": \"registerUser\", \"outputs\": [], \"payable\": false, \"stateMutability\": \"nonpayable\", \"type\": \"function\"}]";
const RCaddress = "0x4feA27839E8334BE828085f6cD2fBEb59344D273";
var userData = null;


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

var DoctorVue = new Vue({
  el: '#main-content',
  data: {
    roleMap: ["Patient", "Medical Provider", "Medical Researcher"],
    query: "",
    searchResult: null,
    searchSuccess: false,
    recordText: "",
    emr: "",
    viewMode: [true, false, false, false],
    dataPreview: false,
    submitSuccess: false,
    retrieveErr: false,
    tagType: "DOB",
    tagValue: "",
    retrieveView: false,
  },
  methods: {
    switchView: function(idx) {
      let temp = [false, false, false, false];
      temp[idx] = true;
      this.viewMode = temp;
      this.resetForm();
    },
    search: function() {
      RCinstance.methods.IDlookup(this.query).call((err, result) => {
        if (!err) { 
          this.searchSuccess = true;
          this.searchResult = result; 
          this.searchResult.identifier = this.query;
          this.query = "";
        }
      });
    },
    getData: function() {
      axios.get("http://localhost:8888/viewEMR", {params: {
        query: this.recordText,
        mode: 0
      }}).then(response => {
        this.emr = response.data;
        this.dataPreview = true;
      });
    },
    createRecord: function() {
      let SCinstance = new web3.eth.Contract(SCjson.abi, this.searchResult.summContract);
      SCinstance.methods.newRecord(this.recordText, JSON.stringify(this.emr).hashCode().toString())
      .send({from: account}, (err, txHash)=> {
        if (err) console.log(err);
        console.log(txHash);
        this.submitSuccess = true;
        this.dataPreview = false;
      })
    },
    resetForm: function() {
      this.recordText = "";
      this.emr = "";
      this.dataPreview = false;
      this.submitSuccess = false;
    },
    retrieveData: function() {
      let SCinstance = new web3.eth.Contract(SCjson.abi, this.searchResult.summContract);
      SCinstance.methods.PPRlist(account).call((err, PPRinfo) => {
        if (PPRinfo.currStatus == 0) {
          console.log(PPRinfo.accessGroup);
          SCinstance.methods.accessGroups(PPRinfo.accessGroup).call((err, accessString) => {
            SCinstance.methods.transferData().send({from: account}, (err, txhash) => {
              console.log(txhash);
              let url = "/viewEMRGroup?mode=1&query=" + accessString;
              window.open(url, "_blank");
            })
          })
        }
        else {
          this.retrieveErr = true;
        }
      });
    },
    requestAccess: function() {
      let SCinstance = new web3.eth.Contract(SCjson.abi, this.searchResult.summContract);
      SCinstance.methods.newPPRsteward().send({from: account}, (err, txhash) => {
        if (err) console.log(err);
        console.log(txhash);
        this.retrieveErr = true;
      })
    },
    sendTag: function() {
      axios.post("http://localhost:8888/addTag", {params: {
        type: this.tagType,
        value: this.tagValue,
        subject: this.searchResult.identifier
      }}).then(response => {
        if (response.data.msg == 0) {
          console.log("submit success");
        }
      });
    }
  },
  mounted: function() {
    if (window.ethereum) {
      web3 = new Web3(window.ethereum);
      window.ethereum.enable();
      account = ethereum.selectedAddress;
      // load registrar contract
      RCinstance = new web3.eth.Contract(JSON.parse(RCabi), RCaddress);
      // RCinstance.methods.IDlookup(document.getElementById("userID").innerHTML).call((err, userData) => {
      //   if (userData.ethAddr != account) {
      //     console.log(userData.ethAddr);
      //     alert("Metamask account does not match.");
      //   }
      // });
      return;
    }
    alert("Please install Metamask.");
    return;
  },
  delimiters: ["||", "||"]
});