/** *************************************************************************************************************************************
  
  ________ .-------.        .-''-.      .-''-.     .-'''-.     _______   .-------.       ____    .-------.     .-''-.  .-------.     
  |        ||  _ _   \     .'_ _   \   .'_ _   \   / _     \   /   __  \  |  _ _   \    .'  __ `. \  _(`)_ \  .'_ _   \ |  _ _   \    
  |   .----'| ( ' )  |    / ( ` )   ' / ( ` )   ' (`' )/`--'  | ,_/  \__) | ( ' )  |   /   '  \  \| (_ o._)| / ( ` )   '| ( ' )  |    
  |  _|____ |(_ o _) /   . (_ o _)  |. (_ o _)  |(_ o _).   ,-./  )       |(_ o _) /   |___|  /  ||  (_,_) /. (_ o _)  ||(_ o _) /    
  |_( )_   || (_,_).' __ |  (_,_)___||  (_,_)___| (_,_). '. \  '_ '`)     | (_,_).' __    _.-`   ||   '-.-' |  (_,_)___|| (_,_).' __  
  (_ o._)__||  |\ \  |  |'  \   .---.'  \   .---..---.  \  : > (_)  )  __ |  |\ \  |  |.'   _    ||   |     '  \   .---.|  |\ \  |  | 
  |(_,_)    |  | \ `'   / \  `-'    / \  `-'    /\    `-'  |(  .  .-'_/  )|  | \ `'   /|  _( )_  ||   |      \  `-'    /|  | \ `'   / 
  |   |     |  |  \    /   \       /   \       /  \       /  `-'`-'     / |  |  \    / \ (_ o _) //   )       \       / |  |  \    /  
  '---'     ''-'   `'-'     `'-..-'     `'-..-'    `-...-'     `._____.'  ''-'   `'-'   '.(_,_).' `---'        `'-..-'  ''-'   `'-'   

  © 2017 Darren Dignam                                                                                                                                        

  FreeScraper is a NodeJS Freecycle Scraper to help find items in the Greater London area.

  This is an experimental scraper that tries to get all the items near my location that I moght be interested in. Can cause memory 
  issues - so needs more work.

  This file is part of FreeScraper.

  FreeScraper is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  FreeScraper is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with FreeScraper.  If not, see <http://www.gnu.org/licenses/>.

  ************************************************************************************************************************************* **/

var express = require('express');
var router = express.Router();

var request = require('request');
// var cheerio = require('cheerio');
// var fs = require('fs');

var ZipItem = require('../models/zipitem');

function getDateTime() {

  var date = new Date();

  var hour = date.getHours();
  hour = (hour < 10 ? "0" : "") + hour;

  var min  = date.getMinutes();
  min = (min < 10 ? "0" : "") + min;

  var sec  = date.getSeconds();
  sec = (sec < 10 ? "0" : "") + sec;

  var year = date.getFullYear();

  var month = date.getMonth() + 1;
  month = (month < 10 ? "0" : "") + month;

  var day  = date.getDate();
  day = (day < 10 ? "0" : "") + day;

  return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;

}

