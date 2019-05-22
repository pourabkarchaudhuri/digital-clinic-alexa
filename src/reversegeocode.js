var request = require("request");
require('dotenv').config()

module.exports = {
  'reverseGeocode' : function(lat, long, callback){

    var geocode = lat + "," + long;
    //console.log("Geocode : " + geocode);
    var options = { method: 'POST',
      url: 'https://maps.googleapis.com/maps/api/geocode/json',
      qs:
       { latlng: geocode,
         key: `${process.env.GEOCODE_KEY}` },
      headers:
       { 'postman-token': '4f2daca8-4b06-1328-0317-a40b9ea7a2ac',
         'cache-control': 'no-cache',
         'content-type': 'application/json' } };


    request(options, function (error, response, body) {
      if (error) throw new Error(error);

      //console.log("Call Result : " + JSON.parse(body).results[JSON.parse(body).results.length-2].formatted_address);
      callback(null, body);
    });
  }
}
