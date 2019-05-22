var request = require("request");


module.exports = {
  'scrapeTwitter' : function(callback){

    var options = { method: 'GET',
      url: 'http://api.flutrack.org/',
      qs: { s: 'feverANDcoughORfever', time: '1', limit: '5' },
      headers:
       { 'Postman-Token': '5e4f6ad2-44cb-4029-aca4-37eeca61f7f6',
         'Cache-Control': 'no-cache' } };

    request(options, function (error, response, body) {
      if (error) throw new Error(error);

      //console.log(body);
      callback(null, body);
    });
  }
}
