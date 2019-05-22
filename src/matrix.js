

var request = require("request");

class tweetScraper{

    constructor(){
        this.time = 5;
        this.limit = 300;
    }

    flutracer(callback){
        var options={
            url:`http://api.flutrack.org/?time=${this.time}`,
            method:'GET'
        }


            request(options,(error,response,body)=>{
                if(error){
                    console.log(error)
                    callback("error in api call",null);

                }else{

                    var parseData = JSON.parse(body);
                    var locList=[];

                    parseData.forEach(element => {
                        locList.push({"lat":element.latitude,"long":element.longitude})
                    });

                    if(locList.length === 0){
                        callback("loc list is empty",null);
                    }else{
                        callback(null,locList);
                    }

                }
            });

    }
}

// var ob = new tweetScraper();
//
//
//     ob.flutracer((errmsg,data)=>{
//         if(errmsg != null){
//             console.log(errmsg);
//         }
//         else{
//             console.log("data");
//         }
//     });


module.exports= tweetScraper;
