var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var zipGroupSchema = new mongoose.Schema({ 
  url:{ type : String , unique : true, required : true, dropDups: true },
  title: String,
  scrapedDate:{ type: Date, default: Date.now },
  updatedDate:{ type: Date, default: Date.now },
  version:Number
}, { collection: 'zipgroups' });

module.exports = mongoose.model('ZipGroup', zipGroupSchema);