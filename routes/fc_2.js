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

/* GET home page. */
router.get('/', function(req, res) {

  res.writeHead(200, { "Content-Type" : "text/html" })

  //var out_str = ""; meh, just sendd data directtly to the client
  var pages_obj = [];

  request("https://www.freecycle.org/browse/UK/London", function(error, response, body) {
    // This URL has anchors to the London group pages
    if(error) {
      console.log("Error: " + error);
    }
    console.log("Status code: " + response.statusCode);

    var $ = cheerio.load(body);

    $('article#active_groups li').each(function( index ) {
      var title = $(this).find('a').text().trim();
      var link = $(this).find('a').attr('href');

      console.log("Title: " + title);
      console.log("Link: " + link);
      
      //processed link ;)
      var processed_link = link+"/posts/offer?page=1&resultsperpage=100&showall=off&include_offers=off&include_wanteds=off&include_receiveds=off&include_takens=off";
      //get the top 100 offers right now! :) I used the address bar to figure out this nice URL querystring format

      pages_obj.push(processed_link);
      //push our newley generated URIs into an arry for the next step

      //fs.appendFileSync('freecycle.txt', DATA + '\n'); //If you would like to have a textfile of the result, then use a command like this with something in DATA // DATA = processed_link??
    });

    console.log("FINISHED FC pass 1");

    for(i = 0; i < pages_obj.length; i++){
      //start looking at all the links on all the pages!!! :))
      //var page_title = $('head title').text().trim(); // this is from the previous 'home' / starting page....
      //console.log(page_title + " - " + pages_obj[i]);

      request(pages_obj[i], function(error, response, body) {
        if(error) {
          console.log("Error: " + error);
        }
        console.log("Status code: " + response.statusCode);
        var $subpage = cheerio.load(body);

        var page_title = $subpage('head title').text().trim();
        res.write("<h2>"+page_title+"</h2>");

        $subpage('#group_posts_table tr').each(function( index ) {
          var anchors = $subpage(this).find('a');
          console.log("num "+anchors.length )
          //console.log("anchors: " + anchors);
          var the_title = $subpage(anchors[1]).text().trim();   //1 here is the second link, the one we are after!
          var the_link = $subpage(anchors[1]).attr('href');
          console.log(the_title);

          res.write("<p><a target='_BLANK' href='"+the_link+"'>"+the_title+"</a></p>");
          //send the item link to the users browser

          //res.write("<p><a href='"+the_link+"'>"+page_title+" - "+the_title+"</a></p>");
        });
      });
    }
    //res.send(out_str); //this was not working as well for me so I have changed the output using res.write above.
  });
  
  //res.send("DONE!!");
  //This script can misbehave a bit, so I have set a manual delay of 30 seconds before closing the HTTP request to the client so we dont get errors onthe server.
  setTimeout(function(){
    res.end(); //the page in the users browser will never finish loading if you dont send this, send it immediately and the browser and server will cry as the closure functions will try to send data after the fact.
  },30000);

});

module.exports = router;
