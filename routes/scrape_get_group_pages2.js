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

/* GET home page. */
router.get('/', function(req, res) {

  //res.writeHead(200, { "Content-Type" : "text/html" })

  //var out_str = ""; meh, just sendd data directtly to the client
  var pages_obj = [];

  request("https://www.freecycle.org/browse/UK/Yorkshire%20and%20the%20Humber", function(error, response, body) {
    // This URL has anchors to the London group pages
    if(error) {
      console.log("Error: " + error);
    }
    console.log("fc_2: Status code: " + response.statusCode);

    var $ = cheerio.load(body);

    $('article#active_groups li').each(function( index ) {
      //var title = $(this).find('a').text().trim();
      var link = $(this).find('a').attr('href');

      //var processed_link = link ; //+"/posts/offer?page=1&resultsperpage=100&showall=off&include_offers=off&include_wanteds=off&include_receiveds=off&include_takens=off";

      pages_obj.push(link);
      //add to DB...

          //Setup stuff
          var query = {'url': link };
          var update = {
            updatedDate: new Date(),
            url: link//,
            //item: the_title//,
            //freecycleGroup: destUrl
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
                         updatedDate: new Date(),
                          url: link//,
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

    //console.log("%j", pages_obj);

    //console.log("FINISHED FC pass 1");

    // for(i = 0; i < pages_obj.length; i++){
    //   //start looking at all the links on all the pages!!! :))
    //   //var page_title = $('head title').text().trim(); // this is from the previous 'home' / starting page....
    //   // console.log( pages_obj );

    // }

    console.log( pages_obj );
    res.send('Processing data.... %j', pages_obj);
  });
});

module.exports = router;
