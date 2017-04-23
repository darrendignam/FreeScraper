var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var itemSchema = new mongoose.Schema({ 
  url:{ type : String , unique : true, required : true, dropDups: true }, 
  item: String, /* The title / item */
  description:String,
  freecycleGroup: String,
  thumbnail:String,
  image: String,
  dateText: String,
  locationText: String,
  postcode: String,
  googleAddress: String,
  deaditem: { type: Boolean, default: false },
  locationGPS: { type: [Number], index: '2dsphere'},  /* location:req.body.coordinates.split(',').map(Number)   ->   [lng,lat] /* Gotta be   longitude, latitude   !!!  */
  scrapedDate:{ type: Date, default: Date.now },
  updatedDate:{ type: Date, default: Date.now },
  postdata:Date,  /*the extracted listing date*/
  version:Number
});

module.exports = mongoose.model('Item', itemSchema);