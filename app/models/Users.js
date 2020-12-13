//Require Mongoose
var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  localdb: { type: String },
  role: { type: Number, required: true }, // 0 - Patient, 1 - Provider, 2 - Researcher, 3 - CA

});

//Export function to create "SomeModel" model class
module.exports = mongoose.model('User', UserSchema );