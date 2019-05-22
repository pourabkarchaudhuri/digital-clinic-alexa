var request = require("request");
require('dotenv').config()

module.exports = {
  'getCaloriesBurnt' : function(querystring, callback){

    console.log("Nutrition Query : " + querystring);
    var options = { method: 'POST',
  url: 'https://trackapi.nutritionix.com/v2/natural/exercise',
  headers:
   { 'postman-token': '23c18515-4563-b81b-afbf-81b74e1b0f1b',
     'cache-control': 'no-cache',
     'content-type': 'application/json',
     'x-app-key': `${process.env.NUTRITIONIX_APP_KEY}`,
     'x-app-id': `${process.env.NUTRITIONIX_APP_ID}` },
  body:
   { query: querystring
      },
  json: true };

    request(options, function (error, response, body) {
      if (error) throw new Error(error);

      console.log("Execrise Activity Parser Result Count : " + JSON.stringify(body));
      callback(null, body);
    });
  }
}
