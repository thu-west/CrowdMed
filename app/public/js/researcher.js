const SearchAddr = "0x45c32F7589F85C4370B8FaC140Aef4A9645a5648";
var SearchInstance = null;
const RCabi = "[{\"constant\": true, \"inputs\": [], \"name\": \"owner\", \"outputs\": [{\"name\": \"\", \"type\": \"address\"}], \"payable\": false, \"stateMutability\": \"view\", \"type\": \"function\"}, {\"constant\": true, \"inputs\": [{\"name\": \"\", \"type\": \"address\"}], \"name\": \"addrLookup\", \"outputs\": [{\"name\": \"identifier\", \"type\": \"string\"}, {\"name\": \"description\", \"type\": \"string\"}, {\"name\": \"role\", \"type\": \"uint8\"}], \"payable\": false, \"stateMutability\": \"view\", \"type\": \"function\"}, {\"constant\": true, \"inputs\": [{\"name\": \"\", \"type\": \"string\"}], \"name\": \"IDlookup\", \"outputs\": [{\"name\": \"ethAddr\", \"type\": \"address\"}, {\"name\": \"description\", \"type\": \"string\"}, {\"name\": \"role\", \"type\": \"uint8\"}, {\"name\": \"summContract\", \"type\": \"address\"}], \"payable\": false, \"stateMutability\": \"view\", \"type\": \"function\"}, {\"inputs\": [], \"payable\": false, \"stateMutability\": \"nonpayable\", \"type\": \"constructor\"}, {\"constant\": false, \"inputs\": [{\"name\": \"identifier\", \"type\": \"string\"}, {\"name\": \"newUser\", \"type\": \"address\"}, {\"name\": \"desc\", \"type\": \"string\"}, {\"name\": \"roleIN\", \"type\": \"uint8\"}], \"name\": \"registerUser\", \"outputs\": [], \"payable\": false, \"stateMutability\": \"nonpayable\", \"type\": \"function\"}]";
const RCaddress = "0x4feA27839E8334BE828085f6cD2fBEb59344D273";
var RCinstance = null;
var account= null;
var web3 = null;

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

var ResearcherVue = new Vue({
  el: "#main-content",
  data: {
    tagType: "DOB",
    tagValue: "",
    searchResult: null,
  },
  methods: {
    searchTag: function() {
      this.searchResult = [];
      let tagString = this.tagType + ":" + this.tagValue.toLowerCase();
      SearchInstance.methods.searchIndex(tagString).call((err, result) => {
        for(let i = 0; i < result.length; i++) {
          RCinstance.methods.addrLookup(result[i]).call((err, dataObj) => {
            RCinstance.methods.IDlookup(dataObj.identifier).call((err, userData) => {
              let temp = this.searchResult;
              temp.push({
                identifier: dataObj.identifier,
                SCaddr: userData.summContract
              });
              this.searchResult = temp;
            });
          })
        }
      })
    },
    retrieveData: function(idx) {
      let SCinstance = new web3.eth.Contract(SCjson.abi, this.searchResult[idx].SCaddr);
      SCinstance.methods.transferResearcher().call((err, accessString) => {
        let url = "/viewEMRGroup?mode=1&query=" + accessString;
        window.open(url, "_blank");
      })
    }
  },
  mounted: function() {
    if (window.ethereum) {
      web3 = new Web3(window.ethereum);
      window.ethereum.enable();
      account = window.ethereum.selectedAddress;
      // load registrar contract
      RCinstance = new web3.eth.Contract(JSON.parse(RCabi), RCaddress);
      SearchInstance = new web3.eth.Contract(SearchJSON.abi, SearchAddr);
      
      return;
    }
    alert("Please install Metamask.");
    return;
  },
  delimiters: ["||", "||"]
});