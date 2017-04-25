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

var geocoder;

$(function() {
	$(".img_grid img").click(function() {
		var tmpWidth = Math.floor($(window).width() * 0.8); 
	    $('<div><div class="modal_dialog"><img class="container-fluid text-center" src="'+ $(this).attr('src').replace("post_thumb", "post_image") +'" /></div><div>').dialog({minWidth:tmpWidth});
	});
	//old table style...
	$(".itemthumb img").click(function() {
		var tmpWidth = Math.floor($(window).width() * 0.8); 
	    $('<div><div class="modal_dialog"><img src="'+ $(this).attr('src').replace("post_thumb", "post_image") +'" /></div><div>').dialog({minWidth:tmpWidth});
	});

	if(getCookie('table_view_on')=='true'){
		$('#fs_grid').hide();
		$('#fs_table').show();
	}

	//viewType button stuff..
	$('#btn_fluid').button();
	$('#btn_table').button();
	$('#btn_fluid').click(function(){
		$('#fs_grid').show();
		$('#fs_table').hide();
		setCookie("table_view_on", 'false', 365);
	});
	$('#btn_table').click(function(){
		$('#fs_grid').hide();
		$('#fs_table').show();
		setCookie("table_view_on", 'true', 365);
	});

	//autocomplete for the groups
  	 $("#input_search_group").autocomplete({
     	source: "/api/groups/autocomplete",
     	minLength: 2,
     	select: function( event, ui ) {
        	//console.log( "Selected: " + ui.item.value + " aka " + ui.item.id );
        	window.location.href = '/api/group/'+ui.item.value   ; //ui.item.url ;
     	}
    });
	$("#input_search_group").keypress(function(e) {
	    if(e.which == 13) {
	        //alert('You pressed enter!');
	        window.location.href = '/api/group/'+$("#input_search_group").val()   ;
	    }
	});

	//autocomplete for the group and search
  	 $("#input_search_group_picker").autocomplete({
     	source: "/api/groups/autocomplete",
     	minLength: 2,
     	select: function( event, ui ) {
        	//console.log( "Selected: " + ui.item.value + " aka " + ui.item.id );
        	//window.location.href = '/api/group/'+ui.item.value   ; //ui.item.url ;
        	$("#input_search_group_picker").val(ui.item.value);
     	}
    });
	$("#input_search_term").keypress(function(e) {
	    if(e.which == 13) {
	        //alert('You pressed enter!');
	        window.location.href = '/api/group/'+$("#input_search_group_picker").val() +'/'+$("#input_search_term").val()  ;
	    }
	});
	$('#button_search_group').click(function(){
		window.location.href = '/api/group/'+$("#input_search_group_picker").val() +'/'+$("#input_search_term").val()  ;
	})

	//geloaction search...
	geocoder = new google.maps.Geocoder();
	$('#button_search_location').click(function(){
		var addr_string = $('#input_search_address').val();
		var search_string = $('#input_search_term_location').val();
		geocoder.geocode( { 'address': addr_string}, function(results, status) {
			if (status == 'OK') {
				//'lng/lat/km/search/'
				//console.log(results);
				window.location.href = '/api/near/'+results[0].geometry.location.lng()+'/'+results[0].geometry.location.lat()+'/10000/'+ search_string;

				// map.setCenter(results[0].geometry.location);
				// var marker = new google.maps.Marker({
				//     map: map,
				//     position: results[0].geometry.location
				// });
			} else {
				alert('Search failed: ' + status);
			}
		});
	});
  $("#input_search_term_location").keypress(function(e) {
      if(e.which == 13) {
      		$('#button_search_location').click();
      }
  });		

	//helpers for the map search page
	if(the_lat && the_lng){
		$('#input_search_address_locked').val(the_lat+','+the_lng);
		$('#input_search_term_local').val( the_search );
	}
	$('#button_search_local').click(function(){
		var this_lnglat = $('#input_search_address_locked').val().split(',');
		var this_lng = this_lnglat[1];//todo lat and lng are getting out of hand, review and fix all the refs!:)
		var this_lat = this_lnglat[0];
		var search_string = $('#input_search_term_local').val();
		window.location.href = '/api/near/'+this_lng+'/'+this_lat+'/10000/'+ search_string;
	});
	$("#input_search_term_local").keypress(function(e) {
	      if(e.which == 13) {
			var this_lnglat = $('#input_search_address_locked').val().split(',');
			var this_lng = this_lnglat[1];//todo lat and lng are getting out of hand, review and fix all the refs!:)
			var this_lat = this_lnglat[0];
			var search_string = $('#input_search_term_local').val();
			window.location.href = '/api/near/'+this_lng+'/'+this_lat+'/10000/'+ search_string;
	      }
	});	

});//end page loaded


function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}