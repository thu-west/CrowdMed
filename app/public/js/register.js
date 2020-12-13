const RCabi = "[{\"constant\": true, \"inputs\": [], \"name\": \"owner\", \"outputs\": [{\"name\": \"\", \"type\": \"address\"}], \"payable\": false, \"stateMutability\": \"view\", \"type\": \"function\"}, {\"constant\": true, \"inputs\": [{\"name\": \"\", \"type\": \"address\"}], \"name\": \"addrLookup\", \"outputs\": [{\"name\": \"identifier\", \"type\": \"string\"}, {\"name\": \"description\", \"type\": \"string\"}, {\"name\": \"role\", \"type\": \"uint8\"}], \"payable\": false, \"stateMutability\": \"view\", \"type\": \"function\"}, {\"constant\": true, \"inputs\": [{\"name\": \"\", \"type\": \"string\"}], \"name\": \"IDlookup\", \"outputs\": [{\"name\": \"ethAddr\", \"type\": \"address\"}, {\"name\": \"description\", \"type\": \"string\"}, {\"name\": \"role\", \"type\": \"uint8\"}, {\"name\": \"summContract\", \"type\": \"address\"}], \"payable\": false, \"stateMutability\": \"view\", \"type\": \"function\"}, {\"inputs\": [], \"payable\": false, \"stateMutability\": \"nonpayable\", \"type\": \"constructor\"}, {\"constant\": false, \"inputs\": [{\"name\": \"identifier\", \"type\": \"string\"}, {\"name\": \"newUser\", \"type\": \"address\"}, {\"name\": \"desc\", \"type\": \"string\"}, {\"name\": \"roleIN\", \"type\": \"uint8\"}], \"name\": \"registerUser\", \"outputs\": [], \"payable\": false, \"stateMutability\": \"nonpayable\", \"type\": \"function\"}]";

var RegistrationVue = new Vue({
  el: '#main-content',
  data: {
    username: '',
    password: '',
    password2: '',
    localdb: '',
    ethAddr: '',
    submitSuccess: false,
    usernameErr: false,
    passwordErr: false,
    profileErr: false,
    profileType: null,
    web3: null,
    contractInstance: null,
    account: null,
    description: '',
  },
  methods: {
    submitForm: function() {
      // input validation
      if (this.password != this.password2) {
        this.passwordErr = true;
        return;
      }
      if (!this.profileType) {
        this.profileErr = true;
        return;
      }
      // save to db
      axios.post("http://localhost:8888/register", {
        username_: this.username,
        password_: this.password,
        localdb_: this.localdb,
        profiletype_: this.profileType
      })
      .then(response => {
        if (response.data.msg == 1) {
          this.usernameErr = true;
          return;
        } else {
          this.contractInstance.registerUser(this.username, this.ethAddr, this.description, this.profileType, {from: this.account}, (err, result)=> {
            if (!err) { console.log(JSON.stringify(result)); this.submitSuccess = true; }
          });
        }
      });
    },
    resetForm: function() {
      this.username = '';
      this.password = '';
      this.password2 = '';
      this.localdb = '';
      this.ethAddr = '';
      this.submitSuccess = false;
      this.usernameErr = false;
      this.passwordErr = false;
      this.profileErr = false;
      this.description = '';
    }
  },
  mounted() {
    if (window.ethereum) {
      this.web3 = new Web3(window.ethereum);
      window.ethereum.enable();
      this.account = window.ethereum.selectedAddress;
      if (this.account != "0x9575adb94b6bbd97bda9d418e5fe6c8eb15eb11f") {
        alert("Metamask account incorrect.")
      }
      // load registrar contract
      this.contractInstance = web3.eth.contract(JSON.parse(RCabi)).at("0x4feA27839E8334BE828085f6cD2fBEb59344D273");
      console.log("RC loaded");
      return;
    }
    alert("Please install Metamask.");
    return;
  },
  delimiters: ["||", "||"]
});