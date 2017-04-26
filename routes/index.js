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

  Homepage of this app linking to the various versions of the script.

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
var mongoose = require('mongoose'); 
var Schema = mongoose.Schema;
var moment = require('moment');

//datamining
var ipaddress = require('../models/ipaddress');

var Item = require('../models/item');
var FreeGroup = require('../models/freegroup');


/* GET home page. */
router.get('/', function(req, res) {
  console.log('Route: index.js IP:' + req.ips + '   X-Forward: ' + getClientAddress(req));

  res.render('index', { title: 'FreeScraper' });
});

router.get('/search', function(req, res) {
  // console.log('Route: index.js IP:' + req.ips + '   X-Forward: ' + getClientAddress(req));
  res.render('search_freescraper', { title: 'FreeScraper' });
});

router.get('/about', function(req, res) {
  res.render('about', { title: 'about' });
});

router.get('/donate', function(req, res) {
  res.render('about', { title: 'donate' });
});

router.get('/gettheapp', function(req, res) { 
  res.render('about', { title: 'The App' });
});

router.get('/groups', function(req, res) { 
  mongoose.model('FreeGroup')
    .find({})
    .sort({title: 1})
    .exec(function (err, groups) {
      //console.log("%j", groups);
              if (err) {
                  return console.error(err);
              } else {
                 res.render('group_list', {
                        title: 'All groups',
                        "groups" : groups//,
                        //moment: moment
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
                 res.render('items/index', {
                        title: 'Group: '+req.params.groupString,
                        "items" : items,
                        moment: moment
                  });
              }     
       });
});

router.get('/latest', function(req, res) { 
  mongoose.model('Item')
    .find({})
    .limit(100)
    .sort({postdata: -1})
    .exec(function (err, items) {
        if (err) {
            return console.error(err);
        } else {
             res.render('items/index', {
                    title: 'All items',
                    "items" : items,
                    moment: moment
              });
        }     
    });
});


getClientAddress = function (req) {
    var tmpStr= (req.headers['x-forwarded-for'] || '').split(',')[0]  || req.connection.remoteAddress;
    //mongoose.model('Item').add({ipaddress: tmpStr});

    return tmpStr;
};

module.exports = router;
