var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var freeItemSchema = new mongoose.Schema({ 
  url:{ type : String , unique : true, required : true, dropDups: true }, 
  item: String, /* The title / item */
  description:String,
  freecycleGroup: String,
  picture: String,
  dateText: String,
  locationText: String,
  postcode: String,
  googleAddress: String,
  deaditem: { type: Boolean, default: false },
  locationGPS: { type: [Number], index: '2dsphere'},  /* location:req.body.coordinates.split(',').map(Number)   ->   [lng,lat] /* Gotta be   longitude, latitude   !!!  */
  scrapedDate:{ type: Date, default: Date.now },
  updatedDate:{ type: Date, default: Date.now },
  listingDate:Date,
  source:String,
  active:Boolean,
  version:Number
});

module.exports = mongoose.model('FreeItem', freeItemSchema);