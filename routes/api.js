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

var moment = require('moment');


// var request = require('request');  //lets us get the data from a URL - freecycle in this case
// var cheerio = require('cheerio');  //Makes accessing the data from the requests easier, jQuery-like notation
// var fs = require('fs');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Item = require('../models/item');
var FreeGroup = require('../models/freegroup');

// var startdate = new Date('2014-05-18T20:00:00.000Z');
// var enddate = Date();  // new Date('2014-05-19T20:00:00.000Z');
  // var cutoff = new Date();
  // cutoff.setDate(cutoff.getDate()-1);
//db.collection.find({ startTime: { $gt: startdate, $lt:enddate } });
  //mongoose.model('FreeItem').find({}, function (err, items) {
  //mongoose.model('FreeItem').createIndex({ postdata: -1 });
  //mongoose.model('FreeItem').find({ postdata: { $gte: new Date(new Date().getTime()-3*24*60*60*1000 ).toISOString() } }, 
  //mongoose.model('Item').find({ freecycleGroup: { $eq: "Hackney"} } ,    // this works as a group page search...
  //mongoose.model('Item').find({ postdata: { $gte: new Date(new Date().getTime()-3*24*60*60*1000 ).toISOString() } }, 
  //mongoose.model('FreeItem').find({ postdata: {"$gte": new Date(2017, 4, 18), "$lt": new Date(2017, 4, 22) }} , 



/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'FreeScraper - freecycle scanner written in NodeJS' });
});

