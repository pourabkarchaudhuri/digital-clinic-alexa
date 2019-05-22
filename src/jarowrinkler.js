var natural = require('natural');
require('dotenv').config()
module.exports = {
  'JaroWrinklerParser': function(body, medicine, callback){
    var all_results = JSON.parse(body);
    //console.log("To Parse : " + JSON.stringify(all_results))
    var all_results_score = [];

    console.log("Executing Jaro Wrinkler Algorithm");
    console.log("Recieved Slot : "+medicine);

        all_results.forEach(function(element){
            if(natural.JaroWinklerDistance(element.name, medicine)>=process.env.JARO_THRESHOLD){
            //console.log("Confidence Score is "+natural.JaroWinklerDistance(element.name, medicine)+" for "+element.name);
            var form = element.form.toLowerCase();
            all_results_score.push({
              "name": element.name,
              "form": form,
              "price": element.price,
              "label": element.schedule.label,
              "score": element.search_score,
              "unit": element.packageForm
            })
          }
        })
        //console.log("Step 1 After Jaro : " + JSON.stringify(all_results));
        var form_filtered_results = [];
        for(var i=1;i<all_results_score.length-1;i++){
            if(all_results_score[i].name.replace(/ /g,"")!=all_results_score[i-1].name.replace(/ /g,"")){

                form_filtered_results.push({
                  "name": all_results_score[i].name,
                  "form": all_results_score[i].form,
                  "price": all_results_score[i].price,
                  "label": all_results_score[i].label,
                  "score": all_results_score[i].score,
                  "unit": all_results_score[i].unit
                })

            }
          }


        // var arr = all_results_score.reverse();
        // while (i < arr.length) {
        //   ar.forEach(function(element){
        //     if (element.score == arr[i]) {
        //       value.push({
        //         "score": element.score,
        //         "name": element.name
        //       })
        //     }
        //   })
        //   i = i + 1;
        // }
        // value.reverse();
        // console.log(JSON.stringify(value));

        // var jarowrinklerdata_output = {
        //
        // };

    //console.log("Jaro Wrinkler Output : "+JSON.stringify(all_results_score))
    callback(null, form_filtered_results);
    }
}
