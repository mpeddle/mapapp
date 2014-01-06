// vars for places found
var place1;
var place2;
var map;
var flightPath;

//init function
function initialize() {
  var mapOptions = {
    center:new google.maps.LatLng(41.5,-73),
    zoom:9,
    maxZoom:15,
    mapTypeId:google.maps.MapTypeId.ROADMAP
  };

  map=new google.maps.Map(document.getElementById("map-canvas"),mapOptions);

  var input1 = document.getElementById('target1');
  var input2 = document.getElementById('target2');

  var autocomplete1 = new google.maps.places.Autocomplete(input1); 
  autocomplete1.setComponentRestrictions({'country': 'us'});

  var autocomplete2 = new google.maps.places.Autocomplete(input2); 
  autocomplete2.setComponentRestrictions({'country': 'us'});

  //place1
  google.maps.event.addListener(autocomplete1, 'place_changed', function() {
      place1 = autocomplete1.getPlace();
      if ($.inArray("airport",place1.types) >= 0 ){
        var image = {
          url: place1.icon,
          size: new google.maps.Size(71, 71),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(17, 34),
          scaledsize: new google.maps.Size(25, 25)
      };

        var marker = new google.maps.Marker({
          map: map,
          icon: image,
          title: place1.name,
          position: place1.geometry.location
      });

      //bounds.extend(place1.geometry.location);
      };
  });

  //place2
  google.maps.event.addListener(autocomplete2, 'place_changed', function() {
      place2 = autocomplete2.getPlace();
      if ($.inArray("airport",place2.types) >= 0 ){
        var image = {
          url: place2.icon,
          size: new google.maps.Size(71, 71),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(17, 34),
          scaledsize: new google.maps.Size(25, 25)
      };

        var marker = new google.maps.Marker({
          map: map,
          icon: image,
          title: place2.name,
          position: place2.geometry.location
      });

      //bounds.extend(place2.geometry.location);
      };
  });

}

function plotLineBetweenAirports () {
  //clear map
  if (flightPath){
    flightPath.setMap(null);
  }
  //add a line between the airports
  lat1 = place1.geometry.location.mb;
  lon1 = place1.geometry.location.nb;
  lat2 = place2.geometry.location.mb;
  lon2 = place2.geometry.location.nb;
  var flightPlanCoordinates = [
    new google.maps.LatLng(lat1,lon1),
    new google.maps.LatLng(lat2,lon2)
  ];
  flightPath = new google.maps.Polyline({
    path: flightPlanCoordinates,
    strokeColor: '#FF0000',
    strokeOpacity: 1.0,
    strokeWeight: 2
  });

  flightPath.setMap(map);
  zoom();
}

function zoom() {
  var bounds = new google.maps.LatLngBounds();
  flightPath.getPath().forEach(function(latLng) {
    bounds.extend(latLng);
  });
  map.fitBounds(bounds);
}

function getNMDistance(lat1,lon1,lat2,lon2) {
  //get distance in nautical miles
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  var nm_rate = 0.539957; //conversion to nautical miles
  return d*nm_rate;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

function submitAirports() {
  //validate airports; throw an error if either location isn't an airport
  try {
    console.log(place1,place2);
    if(typeof place1 === 'undefined' | typeof place2 === 'undefined'){
      $('#error').text("Please select two airports")
      console.log('1');
    }
    else if ($.inArray("airport",place1.types) < 0 || $.inArray("airport",place2.types) < 0) {
      $('#error').text("Not an airport.  Please select another place")
      console.log('2');
    }
    else {
      console.log('3');
      $('#error').empty();
      lat1 = place1.geometry.location.mb;
      lon1 = place1.geometry.location.nb;
      lat2 = place2.geometry.location.mb;
      lon2 = place2.geometry.location.nb;
      nautical_miles = getNMDistance(lat1,lon1,lat2,lon2).toFixed(1);
      $("#results").text(nautical_miles+" nautical miles apart");
      plotLineBetweenAirports();
    }
  }
  catch(err) {
      console.log("catch");
    $('#error').text("Not an airport.  Please select another place")
  }
}
google.maps.event.addDomListener(window, 'load', initialize);