router.get('/all', function(req, res) {
  mongoose.model('Item')
    .find({})
    .limit(100)
    .sort({postdata: -1})
    .exec(function (err, items) {
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
			                              "items" : items,
                                    moment: moment
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
router.get('/group/:groupString/:searchString', function(req, res) {
  mongoose.model('Item')
    .find({ 
      "freecycleGroup": { $regex : new RegExp( req.params.groupString, "i") }, 
      $or : [
           {"item" : { $regex : new RegExp( req.params.searchString, "i") } },
           {"description" : { $regex : new RegExp( req.params.searchString, "i") } }
        ] 
    })
    .sort({postdata: -1})
    .limit(100)
    .exec( function (err, items) {
              if (err) {
                  return console.error(err);
              } else {
                        //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header

                 //res.json( items );

                      res.format({
                            //HTML response will render the index.ejs file in the views/items folder. We are also setting "items" to be an accessible variable in our view
                          html: function(){
                             res.render('items/index', {
                                    title: 'Search: "'+req.params.searchString+ '" in '+req.params.groupString,
                                    "items" : items,
                                    moment: moment
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

router.get('/group/:groupString', function(req, res) {
  mongoose.model('Item')
    .find({ freecycleGroup: { $regex : new RegExp( req.params.groupString, "i") } })
    .sort({postdata: -1})
    .limit(100)
    .exec( function (err, items) {
              if (err) {
                  return console.error(err);
              } else {
                        //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header

                 //res.json( items );

                      res.format({
                            //HTML response will render the index.ejs file in the views/items folder. We are also setting "items" to be an accessible variable in our view
                          html: function(){
                             res.render('items/index', {
                                    title: 'Group: '+req.params.groupString,
                                    "items" : items,
                                    moment: moment
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

router.get('/search/:searchString', function(req, res) {
  mongoose.model('Item')
    .find( { 
        $or : [
           {"item" : { $regex : new RegExp( req.params.searchString, "i") } },
           {"description" : { $regex : new RegExp( req.params.searchString, "i") } }
        ]
    })
    .sort({postdata: -1})
    .limit(100)
    .exec(function (err, items) {
//    { "item" : { $regex : /Bookcase/i } }
//    { "item" : { $regex : new RegExp(thesearch, "i") } }
              if (err) {
                  return console.error(err);
              } else {
                        //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header

                 //res.json( items );

                      res.format({
                            //HTML response will render the index.ejs file in the views/items folder. We are also setting "items" to be an accessible variable in our view
                          html: function(){
                             res.render('items/index', {
                                    title: 'Search: '+req.params.searchString,
                                    "items" : items,
                                    moment: moment
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


router.get('/near/:lng/:lat/:distance/:searchString', function(req, res) {
  mongoose.model('Item')
    .find({
      $or : [
           {"item" : { $regex : new RegExp( req.params.searchString, "i") } },
           {"description" : { $regex : new RegExp( req.params.searchString, "i") } }
        ],      
        'locationGPS' : {$near: {$geometry: {type: "Point" ,coordinates: [ req.params.lng , req.params.lat ]},$maxDistance: req.params.distance,$minDistance: 0}}
    })
    .sort({postdata: -1})
    .limit(100)
    .exec(function (err, items) {
  //mongoose.model('Item').find({'locationGPS' : {$near: {$geometry: {type: "Point" ,coordinates: [ '-0.055525600' , '51.5599178' ]},$maxDistance: 10000,$minDistance: 0}}} , function (err, items) {
              if (err) {
                  return console.error(err);
              } else {
                        //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header

                 //res.json( items );

                      res.format({
                            //HTML response will render the index.ejs file in the views/items folder. We are also setting "items" to be an accessible variable in our view
                          html: function(){
                             res.render('items/mapsearch', {
                                    title: 'Location Search: '+req.params.searchString,
                                    the_lat : req.params.lat,
                                    the_lng : req.params.lng,
                                    the_search : req.params.searchString,
                                    "items" : items,
                                    moment: moment
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


router.get('/near/:lng/:lat', function(req, res) {
//router.get('/near', function(req, res) {
  //LOCALHOST:3000/api/LAT/LNG    //is what the above should match
  //https://expressjs.com/en/guide/routing.html

// { latlngADDR : {$near: {$geometry: {type: "Point" ,coordinates: [ <longitude> , <latitude> ]},$maxDistance: <distance in meters>,$minDistance: <distance in meters>     }   }}
//51.5599178,-0.055525600000009945 = E5 8BQ
  mongoose.model('Item')
    .find({
        'locationGPS' : {$near: {$geometry: {type: "Point" ,coordinates: [ req.params.lng , req.params.lat ]},$maxDistance: 10000,$minDistance: 0}}
    })
    .sort({postdata: -1})
    .limit(100)
    .exec(function (err, items) {
  //mongoose.model('Item').find({'locationGPS' : {$near: {$geometry: {type: "Point" ,coordinates: [ '-0.055525600' , '51.5599178' ]},$maxDistance: 10000,$minDistance: 0}}} , function (err, items) {
              if (err) {
                  return console.error(err);
              } else {
                        //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header

                 //res.json( items );

                      res.format({
                            //HTML response will render the index.ejs file in the views/items folder. We are also setting "items" to be an accessible variable in our view
                          html: function(){
                             // res.render('items/index', {
                             //        title: 'All items',
                             //        "items" : items,
                             //        moment: moment
                             //    });
                                res.render('items/mapsearch', {
                                    title: 'Everything near here',
                                    the_lat : req.params.lat,
                                    the_lng : req.params.lng,
                                    the_search : req.params.searchString,
                                    "items" : items,
                                    moment: moment
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




// .aggregate([{ "$geoNear": {"near": {"type": "Point","coordinates": [ -81.093699, 32.074673 ]},"maxDistance": 500 * 1609,"spherical": true,"distanceField": "distance","distanceMultiplier": 0.000621371}}])




router.get('/distance/:lng/:lat', function(req, res) {
  mongoose.model('Item').aggregate([{ "$geoNear": {"near": {"type": "Point","coordinates": [ req.params.lng , req.params.lat ]},"maxDistance": 5000 * 1609,"spherical": true,"distanceField": "distance","distanceMultiplier": 0.000621371}}], function (err, items) {
              if (err) {
                  return console.error(err);
              } else {
                        //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header

                 //res.json( items );

                      res.format({
                            //HTML response will render the index.ejs file in the views/items folder. We are also setting "items" to be an accessible variable in our view
                          html: function(){
                             res.render('items/searchnear', {
                                    title: 'All items',
                                    "items" : items,
                                    moment: moment
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
//this route is for jquery autocomplete module
router.get('/groups/autocomplete', function(req, res) {
  mongoose.model('FreeGroup')
    .find({ "title" : { $regex : new RegExp( req.query.term, "i") } })
    .exec(function (err, groups) {
      //console.log("%j", groups);
              if (err) {
                  return console.error(err);
              } else {
                        //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header

                 //res.json( items );

                      res.format({
                            //HTML response will render the index.ejs file in the views/items folder. We are also setting "items" to be an accessible variable in our view
                          html: function(){
                             res.render('items/groups', {
                                    title: 'All groups',
                                    "groups" : groups,
                                    moment: moment
                                });
                          },
                          // JSON response will show all blobs in JSON format
                         json: function(){
                              //{"id":"Falco eleonorae","label":"Eleonora's Falcon","value":"Eleonora's Falcon"}
                              var autocomplete_list = [];
                              for(var i = 0; i < groups.length; i++){
                                  autocomplete_list.push({"id": groups[i].title, "label":groups[i].title  ,"value":groups[i].title, "url":groups[i].url });
                              }
                              res.json(autocomplete_list);

                              //res.json(groups);
                         }
                      });
              }     
    });
});

router.get('/groups', function(req, res) {
  mongoose.model('FreeGroup')
    .find({})
    .exec(function (err, groups) {
      //console.log("%j", groups);
              if (err) {
                  return console.error(err);
              } else {
                        //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header

                 //res.json( items );

                      res.format({
                            //HTML response will render the index.ejs file in the views/items folder. We are also setting "items" to be an accessible variable in our view
                          html: function(){
                             res.render('items/groups', {
                                    title: 'All groups',
                                    "groups" : groups,
                                    moment: moment
                                });
                          },
                          // JSON response will show all blobs in JSON format
                         json: function(){
                              res.json(groups);
                         }
                      });
              }     
    });
});

module.exports = router;