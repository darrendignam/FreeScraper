var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var freeGroupSchema = new mongoose.Schema({ 
  url:{ type : String , unique : true, required : true, dropDups: true }, 
  freecycleGroup: String,
  locationtext: String,
  locationGPS: { type: [Number], index: '2dsphere'},  /* location:req.body.coordinates.split(',').map(Number)   ->   [lng,lat] /* Gotta be   longitude, latitude   !!!  */
  googleAddress: String,
  scrapedDate:{ type: Date, default: Date.now },
  updatedDate:{ type: Date, default: Date.now },
  version:Number
});

module.exports = mongoose.model('FreeGroup', freeGroupSchema);