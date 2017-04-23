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

var request = require('request');  //lets us get the data from a URL - freecycle in this case
var cheerio = require('cheerio');  //Makes accessing the data from the requests easier, jQuery-like notation
// var fs = require('fs');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FreeGroup = require('../models/freegroup');
var FreeItem = require('../models/freeitem');

/* GET home page. */
router.get('/', function(req, res) {

      var stream = FreeGroup.find().stream();
      stream.on('data', function (doc) {
        // do something with the mongoose document
        //if(doc.url=="http://groups.freecycle.org/HackneyUK"){
            scrapeGroupPage(doc.url);
        //}

      }).on('error', function (err) {
        // handle the error
        console.log(err);
      }).on('close', function () {
        // the stream is closed
        console.log("scan complete...");
      });

      res.send("Processing....");
});

module.exports = router;


function scrapeGroupPage(group_url){
      var scrape_url = group_url;// + "/posts/offer?page=1&resultsperpage=100&showall=off&include_offers=off&include_wanteds=off&include_receiveds=off&include_takens=off";      

      request(scrape_url, function(error, response, body) {
        if(error) {
          console.log("Error: " + error);
        }
        //console.log("Status code: " + response.statusCode);
        var $subpage = cheerio.load(body);

        var this_link_modded = response.request.uri.href;//this URL......
        var this_link = this_link_modded.replace("/posts/all", ""); //the website does a redirect...


        // $html->find('#content',0)->children(0)->children(0)->plaintext; //section id= content H1 > a
        //var this_location_a = $subpage("#content").find('a')[0].text().trim();
        var this_location_a = $subpage("#content").find('a'); //[0].text().trim();
        var this_location = $subpage( this_location_a[0] ).text().trim();

        var google_api_address = this_location + ' , UK';


          // var this_description_p = $subitem("#group_post").find("p");//contains the description
          // var this_p = $subitem( this_description_p[0] ).html(); //description p

        console.log("%s : %s", this_link, this_location);



          //Setup stuff
          var query = {'url': this_link };
          var update = {
            url: this_link,
            updatedDate: new Date(),
            locationtext : this_location
          };
          //var options = { upsert: true };
          var options = {  };

          // Find the document
          FreeGroup.findOneAndUpdate(query, update, options, function(error, result) {
              if (!error) {
                  // If the document doesn't exist
                  if (!result) {
                      // Create it
                      result = new FreeGroup({
                         url: this_link,
                         updatedDate: new Date(),
                         locationtext : this_location
                      });
                      //console.log("Saved new");
                  } else {
                    //console.log("result: %j", result);
                    //console.log("Updated");
                  }
                  // Save the document
                  result.save(function(error) {
                      if (!error) {
                          // Do something with the document
                          //console.log("Saved new");
                      } else {
                          console.log("error: %j", error);
                          throw error;
                      }
                  });
              }else{
                console.log("error: %j", error);
              }
          });


          scrape_address_googleapi(this_link, google_api_address);


      });//request callback
}




function scrape_address_googleapi(url_id, address){
  //https://maps.googleapis.com/maps/api/geocode/json?address=38%20upper%20clapton%20road&key=AIzaSyB0dSr4sTyQSykONifcifY6RbCO2KvyQpQ
  //https://github.com/Turfjs/turf-server-example/blob/master/index.js
  var addr_url = 'https://maps.googleapis.com/maps/api/geocode/json?address='+encodeURI(address)+'&key=AIzaSyBCqVhj6qV5DDtRhWH7_cY582K_bt5AGzk';
  //console.log('Address lookup '+url_id);// the db entry to update with this address
  //console.log(addr_url);

  request(addr_url, { json: true, gzip: true }, function(err, place) {
    //if (!err  && place.body.results[0].formatted_address && place.body.results[0].geometry.location ) {
    if (!err && place.body.results.length > 0 ) {
      if( place.body.results[0].formatted_address && place.body.results[0].geometry.location ){
          //console.log("GEOCODE: %j", place.body );

          //console.log(place.body.results[0].formatted_address);
          //console.log( "LngLat: %j",  place.body.results[0].geometry.location );

          //Setup stuff
          var query = {'url': url_id };
          var update = {
            url: url_id,
            updatedDate: new Date(),
            googleAddress: place.body.results[0].formatted_address,
            locationGPS: [ place.body.results[0].geometry.location.lng, place.body.results[0].geometry.location.lat ]  //[lng, lat] ALWAYS!!
          };
          //var options = { upsert: true };
          var options = {  };

          FreeGroup.findOneAndUpdate(query, update, options, function(error, result) {
                  if (!error) {
                      // If the document doesn't exist
                      if (!result) {
                          // Create it
                          result = new FreeItem({
                              url: url_id,
                              updatedDate: new Date(),
                              googleAddress: place.body.results[0].formatted_address,
                              locationGPS: [ place.body.results[0].geometry.location.lng, place.body.results[0].geometry.location.lat ]  //[lng, lat] ALWAYS!!
                          });
                      } else {

                      }
                      // Save the document
                      result.save(function(error) {
                          if (!error) {
                              // Do something with the document
                              console.log("Saved GPS %j", place.body.results[0].geometry.location);
                          } else {
                              console.log("error: %j", error);
                              throw error;
                          }
                      });
                  }else{
                    console.log("error: %j", error);
                  }
          });

      }else{ console.log("Google Cannot find you! ") }
    } else {
      console.log(err, place);
    }


  });
}