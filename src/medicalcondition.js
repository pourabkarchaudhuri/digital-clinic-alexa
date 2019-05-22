var request = require("request");
require('dotenv').config()

module.exports = {
  'getConditionDetails' : function(querystring, callback){

  console.log("Condition Query : " + querystring);
  var options = { method: 'GET',
    url: 'https://api.infermedica.com/v2/conditions',
    headers:
     { 'Postman-Token': '807a3db1-90f4-4dd5-bced-f94595e356bf',
       'Cache-Control': 'no-cache',
       'app-key': `${process.env.INFERMEDICA_APP_KEY}`,
       'app-id': `${process.env.INFERMEDICA_APP_ID}` } };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);

    // console.log(body);
    //console.log(JSON.stringify(body));
    callback(null, JSON.parse(body));

    });
  }
}
