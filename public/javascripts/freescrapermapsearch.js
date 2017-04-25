var map;
var map_markers = [];
var map_infowindows = [];
var infoWindowLocation;
$(function() { 
	//alert('MAP!')
	//map = new GMaps({ div: '#map_container', lat: 52.944236,  lag: -1.378722 }); 
  map = new google.maps.Map(document.getElementById('map_container'), {
    	center: {lat: 54.196248, lng: -4.477640}, 
    	zoom: 6
	});
	infoWindowLocation = new google.maps.InfoWindow;
  infoWindowLocation.setPosition({ lat: the_lat, lng: the_lng });
  infoWindowLocation.setContent('<span class="map_infowindow" >"'+the_search+'" Near Here</span>');
  infoWindowLocation.open(map);
  map.setCenter({
    lat: the_lat,
    lng: the_lng
  });
  map.setZoom(12);

   	//go get the group pages... //this can be improved...
   	$.getJSON(window.location.href, function(result){
        map.setZoom(12);
        map.setCenter({
          lat: the_lat,
          lng: the_lng
        });
        
        $.each(result, function(i, item_object){
            //$("body").append(item_object.title);
            var myLatLng = {lat: item_object.locationGPS[1], lng: item_object.locationGPS[0]};
            var infowindow = new google.maps.InfoWindow({
          		content: '<span class="map_infowindow" ><a href="'+ item_object.url +'" target="_blank">'+ item_object.item +'</a><img style="max-width:100px;max-height:100px" src="'+item_object.thumbnail+'"></span>'
	        });
			var marker = new google.maps.Marker({
				position: myLatLng,
				map: map,
				title: item_object.title
	        });
	        marker.addListener('click', function() {
				closeAllMarkers();
          		infowindow.open(map, marker);
        	});
        	map_markers.push( marker );
        	map_infowindows.push( infowindow );
        });

    });

  google.maps.event.addListener(map, 'dragend', function () {
      $('#input_search_address_locked').val( this.getCenter().lat()+','+this.getCenter().lng() );

      var search_string = $('#input_search_term_local').val();
      var target_url = '/api/near/'+this.getCenter().lng()+'/'+this.getCenter().lat()+'/10000/'+ search_string;

      infoWindowLocation.setPosition( this.getCenter() );
      infoWindowLocation.setContent('<span class="map_infowindow" ><a href="'+target_url+'">Search again Near Here</a></span>');    
      //console.log(this.getCenter());
      // myMarker.setPosition(this.getCenter()); // set marker position to map center
      // updatePosition(this.getCenter().lat(), this.getCenter().lng()); // update position display
  });

  $("#input_search_term").keypress(function(e) {
      if(e.which == 13) {
          //alert('You pressed enter!');
          window.location.href = '/api/group/'+$("#input_search_group_picker").val() +'/'+$("#input_search_term").val()  ;
      }
  });
  
});

function closeAllMarkers(){
	for(var i=0; i<map_infowindows.length; i++){
		map_infowindows[i].close();
	}
}





//AIzaSyCbNOc3rnK_fgA8GAlriIXg9lJZHu9DKyM
//https://maps.googleapis.com/maps/api/js?key=AIzaSyCbNOc3rnK_fgA8GAlriIXg9lJZHu9DKyM&callback=initMap
