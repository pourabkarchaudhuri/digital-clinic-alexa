var request = require("request");
var jarowrinkler = require('./jarowrinkler');
var deasync = require('deasync');
require('dotenv').config()
module.exports = {

'getMedicine' : function(medicine, callback){
    var endpoint = 'http://www.healthos.co/api/v1/search/medicines/brands/' + medicine;
    var options = { method: 'GET',
    url: endpoint,
    headers:

     { 'postman-token': 'c1194b98-00c3-a803-f05f-2e0f8bb3b3da',
       'cache-control': 'no-cache',
       Authorization: `Bearer ${process.env.HEALTHOS_KEY}` } };

    request(options, function (error, response, body) {

      if (error) throw new Error(error);
      let JaroWrinklerResponse = deasync(function(callback){
               jarowrinkler.JaroWrinklerParser(body, medicine, callback);
             })();
      //console.log(body);
        callback(null,JaroWrinklerResponse);
      });
  }
}
