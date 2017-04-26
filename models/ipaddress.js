var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ipaddress = new mongoose.Schema({ 
  ipaddress:String,
  route: String,
  updatedDate:{ type: Date, default: Date.now },
  version:Number
});

module.exports = mongoose.model('ipaddress', ipaddress);