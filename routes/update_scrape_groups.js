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

var FreeGroup = require('../models/freegroup');
var FreeItem = require('../models/freeitem');

var regex = /(https:\/\/groups\.freecycle\.org\/group\/)(\S{1,500})(UK\/posts\/)(\d{1,15})(\S{1,500})/i;  //can extract the group of this page ;)

/* GET home page. */
router.get('/', function(req, res) {

      var stream = FreeGroup.find().stream();
      stream.on('data', function (doc) {
        // do something with the mongoose document
        scrapeGroupPage(doc.url);


          // if(doc.url =="http://groups.freecycle.org/HackneyUK" || doc.url=="http://groups.freecycle.org/LewishamUK"){
          //   scrapeGroupPage(doc.url);
          //   console.log("HACKNEY FOUND");
          // }


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
      var scrape_url = group_url + "/posts/offer?page=1&resultsperpage=100&showall=off&include_offers=off&include_wanteds=off&include_receiveds=off&include_takens=off";      

      request(scrape_url, function(error, response, body) {
        if(error) {
          console.log("Error: " + error);
        }
        //console.log("Status code: " + response.statusCode);
        var $subpage = cheerio.load(body);
        $subpage('#group_posts_table tr').each(function( index ) {
          var anchors = $subpage(this).find('a');
          var the_title = $subpage(anchors[1]).text().trim();   //1 here is the second link, the one we are after!
          var the_link = $subpage(anchors[1]).attr('href');

          //some processing....
          //var regex = /(https:\/\/groups\.freecycle\.org\/group\/)(\S{1,500})(UK\/posts\/)(\d{1,15})(\S{1,500})/i;
          var extract = the_link.match(regex);
          var extract_group = "nogroup";
          if(extract != null && extract.length > 0){
            extract_group = extract[2];
          }

          //Setup stuff
          var query = {'url': the_link };
          var update = {
            updatedDate: new Date(),
            url: the_link,
            item: the_title,
            freecycleGroup: extract_group//,
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
                          item: the_title,
                          freecycleGroup: extract_group//,
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