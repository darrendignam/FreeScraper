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

   	//go get the group pages...
   	$.getJSON("/api/groups", function(result){
        $.each(result, function(i, group_object){
            //$("body").append(group_object.title);
            var myLatLng = {lat: group_object.locationGPS[1], lng: group_object.locationGPS[0]};
            var infowindow = new google.maps.InfoWindow({
          		content: '<span class="map_infowindow" ><a href="/api/group/'+ group_object.title +'">'+ group_object.title +'</a></span>'
	        });
			var marker = new google.maps.Marker({
				position: myLatLng,
				map: map,
				title: group_object.title
	        });
	        marker.addListener('click', function() {
				closeAllMarkers();
          		infowindow.open(map, marker);
        	});
        	map_markers.push( marker );
        	map_infowindows.push( infowindow );
        });
    });

    // Try HTML5 geolocation.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        infoWindowLocation.setPosition(pos);
        infoWindowLocation.setContent('<span class="map_infowindow" >Your Location </span>');
        infoWindowLocation.open(map);
        map.setCenter(pos);
        map.setZoom(10);
      }, function() {
        //handleLocationError(true, infoWindowLocation, map.getCenter());
      });
    } else {
      // Browser doesn't support Geolocation
      //handleLocationError(false, infoWindowLocation, map.getCenter());
    }


});

function closeAllMarkers(){
	for(var i=0; i<map_infowindows.length; i++){
		map_infowindows[i].close();
	}
}

function handleLocationError(browserHasGeolocation, infoWindowLocation, pos) {
	infoWindowLocation.setPosition(pos);
	infoWindowLocation.setContent(browserHasGeolocation ?
	                      '<span class="map_infowindow" >Error: The Geolocation service failed.</span>' :
	                      '<span class="map_infowindow" >Error: Your browser doesn\'t support geolocation.</span>');
	infoWindowLocation.open(map);
}



//AIzaSyCbNOc3rnK_fgA8GAlriIXg9lJZHu9DKyM
//https://maps.googleapis.com/maps/api/js?key=AIzaSyCbNOc3rnK_fgA8GAlriIXg9lJZHu9DKyM&callback=initMap
