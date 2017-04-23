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

  This is the most useful route for me personally, and where most of the work happens. It gets a list of all the London groups, then then
  gets the top 100 offers from those groups and creates a list of anchors/links on a single page for easy browsing of FreeCycle.

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

var FreeItem = require('../models/freeitem');

var regex_date     = /(.*)(<span>Date :<\/span>)(.*)/i;
var regex_Location = /(.*)(<span>Location :<\/span>)(.*)/i;
//var regex_postcode = /([A-Z]?\d(:? \d[A-Z]{2})?|[A-Z]\d{2}(:? \d[A-Z]{2})?|[A-Z]{2}\d(:? \d[A-Z]{2})?|[A-Z]{2}\d{2}(:? \d[A-Z]{2})?|[A-Z]\d[A-Z](:? \d[A-Z]{2})?|[A-Z]{2}\d[A-Z](:? \d[A-Z]{2})?)/i;
var regex_postcode = /[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}/i; //the previous one didnt work for me...

var google_geo_API_key = 'AIzaSyB0dSr4sTyQSykONifcifY6RbCO2KvyQpQ'; //goto the API manager and restrict this to the correct domain once it is in the wild
//https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=AIzaSyB0dSr4sTyQSykONifcifY6RbCO2KvyQpQ

/* GET home page. */
router.get('/', function(req, res) {

      removeDeadItems();

      var stream = FreeItem.find().stream();
      stream.on('data', function (doc) {

        checkDeadItemPage(doc.url);

      }).on('error', function(err) {
        // handle the error
        console.log(err);
      }).on('close', function() {
        // the stream is closed
        console.log("scan complete...");
        //now delete docs/aka_rows marked for deletion....
        removeDeadItems();
      });

      res.send("Processing....");
});

module.exports = router;

function removeDeadItems(){
      var stream2 = FreeItem.find({ "deaditem":true }).stream();
      stream2.on('data', function (doc) {

        doc.remove();
        console.log("REMOVED");

      }).on('error', function(err) {
        // handle the error
        console.log(err);
      }).on('close', function() {
        // the stream is closed
        console.log("scan complete...");
        //now delete docs/aka_rows marked for deletion....

      });

}

function checkDeadItemPage(item_url){
      // var scrape_url = group_url + "/posts/offer?page=1&resultsperpage=100&showall=off&include_offers=off&include_wanteds=off&include_receiveds=off&include_takens=off";      

      request(item_url, function(error, response, body) {
            if(error) {
              console.log("Error: " + error);
            }
            //console.log("Status code: " + response.statusCode);

            var this_link = "";
            if(response){ //trying to read this property bugs out quite a lot... this is a way to deal with it
              this_link = response.request.uri.href;
              
              var $subpage = cheerio.load(body);

              var h1_tag = $subpage('#group_box').find("h1");//.text().trim();  
              var p_tag = $subpage('#group_box').find("p");//.text().trim(); 
              //console.log( $subpage( h1_tag[0] ).html()  );  //  == "Message not found"
              //console.log( $subpage( p_tag[0] ).html()  );  // == " This Post has been closed . "    inc a;l the spaces....

              if( $subpage( h1_tag[0] ).html() =="Message not found" && $subpage( p_tag[0] ).html() == " This Post has been closed . "){
                  console.log("DELETE DELETE DELETE");
                  var query = {'url': this_link };
                  var update = {
                      deaditem: true
                  };
                  //var options = { upsert: true };
                  var options = {  };

                  FreeItem.findOneAndUpdate(query, update, options, function(error, result) {
                      if (!error) {
                          // If the document doesn't exist
                          if (!result) {
                              // Create it
                              result = new FreeItem({
                                deaditem: true
                              });
                              //console.log("Saved new");
                          } else {
                            //console.log("result: %j", result);
                            //console.log("Updated");
                          }
                          // Save the document
                          result.save(function(error) {
                              if (!error) {
                                  // Do something with the document - well, actually, we think the result has been saved, created, or updated, so celebrate with a bit of google fu
                                  console.log("Marked for deletion... %s", this_link);
                              } else {
                                  console.log("error: %j", error);
                                  throw error;
                              }
                          });
                      }else{
                        console.log("error: %j", error);
                      }
                  });
              }
          }
      });
}








