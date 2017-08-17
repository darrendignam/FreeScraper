var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var zipItemSchema = new mongoose.Schema({ 
  locationId:{ type : String , unique : true, required : true, dropDups: true },
  vehicleCount:Number,
  hasVans:Number,
  locationGPS: { type: [Number], index: '2dsphere'},    /* Gotta be   longitude, latitude */
  description:String,                                   /* Short text address */
  marketId:String,
  zipfleetId:String,
  scrapedDate:{ type: Date, default: Date.now },
  updatedDate:{ type: Date, default: Date.now },
  locationVehicles:[{}]                                 /* Array of objects - for completeness really  */
});

module.exports = mongoose.model('ZipItem', zipItemSchema);