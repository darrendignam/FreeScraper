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

    *************************************************************************************************************************************
*/

var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose'); 
var Schema = mongoose.Schema;

var ipaddress = require('./models/ipaddress');

mongoose.connect('mongodb://heroku_jt8w96fw_user:thedoctorwashere1900@ds163010.mlab.com:63010/heroku_jt8w96fw');
// { user: "heroku_jt8w96fw", account: "heroku_jt8w96fw" }

var routes = require('./routes/index');
var api = require('./routes/api');
var fc = require('./routes/fc');
var fc_2 = require('./routes/fc_2');  //most useful route ?? The others are experimental
var fc_3 = require('./routes/fc_3');
var fc_4 = require('./routes/fc_4');
var fc_6 = require('./routes/fc_6');

//var job_scrape_london = require('./routes/scrape_london');
//var job_scrape_groups = require('./routes/scrape_get_group_pages');
var update_scrape_groups = require('./routes/update_scrape_groups');
var update_scrape_items = require('./routes/update_scrape_items');
var update_remove_dead_items = require('./routes/update_remove_dead_items');
var update_group_gps = require('./routes/update_group_gps');
var scrape_get_group_pages = require('./routes/scrape_get_group_pages');

var job_list_items = require('./routes/job_list_items');



var app = express();

var http = require('http');
http.globalAgent.maxSockets = 20;

// app.set('port', 3000);
app.set('port', process.env.PORT || 3000);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/api', api);
app.use('/fc', fc);
app.use('/fc_2', fc_2);
app.use('/fc_3', fc_3);
app.use('/fc_4', fc_4);
app.use('/fc_6', fc_6);

//app.use('/job_scrape_london', job_scrape_london); //sends links to the DB
//app.use('/job_scrape_groups', job_scrape_groups); //grabs group pages into the DB - all should be scraped now
app.use('/update_scrape_groups', update_scrape_groups); //sends links to the DB
app.use('/update_scrape_items', update_scrape_items); //sends links to the DB
app.use('/update_remove_dead_items', update_remove_dead_items);
app.use('/update_group_gps', update_group_gps);
app.use('/scrape_get_group_pages', scrape_get_group_pages);

app.use('/job_list_items', job_list_items);



/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// show errors
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: err
    });
});

//app.listen(app.get('port'));
//module.exports = app;
app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});