function scrapeItemPage(item_url){
    //console.log(item_url);

    request(item_url, {gzip: true }, function(error, response, body) {
          if(error) {
            console.log("Error: " + error);
          }
          var $subitem = cheerio.load(body);
          //scrape
          var this_link = response.request.uri.href;
          var this_title = $subitem('head title').text().trim();


          var this_description_p = $subitem("#group_post").find("p");//contains the description
          var this_p = $subitem( this_description_p[0] ).html(); //description p

          var tmp_postcode = "";
          var extract_postcode = "";
          if(this_p){
            extract_postcode = this_p.match(regex_postcode);
          }

          if(extract_postcode != null && extract_postcode.length > 0){
            //console.log("%j", extract_postcode);
            tmp_postcode = extract_postcode[0].trim();
          }

          var this_img = $subitem("#post_thumbnail").attr('src');
          //look for thumbnail....
          var img_string = "";
          if (this_img){
            img_string = this_img;
          }

          //var this_details = $subitem("#post_details").html();//time date
          //var details_divs = $subitem( this_details ).find("div");
          //<div><span>Location :</span>Bethnal Green (off Roman Road)</div>  <div><span>Date :</span> Wed Apr 19 10:42:52 2017</div>
          var this_details = $subitem("#post_details").find("div");
          var tmp_location = "";//div[0]
          var tmp_date = "";//div[1]
          if(this_details != null && this_details.length > 1){
            this_location = $subitem( this_details[0] ).html();
            //delete the span...
            var extract_location = this_location.match(regex_Location);
            if(extract_location != null && extract_location.length > 0){
              tmp_location = extract_location[extract_location.length-1].trim();
            }

            this_date = $subitem( this_details[1] ).html();
            var extract_date = this_date.match(regex_date);
            if(extract_date != null && extract_date.length > 0){
              tmp_date = extract_date[extract_date.length-1].trim();
            }
          }

          //check for null, might be a closed item that needs to be taken out of the database...
          if(this_p == null){
            console.log(this_link);
            console.log("NULL NULL NULL NULL NULL NULL NULL NULL NULL NULL NULL NULL NULL NULL NULL NULL NULL NULL NULL NULL NULL NULL NULL NULL NULL NULL NULL NULL NULL ");
            return;
          }
          
          //Setup stuff
          var query = {'url': this_link };
          var update = {
            updatedDate: new Date(),
            description: this_p,
            picture: img_string,
            dateText: tmp_date,
            postDate: new Date(tmp_date),
            locationText: tmp_location,
            postcode: tmp_postcode
          };
          //var options = { upsert: true };
          var options = {  };

          FreeItem.findOneAndUpdate(query, update, options, function(error, result) {
              if (!error) {
                  // If the document doesn't exist
                  if (!result) {
                      // Create it
                      result = new FreeItem({
                          updatedDate: new Date(),
                          description: this_p,
                          picture: img_string,
                          dateText: tmp_date,
                          postDate: new Date(tmp_date),
                          locationText: tmp_location,
                          postcode: tmp_postcode
                      });
                      //console.log("Saved new");
                  } else {
                    //console.log("result: %j", result);
                    //console.log("Updated");
                  }
                  // Save the document
                  result.save(function(error) {
                      if (!error) {
                          // Do something with the document - well, actually, we think the result has been saved, created, or updated, so celebrate with a bit of google fu
                          console.log("Saved... %s", this_link);
                          //get geolocation from google....
                          address_str = tmp_location + " , "+tmp_postcode+" , UK";
                          scrape_address_googleapi(this_link ,address_str);
                      } else {
                          console.log("error: %j", error);
                          throw error;
                      }
                  });
              }else{
                console.log("error: %j", error);
              }
          });

          console.log('%j', update);


          //res.log("<div class='node_js_group' style='min-height:200px;background:#eee;margin:5px;'><a style='font-weight:bold;font-size:150%;' target='_BLANK' href='"+this_link+"'>"+this_title+"</a>"+img_string+"<p>"+this_details+"</p>"+  this_p  +"</div>");
          //render a nice detailed description of the item woth more metadata and a link to FreeCycle :)
    });//end request single page
}

function scrape_address_googleapi(url_id, address){
  //https://maps.googleapis.com/maps/api/geocode/json?address=38%20upper%20clapton%20road&key=AIzaSyB0dSr4sTyQSykONifcifY6RbCO2KvyQpQ
  //https://github.com/Turfjs/turf-server-example/blob/master/index.js
  var addr_url = 'https://maps.googleapis.com/maps/api/geocode/json?address='+encodeURI(address)+'&key=AIzaSyB0dSr4sTyQSykONifcifY6RbCO2KvyQpQ';
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
            updatedDate: new Date(),
            googleAddress: place.body.results[0].formatted_address,
            locationGPS: [ place.body.results[0].geometry.location.lng, place.body.results[0].geometry.location.lat ]  //[lng, lat] ALWAYS!!
          };
          //var options = { upsert: true };
          var options = {  };

          FreeItem.findOneAndUpdate(query, update, options, function(error, result) {
                  if (!error) {
                      // If the document doesn't exist
                      if (!result) {
                          // Create it
                          result = new FreeItem({
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

  // request(item_url, function(error, response, body) {

  // });

}

function ____scrapeItemPage___(item_url){
      // var scrape_url = group_url + "/posts/offer?page=1&resultsperpage=100&showall=off&include_offers=off&include_wanteds=off&include_receiveds=off&include_takens=off";      

      request(item_url, function(error, response, body) {
        if(error) {
          console.log("Error: " + error);
        }
        //console.log("Status code: " + response.statusCode);
        var $subpage = cheerio.load(body);
        $subpage('#group_posts_table tr').each(function( index ) {
          var anchors = $subpage(this).find('a');
          var the_title = $subpage(anchors[1]).text().trim();   //1 here is the second link, the one we are after!
          var the_link = $subpage(anchors[1]).attr('href');

          //Setup stuff
          var query = {'url': the_link };
          var update = {
            updatedDate: new Date(),
            url: the_link,
            item: the_title//,
            //freecycleGroup: destUrl
          };
          //var options = { upsert: true };
          var options = {  };

          // Find the document
          FreeItem.findOneAndUpdate(query, update, options, function(error, result) {
              if (!error) {
                  // If the document doesn't exist
                  if (!result) {
                      // Create it
                      result = new FreeItem({
                         updatedDate: new Date(),
                          url: the_link,
                          item: the_title//,
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
        });
      });
}