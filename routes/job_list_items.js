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

var Item = require('../models/item');

var startdate = new Date('2014-05-18T20:00:00.000Z');
var enddate = Date();  // new Date('2014-05-19T20:00:00.000Z');

//db.collection.find({ startTime: { $gt: startdate, $lt:enddate } });

/* GET home page. */
router.get('/', function(req, res) {

	//mongoose.model('FreeItem').find({}, function (err, items) {
	//mongoose.model('FreeItem').createIndex({ postdata: -1 });
 	//mongoose.model('FreeItem').find({ postdata: { $gte: new Date(new Date().getTime()-3*24*60*60*1000 ).toISOString() } }, 


 	//mongoose.model('FreeItem').find({ postdata: {"$gte": new Date(2017, 4, 18), "$lt": new Date(2017, 4, 22) }} , 
	var cutoff = new Date();
	cutoff.setDate(cutoff.getDate()-1);


	//mongoose.model('Item').find({ freecycleGroup: { $eq: "Hackney"} } , 	 // this works as a group page search...

	mongoose.model('Item').find({ postdata: { $gte: new Date(new Date().getTime()-3*24*60*60*1000 ).toISOString() } }, 
 		function (err, items) {
              if (err) {
                  return console.error(err);
              } else {
			                  //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header

								 //res.json( items );

			                res.format({
			                      //HTML response will render the index.ejs file in the views/items folder. We are also setting "items" to be an accessible variable in our view
			                    html: function(){
			                       res.render('items/index', {
			                              title: 'All items',
			                              "items" : items
			                          });
			                    },
			                    // JSON response will show all blobs in JSON format
			                   json: function(){
			                        res.json(items);
			                   }
			                });
              }     
       });

});

module.exports = router;