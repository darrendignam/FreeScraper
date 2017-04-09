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

  This is an abandoned experiment :/ Use at your own risk!!

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
var cheerio = require('cheerio');
var fs = require('fs');

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

    res.write("<h1>Freecycle Scraper: "+getDateTime()+"</h1>");

    var out_str = "";
    var pages_obj = [];

    request("https://www.freecycle.org/browse/UK/London", function(error, response, body) { 
      if(error) {
        console.log("Error: " + error);
      }
      console.log("Status code: " + response.statusCode);

      //console.log(body);

      //res.send(body);

      var $ = cheerio.load(body);

      $('article#active_groups li').each(function( index ) {
        var title = $(this).find('a').text().trim();
        var link = $(this).find('a').attr('href');

        console.log("Title: " + title);
        console.log("Link: " + link);
	
        //processed link ;)
        var processed_link = link+"/posts/offer?page=1&resultsperpage=100&showall=off&include_offers=off&include_wanteds=off&include_receiveds=off&include_takens=off";
        //get the top 100 offers right now! :)

        pages_obj.push(processed_link);	

	//out_str += "<p><a href='"+link+"/posts/offer?page=1&resultsperpage=100&showall=off&include_offers=off&include_wanteds=off&include_receiveds=off&include_takens=off'>"+title+"</a></p>"
	

        //fs.appendFileSync('freecyclehome.txt', title + '\n' + score + '\n' + user + '\n');
      });

      console.log("FINISHED FC pass 1");

	//for(i = 0; i < pages_obj.length; i++){
	for(i = 0; i < 2; i++){
             //var page_title = $('head title').text().trim(); // this is from the previous 'home' / starting page....
	     //console.log(page_title + " - " + pages_obj[i]);

	     	var items_obj = [];

             request(pages_obj[i], function(error, response, body) {
                 if(error) {
                     console.log("Error: " + error);
                 }
                 //console.log("Status code: " + response.statusCode);
                 var $subpage = cheerio.load(body);

                 var page_title = $subpage('head title').text().trim();
				 res.write("PROCESSING: "+page_title+" -- ");

                 $subpage('#group_posts_table tr').each(function( index ) {
                     var anchors = $subpage(this).find('a');
		     		 //console.log("num "+anchors.length )
                     //console.log("anchors: " + anchors);
		     		 var the_title = $subpage(anchors[1]).text().trim();   //1 here is the second link, the one we are after!
                     var the_link = $subpage(anchors[1]).attr('href');
		    		 console.log(the_title);

		    		 items_obj.push({
						"the_link"  : the_link,
						"the_title" : the_title
		    		 });


					 //res.write("<p><a target='_BLANK' href='"+the_link+"'>"+the_title+"</a></p>");

		     //////////////////////////////////// dont use me //res.write("<p><a href='"+the_link+"'>"+page_title+" - "+the_title+"</a></p>");
                 });

                 console.log(items_obj.length);

                 for(j = 0; j < items_obj.length; j++){
		                //var this_link = items_obj[j].the_link;
		                //var this_title = items_obj[j].the_title;

			             request(items_obj[j].the_link, function(error, response, body) {


			             	//console.log( response.req.href );  //.req.request.href );

			             	console.log("page: %j", response.request.uri.href);

			             	//res.write( response );
			             	//res.end();

			                 if(error) {
			                     console.log("Error: " + error);
			                 }
			                 //console.log("Status code: " + response.statusCode);
			                 var $subitem = cheerio.load(body);

			                 //get description and image
			                // var this_link = items_obj[j].the_link;
			                // var this_title = items_obj[j].the_title;
			                var this_link = response.request.uri.href;
			                var this_title = $subitem('head title').text().trim();

							var this_img = $subitem("#post_thumbnail").attr('src');
							var this_details = $subitem("#post_details").html();//time date
							var this_description_p = $subitem("#group_post").find("p");//contains the description
							var this_p = $subitem( this_description_p[0] ).html();
							var img_string = "";
							if (this_img){
								img_string = "<img style='max-height:200px; float:right;' src='"+ this_img +"' />"
							}


							res.write("<div class='node_js_group' style='min-height:200px;background:#eee;margin:5px;'><a style='font-weight:bold;font-size:150%;' target='_BLANK' href='"+this_link+"'>"+this_title+"</a>"+img_string+"<p>"+this_details+"</p>"+  this_p  +"</div>");



			                 //var page_title = $subpage('head title').text().trim();
							 //res.write("<h2>"+page_title+"</h2>");

			   //               $subpage('#group_posts_table tr').each(function( index ) {
			   //                   var anchors = $subpage(this).find('a');
					 //     		 //console.log("num "+anchors.length )
			   //                   //console.log("anchors: " + anchors);
					 //     		 var the_title = $subpage(anchors[1]).text().trim();   //1 here is the second link, the one we are after!
			   //                   var the_link = $subpage(anchors[1]).attr('href');
					 //    		 console.log(the_title);

					 //    		 items_obj.push(the_link);


						// // res.write("<p><a target='_BLANK' href='"+the_link+"'>"+the_title+"</a></p>");

					 //     //////////////////////////////////// dont use me //res.write("<p><a href='"+the_link+"'>"+page_title+" - "+the_title+"</a></p>");
			   //               });

			             });//end request single page
                 }

             });
        }


      //res.send(out_str);

    });
    
    //res.send("DONE!!");
	setTimeout(function(){
		res.end();
	},30000);

});

module.exports = router;