const request = require('request');


class GeoCalc{

    constructor(){

        this.earth_rad = 6371.00;
        this.kilometre = 1.60934

    }

    calcNearest(userLoc,affectedLoc,callback){

        var min = this.calcDistance(userLoc.lat,userLoc.lng,affectedLoc[0].lat,affectedLoc[0].long);
        console.log("Initial min :",min);
        var nearestLoc;

        affectedLoc.forEach(element => {
            var newDis =  this.calcDistance(userLoc.lat,userLoc.lng,element.lat,element.long);

            if(newDis < min){
                min = newDis;
                nearestLoc={
                    "lat":element.lat,
                    "long":element.long
                }
            }

        });

       console.log("Nearest distance :",min);
       console.log("Nearest location :",nearestLoc.lat,nearestLoc.long);

        this.revGeoCode(nearestLoc.lat,nearestLoc.long,(error,data)=>{
            if(error){
                console.error(error);
            }else{
                var parseData=JSON.parse(data);
                console.log(parseData.results[0].formatted_address);
                callback(min,nearestLoc,parseData.results[0].formatted_address);
            }
        })
    }



    calcDistance(latfrom,lonfrom,latto,lonto){


        var deltaLat = (latto - latfrom) * (Math.PI / 180)
        var deltaLon = (lonto - lonfrom) * (Math.PI / 180)

        var a = Math.sin(deltaLat/2)*Math.sin(deltaLat/2)+Math.cos(latfrom*(Math.PI/180))*Math.cos(latto*(Math.PI/180))*Math.sin(deltaLon/2)*Math.sin(deltaLon/2);
        var c= Math.atan2(Math.sqrt(a),Math.sqrt(1-a));

        var distance = (this.earth_rad * c) * this.kilometre;
        console.log(distance);
        return(distance);

    }


    revGeoCode(lat,long,callback){

        var options={
            url : `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=${process.env.GEOCODE_KEY}`,
            method : "GET"
        }

        request(options,(error,response,body)=>{
            if(error){
                callback(error,null)
            }else{
                callback(null,body);
            }
        });

    }


    geoCode(placeName,callback){

        console.log(placeName);
        var options={
            url : `https://maps.googleapis.com/maps/api/geocode/json?address=${placeName}&key=${process.env.GEOCODE_KEY}`,
            method : "GET"
        }

        request(options,(error,response,body)=>{
            if(error){
                callback(error,null)
            }else{
                callback(null,body);
            }
        });


    }



}



module.exports = GeoCalc;