/* GET home page. */
router.get('/', function(req, res) {

  res.writeHead(200, { "Content-Type" : "text/html" })

  res.write("<h1>Zip van Scraper: "+getDateTime()+"</h1>");

  var out_str = "";
  var pages_obj = [
      // 'http://www.zipvan.com/api/drupal/1.0/locations?lat=51.38516048270475&lon=-0.09631000000002&lat_delta=0.07170630841817405&lon_delta=0.23943765258789063&locale=en-GB' /* Croyden */
      // 'http://www.zipvan.com/api/drupal/1.0/locations?lat=51.40318148292134&lon=-0.29441099999997&lat_delta=0.07167846145363177&lon_delta=0.23943765258789063&locale=en-GB'//, /* Serbiton? */
      // 'http://www.zipvan.com/api/drupal/1.0/locations?lat=51.42040648312896&lon=-0.19918400000006&lat_delta=0.071651837973017&lon_delta=0.23943765258789063&locale=en-GB'
      // 'http://www.zipvan.com/api/drupal/1.0/locations?lat=51.40318148292134&lon=-0.29441099999997&lat_delta=0.07167846145363177&lon_delta=0.23943765258789063&locale=en-GB'
      // 'http://www.zipvan.com/api/drupal/1.0/locations?lat=51.42040648312896&lon=-0.19918400000006&lat_delta=0.071651837973017&lon_delta=0.23943765258789063&locale=en-GB'
      // 'http://www.zipvan.com/api/drupal/1.0/locations?lat=51.45836448358844&lon=-0.30006600000002&lat_delta=0.07159314640444114&lon_delta=0.23943765258789063&locale=en-GB'
      // 'http://www.zipvan.com/api/drupal/1.0/locations?lat=51.48567548392067&lon=-0.30445099999997&lat_delta=0.07155089831459327&lon_delta=0.23943765258789063&locale=en-GB'
      // 'http://www.zipvan.com/api/drupal/1.0/locations?lat=51.50689993671966&lon=-0.28393400000004&lat_delta=0.14203609683305507&lon_delta=0.47787530517578125&locale=en-GB'
      // 'http://www.zipvan.com/api/drupal/1.0/locations?lat=51.45367393412650&lon=-0.17883099999995&lat_delta=0.14220078908623413&lon_delta=0.47787530517578125&locale=en-GB'
      // 'http://www.zipvan.com/api/drupal/1.0/locations?lat=51.48476248390956&lon=0.03902100000005&lat_delta=0.07155231091689507&lon_delta=0.23943765258789063&locale=en-GB'
      // 'http://www.zipvan.com/api/drupal/1.0/locations?lat=51.59532248526836&lon=-0.22726599999999&lat_delta=0.071381121275787&lon_delta=0.23943765258789063&locale=en-GB'
      // 'http://www.zipvan.com/api/drupal/1.0/locations?lat=51.58771148517408&lon=-0.11128400000007&lat_delta=0.0713929144540183&lon_delta=0.23943765258789063&locale=en-GB'
      // 'http://www.zipvan.com/api/drupal/1.0/locations?lat=51.54824293874830&lon=-0.10925399999996&lat_delta=0.14190808904636987&lon_delta=0.47787530517578125&locale=en-GB'
      'http://www.zipvan.com/api/drupal/1.0/locations?lat=51.56568793960811&lon=0.05973900000004&lat_delta=0.14185405315261568&lon_delta=0.47787530517578125&locale=en-GB'
  ];
  // cant put to many pages here as the number of items across all pages causes issues....

    // console.log("FINISHED FC pass 1");

    for(i = 0; i < pages_obj.length; i++){
    //for(i = 0; i < 2; i++){
      //var page_title = $('head title').text().trim(); // this is from the previous 'home' / starting page....
      //console.log(page_title + " - " + pages_obj[i]);

      //var items_obj = [];

      request(pages_obj[i], function(error, response, body) {
        if(error) {
          console.log("Error: " + error);
        }
        console.log("fc_6: Status code: " + response.statusCode);

        //res.write("<div class='node_js_group' style='min-height:200px;background:#eee;margin:5px;'><a style='font-weight:bold;font-size:150%;' target='_BLANK' href='"+this_link+"'>"+this_title+"</a>"+img_string+"<p>"+this_details+"</p>"+  this_p  +"</div>");
        //res.write( body );
        var body_obj = JSON.parse( body );
        for(j = 0; j < body_obj.locations.length; j++){
          // res.write( body_obj.locations[j].zipfleetId +' > '+body_obj.locations[j].longitude + ','+body_obj.locations[j].latitude+' : '+body_obj.locations[j].locationId +' : '+  body_obj.locations[j].description +"<br>" );
          res.write( body_obj.locations[j].locationId  +'<br>')


          //Setup stuff
          var query = { locationId : body_obj.locations[j].locationId };
          var update = {
              vehicleCount:body_obj.locations[j].vehicleCount ,
              hasVans:body_obj.locations[j].hasVans ,
              locationGPS: [body_obj.locations[j].longitude, body_obj.locations[j].latitude ],    /* Gotta be   longitude, latitude */
              description:body_obj.locations[j].description ,                                   /* Short text address */
              marketId:body_obj.locations[j].marketId ,
              zipfleetId:body_obj.locations[j].zipfleetId ,
              updatedDate:new Date()
          };
          var tmp_zip_item = {
                          locationId:body_obj.locations[j].locationId ,
                          vehicleCount:body_obj.locations[j].vehicleCount ,
                          hasVans:body_obj.locations[j].hasVans ,
                          locationGPS: [body_obj.locations[j].longitude, body_obj.locations[j].latitude ],    /* Gotta be   longitude, latitude */
                          description:body_obj.locations[j].description ,                                   /* Short text address */
                          marketId:body_obj.locations[j].marketId ,
                          zipfleetId:body_obj.locations[j].zipfleetId ,
                          scrapedDate:new Date(),
                          updatedDate:new Date()
          };
          //var options = { upsert: true };
          var options = {  };

          ZipItem.findOneAndUpdate(query, update, options, function(error, result) {
              if (!error) {
                  // If the document doesn't exist
                  if (!result) {
                      // Create it
                      result = new ZipItem( tmp_zip_item );
                      //console.log("Saved new");
                  } else {
                    //console.log("result: %j", result);
                    console.log("Updated");
                  }
                  // Save the document
                  result.save(function(error) {
                      if (!error) {
                          // Do something with the document - well, actually, we think the result has been saved, created, or updated, so celebrate with a bit of google fu
                          console.log("Saved...  ");
                          //get geolocation from google....
                      } else {
                          console.log("error: %j", error);
                          //throw error;
                      }
                  });
              }else{
                console.log("error: %j", error);
              }
          });

          //console.log('%j', update);

          //cant handle dupes!         
          // result = new ZipItem({
          //    // updatedDate: new Date(),
          //    //  url: the_link,
          //    //  item: the_title//,


          //     locationId:body_obj.locations[j].locationId ,
          //     vehicleCount:body_obj.locations[j].vehicleCount ,
          //     hasVans:body_obj.locations[j].hasVans ,
          //     locationGPS: [body_obj.locations[j].longitude, body_obj.locations[j].latitude ],    /* Gotta be   longitude, latitude */
          //     description:body_obj.locations[j].description ,                                   /* Short text address */
          //     marketId:body_obj.locations[j].marketId ,
          //     zipfleetId:body_obj.locations[j].zipfleetId ,
          //     scrapedDate:new Date(),
          //     updatedDate:new Date()

          // });
          // result.save(function(error) {
          //     if (!error) {
          //         // Do something with the document
          //         //console.log("Saved new");
          //     } else {
          //         console.log("error: %j", error);
          //         throw error;
          //     }
          // });  


         }
      
      // "vehicleCount": "1",
      // "latitude": "51.419613",
      // "restrictedP": "f",
      // "description": "Wimbledon - St. George's Rd",
      // "marketId": "33074166",
      // "locationId": "1565617153",
      // "hasVans": "0",
      // "longitude": "-.210274",
      // "zipfleetId": "33074050"

      });
    }

  
  //res.send("DONE!!");
  setTimeout(function(){
    res.end();
    console.log('fc_6: end');
  },30000);

});

module.exports = router;