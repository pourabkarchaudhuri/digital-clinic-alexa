var twitterscraper = require('./twitterscraper');
var reversegeocoder = require('./reversegeocode');
var nutritionparser = require('./nutritionparser');
var medicinelookup = require('./medicine');
var first_aid_knowledge = require('../firstaid.json')
var exerciseparser = require('./exercise');
var medicalcondition = require('./medicalcondition');

var deasync = require('deasync');
var AlexaDeviceAddressClient = require('./address');

var GeoCalc= require('./distance');

var tweetScraper = require("./matrix")


const ALL_ADDRESS_PERMISSION = "read::alexa:device:all:address";

const PERMISSIONS = [ALL_ADDRESS_PERMISSION];

module.exports={

    'LaunchRequest': function() {
      console.log("Launch Request Intent");
          tempContext=this;
          this.attributes['speechOutput']="Hello, I am your clinical assistant. You may start by saying, Flu or fever symptoms nearby, epidemic alerts, check nutrition content, lookup a medicine or drug info, or get calories burnt today. Now how can I help you?";
          this.attributes['repromptSpeech']="Are you there? For more information on how to use this skill, just say help.";
          var cardtitle = "Welcome to this Skill";
          var cardcontent = "Say the following to get started :\n'Flu or fever symptoms nearby'\n'Epidemic alerts'\n'Check nutrition content'\n'Lookup a medicine or drug info'\n'Get calories burnt today'";
          this.emit(':askWithCard', this.attributes['speechOutput'],this.attributes['repromptSpeech'], cardtitle, cardcontent);

      },
      'ConditionInquiryIntent': function(){
          console.log("Condition Inquiry Intent");
          if (this.event.request.dialogState == "STARTED" || this.event.request.dialogState == "IN_PROGRESS"){
            this.context.succeed({
                "response": {
                    "directives": [
                        {
                            "type": "Dialog.Delegate"
                        }
                    ],
                    "shouldEndSession": false
                },
                "sessionAttributes": {}
            });
          }
          else{
              var querystring = this.event.request.intent.slots.inputCondition.value;
              if(querystring==undefined||querystring==null){
                this.attributes['speechOutput']="There seems to be some confusion. Can you rephrase that for me? For example, say something like, what to do in case of yellow fever.";
                this.attributes['repromptSpeech']="Are you there? For more information on how to use this skill, just say help.";
                this.emit(':ask', this.attributes['speechOutput'],this.attributes['repromptSpeech']);
              }
              else{
              var condition = deasync(function(callback){
                             medicalcondition.getConditionDetails(querystring, callback);
                           })();
              console.log("Conditions : " + JSON.stringify(condition));
              var conditionSeverity, conditionAcuteness, conditionAdvice, conditionPrevalence, conditionName, flag;
               condition.forEach(function(element){

                 if(querystring.toLowerCase()==(element.name.replace(/-/g," ")).toLowerCase()){
                   console.log("Matched : " + element.name.charAt(0).toUpperCase() + element.name.slice(1));
                   conditionSeverity = element.severity.charAt(0).toUpperCase() + element.severity.slice(1);
                   conditionName = element.name.charAt(0).toUpperCase() + element.name.slice(1);
                   conditionAcuteness = (element.acuteness.charAt(0).toUpperCase() + element.acuteness.slice(1)).replace(/_/g,' ');
                   conditionAdvice = element.extras.hint;
                   conditionPrevalence = (element.prevalence.charAt(0).toUpperCase() + element.prevalence.slice(1)).replace(/_/g,' ');
                   flag=1;
                  // console.log(conditionSeverity, conditionName, conditionAdvice, conditionAcuteness, conditionPrevalence, flag);
                 }
               })
               //response
              // console.log(conditionSeverity, conditionName, conditionAdvice, conditionAcuteness, conditionPrevalence);
               if(flag==1){
                 this.attributes['speechOutput']="This is a "+conditionSeverity+" condition. "+conditionAdvice+". I\'ve also sent some more detailed information to your companion app.";
                 var cardtitle = "Medical Condition Details";
                 var cardcontent = `Condition Name : ${conditionName}\nPrevalence : ${conditionPrevalence}\nSeverity : ${conditionSeverity}\nAcuteness : ${conditionAcuteness}\n Advice : ${conditionAdvice}`;
                 this.emit(':tellWithCard', this.attributes['speechOutput'], cardtitle, cardcontent);
               }
               else{
                 this.attributes['speechOutput']="I don\'t know about this condition. Is it new? I have to look it up later.";
                 this.attributes['repromptSpeech']="Are you there? For more information on how to use this skill, just say help.";
                 this.emit(':ask', this.attributes['speechOutput'],this.attributes['repromptSpeech']);
               }
             }
          }
      },

      'ExerciseIntent': function(){
        console.log("Exercise Intent");
        if (this.event.request.dialogState == "STARTED" || this.event.request.dialogState == "IN_PROGRESS"){
          this.context.succeed({
              "response": {
                  "directives": [
                      {
                          "type": "Dialog.Delegate"
                      }
                  ],
                  "shouldEndSession": false
              },
              "sessionAttributes": {}
          });
        }
        else{
          var querystring = this.event.request.intent.slots.exercise.value;
          let exerciseContent = deasync(function(callback){
                         exerciseparser.getCaloriesBurnt(querystring, callback);
                       })();
           var speechlet = "";
           var cardcontent = "";
           var calories_total = 0;
           if (exerciseContent.exercises[exerciseContent.exercises.length] == 0) {
             console.log("Empty Response from Exercise API");
             this.attributes['speechOutput']="I did not get any results for this activity. Can you please rephrase that for me? Say something like, I jogged for 2 hours.";
             this.attributes['repromptSpeech']="Are you there? For more information on how to use this skill, just say help.";
             this.emit(':ask', this.attributes['speechOutput'],this.attributes['repromptSpeech']);
           }
           else{

           if(exerciseContent.exercises.length==1){
             if(exerciseContent.exercises[0].name == "not impressed" || exerciseContent.exercises[0].name == null){
               var finalspeech = "I am not impressed. You managed " + exerciseContent.exercises[0].user_input + " for approximately " + exerciseContent.exercises[0].duration_min + " minutes and burnt " + exerciseContent.exercises[0].nf_calories + " calories. You need to work out more!";
             }
             else{
               var finalspeech = "You have " + exerciseContent.exercises[0].user_input + " for approximately " + exerciseContent.exercises[0].duration_min + " minutes and burnt " + exerciseContent.exercises[0].nf_calories + " calories.";
             }
             this.attributes['speechOutput']=finalspeech;
             this.emit(':tell', this.attributes['speechOutput']);
           }
           else if(exerciseContent.exercises.length>1){
             for(var i=0; i<exerciseContent.exercises.length;i++){

               if(exerciseContent.exercises[i].name == "not impressed" || exerciseContent.exercises[i].name == null){
                 cardcontent = cardcontent + (i+1) + ". " + exerciseContent.exercises[i].user_input + " : " +  exerciseContent.exercises[i].nf_calories + "\n";
                 speechlet = speechlet + "For exercise " + (i+1) + " you have " + exerciseContent.exercises[i].user_input + " for approximately " + exerciseContent.exercises[i].duration_min + " minutes and burnt " + exerciseContent.exercises[i].nf_calories + " calories. I am not impressed. ";
               }
               else{
                 cardcontent = cardcontent + (i+1) + ". " + exerciseContent.exercises[i].user_input + " : " +  exerciseContent.exercises[i].nf_calories + "\n";
                 speechlet = speechlet + "For exercise " + (i+1) + " you have " + exerciseContent.exercises[i].user_input + " for approximately " + exerciseContent.exercises[i].duration_min + " minutes and burnt " + exerciseContent.exercises[i].nf_calories + " calories. ";
               }
               calories_total += exerciseContent.exercises[i].nf_calories;
             }
             var finalspeech = speechlet + "That would be a total of " + calories_total + " calories burnt. Great Job!";
             var cardtitle = "Calories Burnt";
             var cardcontentfinal = cardcontent + "Total : "+calories_total+ " cals";
             this.attributes['speechOutput']=finalspeech;
             this.emit(':tell', this.attributes['speechOutput'], cardtitle, cardcontentfinal);
           }
           else{
             var finalspeech = "There seems to be some confusion. Try rephrasing that and say someting like, I jogged for 2 hours today."
             this.attributes['speechOutput']=finalspeech;
             this.attributes['repromptSpeech']="Are you there? For more information on how to use this skill, just say help.";
             this.emit(':ask', this.attributes['speechOutput'],this.attributes['repromptSpeech']);
           }
         }
        }

      },

      'EmergencyAdviseIntent': function(){
        console.log("Emergency Advise Intent");
          var action = this.event.request.intent.slots.emergencyaction.value;
          if(action==undefined||action==null){
            console.log("No slot value captured!");
            this.attributes['speechOutput']="There seems to be some confusion. Can you please repeat by saying, what is the course of action for, and then the situation?";
            this.attributes['repromptSpeech']="Are you there? For example, you can say, what is the best course of action for bee stings.";
            this.emit(':ask', this.attributes['speechOutput'],this.attributes['repromptSpeech']);
          }
          else{
            console.log("Slot value captured : " + action);
            action = action.toLowerCase();
            action = action.replace(/ /g,"_");
            var speechlet = null;
            first_aid_knowledge.firstaid.forEach(function(element){
              if(action==element.problem){
                speechlet = element.Solution;
              }
            })

            if(!speechlet){
              speechlet = "I don\'t know how to deal with this yet. I am still learning. Right now, I can help with cuts, sprains, CPR, things like that. I have sent some more details to your companion app."
            }
            var cardtitle = "First Aid FAQs";
            var cardcontent = "Case : "+action+"\n"+speechlet;
            this.attributes['speechOutput']=speechlet;
            this.emit(':tell', this.attributes['speechOutput'], cardtitle, cardcontent);
          }

      },

      'NutritionIntent': function(){
        console.log("Trigger Nutrition Intent ");
        if (this.event.request.dialogState == "STARTED" || this.event.request.dialogState == "IN_PROGRESS"){
          this.context.succeed({
              "response": {
                  "directives": [
                      {
                          "type": "Dialog.Delegate"
                      }
                  ],
                  "shouldEndSession": false
              },
              "sessionAttributes": {}
          });
        }
        else{

          var food = this.event.request.intent.slots.search.value;
          console.log("Search Query : " + food);


          //Optional

          var type = this.event.request.intent.slots.foodtype.value;
          console.log("Type : " + type);
          var querystring = "For " + type + "I had " + food;
          let nutrientContent = deasync(function(callback){
                         nutritionparser.getNutrients(querystring, callback);
                       })();
          if(nutrientContent.message == "We couldn't match any of your foods"){
            this.attributes['speechOutput']= nutrientContent.message + "Can you please start again by saying, check nutrition content?"
            this.attributes['repromptSpeech']="Are you there?";
            this.emit(':ask', this.attributes['speechOutput'],this.attributes['repromptSpeech']);
          }
          else{
           var calories = 0, fat = 0, carbs = 0, protein = 0;
           nutrientContent.foods.forEach((element)=>{
             calories += element.nf_calories;
             fat += element.nf_total_fat;
             carbs += element.nf_total_carbohydrate;
             protein += element.nf_protein;

           })
           if(type=="breakfast"){
             if(Math.floor(calories)<700){
               var stringappend = " You should try to have some more food. It is recommended to consume at least 700 calories for a hearty breakfast.";
             }
             else{
               var stringappend = " Wow! That's a heavy breakfast!";
             }
           }
           else if(type=="lunch"){
             if(Math.floor(calories)<900){
               var stringappend = " You may extend your lunch diet a little more."
             }
             else{
               var stringappend = " Don\'t overdo your lunch."
             }
           }
           else if(type=="dinner"){
             if(Math.floor(calories)<850){
               var stringappend = " I suggest you have a little more for dinner."
             }
             else{
               var stringappend = " Try having a lighter dinner for a good sleep."
             }
           }
           else{
             this.attributes['speechOutput']="There seems to be some confusion. I did not catch that last part. Can you please start again by saying, check nutrition content?"
             this.attributes['repromptSpeech']="Are you there?";
             this.emit(':ask', this.attributes['speechOutput'],this.attributes['repromptSpeech']);
           }
           var cardtitle = "Calories Consumed";
           var cardcontent = "Condition Name : "+Math.floor(calories)+" cals\nFat : "+Math.floor(fat)+"gms\nCarbs : "+Math.floor(carbs)+"gms\nProtein : "+Math.floor(protein)+"gms";
          this.attributes['speechOutput']="For this, I find that you would have intake of " + Math.floor(calories) + " calories, consisting of " + Math.floor(fat) + "grams of fat, " + Math.floor(carbs) + "grams of carbs, and " + Math.floor(protein) + "grams of proteins." + stringappend + " I have sent some more details to your companion app.";
          this.emit(':tellWithCard', this.attributes['speechOutput'], cardtitle, cardcontent);
        }
       }
      },

      'FluFinderIntent': function(){
        console.log("Trigger Flu Finder Intent Intent");

        var fullspeech = "";
        var speechHandlerSubtext = "Here are the top 5 results from today's twitter feed. Apparantly, ";
        let fluNowResponse = deasync(function(callback){
                       twitterscraper.scrapeTwitter(callback);
                     })();
        //console.log("Response Outcome : " + fluNowResponse);
        JSON.parse(fluNowResponse).forEach((element)=>{

            //console.log("______________");
            //console.log(JSON.stringify(element));
            var lat = element.latitude;
            var long = element.longitude;

            let geoAddress = deasync(function(callback){
                           reversegeocoder.reverseGeocode(lat, long, callback);
                         })();

            fullspeech += element.user_name + " from " + JSON.parse(geoAddress).results[JSON.parse(geoAddress).results.length-2].formatted_address + " has posted, " + element.tweet_text + ". ";

          });

          var finalspeech = speechHandlerSubtext + fullspeech + "That\'s all from today\'s twitter feed!";
          //console.log(finalspeech);


        this.attributes['speechOutput']=finalspeech;
        this.emit(':tell', this.attributes['speechOutput']);
      },

      'MedicineLookupIntent': function(){
        console.log("Medicine Lookup Intent Intent");
        if (this.event.request.dialogState == "STARTED" || this.event.request.dialogState == "IN_PROGRESS"){
          this.context.succeed({
              "response": {
                  "directives": [
                      {
                          "type": "Dialog.Delegate"
                      }
                  ],
                  "shouldEndSession": false
              },
              "sessionAttributes": {}
          });
        }
        else{
          console.log("Slots Fulfilled")
          var medName = this.event.request.intent.slots.medicine.value;
          console.log("Medicine : " + medName);

          var speechlet = "";
          var cardlet = "";
          let lookupResponse = deasync(function(callback){
                         medicinelookup.getMedicine(medName, callback);
                       })();
                       console.log("No. of Results : " + lookupResponse.length);
                       //console.log("First Response Parsed : " + JSON.stringify(lookupResponse));
          if(lookupResponse.length==1){
            //Mention Only One. Session End
            this.attributes['speechOutput']="I found one match. " + "It is a " + lookupResponse[0].form + "named " + lookupResponse[0].name + ". The price per " + lookupResponse[0].unit + " is " + lookupResponse[0].price + ". " + lookupResponse[0].label + ".";
            var cardtitle = "Medicine Details";
            var cardcontent = "Name : "+lookupResponse[0].name+"\nForm : "+lookupResponse[0].form+"\nPrice : "+lookupResponse[0].price+"/"+lookupResponse[0].unit+"\nStatus : "+lookupResponse[0].label;
            this.emit(':tellWithCard', this.attributes['speechOutput'], cardtitle, cardcontent);
          }
          else if(lookupResponse.length<=3){
            //Mention Options
            for(var i=0; i<lookupResponse.length; i++){
              cardlet = cardlet + (i+1)+". "+lookupResponse[0].name+" - Form: "+lookupResponse[0].form+" - Price: "+lookupResponse[0].price+"/"+lookupResponse[0].unit+" - Status: "+lookupResponse[0].label;
              speechlet = speechlet + "Option " + (i+1) + " is a " + lookupResponse[i].form + "named " + lookupResponse[i].name + ". The price per " + lookupResponse[i].unit + " is " + lookupResponse[i].price + ". " + lookupResponse[i].label + ". "
            }
            global.lookupResponse = lookupResponse;
            var cardtitle = "Medicine Details";
            var cardcontent = cardlet;
            //console.log("First Response Parsed : " + JSON.stringify(global.lookupResponse));
            this.attributes['speechOutput']="I found " + lookupResponse.length + " matches. " + speechlet + " I have sent some more details to your companion app.";
            this.emit(':tell', this.attributes['speechOutput'], cardtitle, cardcontent);

          }
          else if(lookupResponse.length>3){
            //Ask user whether tablet or concetration
            var form_arr = [];

            for(var i=0; i<lookupResponse.length;i++){
              form_arr.push(lookupResponse[i].form.toLowerCase());
              var uniqueArray = Array.from(new Set(form_arr));
            }
            for(var j=0;j<uniqueArray.length;j++){
              if(j==uniqueArray.length-1){
                  speechlet = speechlet + "or " + uniqueArray[j] + ". "
              }
              else{
                  speechlet = speechlet + uniqueArray[j] + ", "
              }
            }
            global.lookupResponse = lookupResponse;
              //console.log("First Response Parsed : " + JSON.stringify(global.lookupResponse));
            this.attributes['speechOutput']="There are " + lookupResponse.length + " results for this name. Can you please mention which one it is out of the following. A " + speechlet + ". So which one is it?";
            this.attributes['repromptSpeech']="Is there anything else I can help you with?";
            this.emit(':ask', this.attributes['speechOutput'],this.attributes['repromptSpeech']);

          }
          else{
            //Say No Match
            this.attributes['speechOutput']="I did not find any results. Can you please try again by saying, look for a medicine.";
            this.attributes['repromptSpeech']="Are you there?";
            this.emit(':ask', this.attributes['speechOutput'],this.attributes['repromptSpeech']);
          }

        }
      },

      'MedicineTypeFollowUpIntent': function(){
        console.log("Medicine Type Follow Up Intent");
        var type = this.event.request.intent.slots.type.value;
        var lookupResponse = global.lookupResponse;
        //console.log("Follow-Up Parsed Response : " + JSON.stringify(form_filtered_results));

        var speechlet = "";
        var cardlet = "";
      //var form_filtered_results = [];

        var form_filtered_results = [];
        for(var i=1;i<lookupResponse.length-1;i++){
            if(lookupResponse[i].name.replace(/ /g,"")!=lookupResponse[i-1].name.replace(/ /g,"")){
              if(type.toLowerCase()==lookupResponse[i].form){
                form_filtered_results.push({
                  "name": lookupResponse[i].name,
                  "form": lookupResponse[i].form,
                  "price": lookupResponse[i].price,
                  "label": lookupResponse[i].label,
                  "score": lookupResponse[i].score,
                  "unit": lookupResponse[i].unit
                })
              }
            }
          }

        //console.log("Final Results : " + JSON.stringify(form_filtered_results));

        if(form_filtered_results.length==1){
          cardlet = "Name : "+form_filtered_results[0].name+"\nForm : "+form_filtered_results[0].form+"\nPrice : "+form_filtered_results[0].price+"/"+form_filtered_results[0].unit+"\nStatus : "+form_filtered_results[0].label;
          speechlet = "I found one match. " + "It is a " + form_filtered_results[0].form + " named " + form_filtered_results[0].name + ". The price per " + form_filtered_results[0].unit + " is " + form_filtered_results[0].price + ". " + form_filtered_results[0].label + ".";
          var finalspeech = speechlet;
        }
        else if(form_filtered_results.length==0){
          this.attributes['speechOutput']="I did not find any results. Can you please try again by saying, look for a medicine.";
          this.attributes['repromptSpeech']="Are you there?";
          this.emit(':ask', this.attributes['speechOutput'],this.attributes['repromptSpeech']);
        }
        else if(form_filtered_results.length<3){
          for(var i=0;i<form_filtered_results.length;i++){
              cardlet = cardlet + (i+1)+". "+form_filtered_results[0].name+" - Form: "+form_filtered_results[0].form+" - Price: "+form_filtered_results[0].price+"/"+form_filtered_results[0].unit+" - Status: "+form_filtered_results[0].label;
            speechlet = speechlet + "Option " + (i+1) + " is a " + form_filtered_results[i].form + " named " + form_filtered_results[i].name + ". The price per " + form_filtered_results[i].unit + " is " + form_filtered_results[i].price + ". " + form_filtered_results[i].label + ". "
          }
          var finalspeech = "Here are the details of the top "+ form_filtered_results.length +" matches. " + speechlet + ". That is all. I have also sent some more details to your companion app.";
        }
        else{
          for(var i=0;i<3;i++){
              cardlet = cardlet + (i+1)+". "+form_filtered_results[0].name+" - Form: "+form_filtered_results[0].form+" - Price: "+form_filtered_results[0].price+"/"+form_filtered_results[0].unit+" - Status: "+form_filtered_results[0].label;
            speechlet = speechlet + "Option " + (i+1) + " is a " + form_filtered_results[i].form + " named " + form_filtered_results[i].name + ". The price per " + form_filtered_results[i].unit + " is " + form_filtered_results[i].price + ". " + form_filtered_results[i].label + ". "
          }
          var finalspeech = "Here are the details of the top 3 matches. " + speechlet;
        }

        if(lookupResponse){
          var cardtitle = "Medicine Details";
          var cardcontent = cardlet;
          this.attributes['speechOutput']=finalspeech + " I have also sent some more details to your companion app.";
          this.emit(':tell', this.attributes['speechOutput'], cardtitle, cardcontent);
        }
        else{
          this.attributes['speechOutput']="Start by saying, look for a medicine.";
          this.attributes['repromptSpeech']="Are you there?";
          this.emit(':ask', this.attributes['speechOutput'],this.attributes['repromptSpeech']);
        }

      },

      'EpidemicFinderIntent': function(){
        console.info("Starting getAddressHandler()");


            if(this.event.context.System.user.hasOwnProperty('permissions')){
              var consentToken = this.event.context.System.user.permissions.consentToken;
            }

            //var consentToken = this.event.context.System.user.permissions.consentToken;

            // If we have not been provided with a consent token, this means that the user has not
            // authorized your skill to access this information. In this case, you should prompt them
            // that you don't have permissions to retrieve their address.
            if(!consentToken) {
                this.emit(":tellWithPermissionCard", "Please enable Location permissions in the Amazon Alexa app.", PERMISSIONS);

                // Lets terminate early since we can't do anything else.
                console.log("User did not give us permissions to access their address.");
                console.info("Ending getAddressHandler()");
                //return;
            }

            var deviceId = this.event.context.System.device.deviceId;
            var apiEndpoint = this.event.context.System.apiEndpoint;

            var alexaDeviceAddressClient = new AlexaDeviceAddressClient(apiEndpoint, deviceId, consentToken);
            let deviceAddressRequest = alexaDeviceAddressClient.getFullAddress();

            deviceAddressRequest.then((addressResponse) => {
                switch(addressResponse.statusCode) {
                    case 200:
                        console.log("Address successfully retrieved, now responding to user.");
                        const address = addressResponse.address;
                        const addressParam = addressResponse.address['addressLine1'] + ", " + addressResponse.address['stateOrRegion'] + ", " + addressResponse.address['postalCode'];
                        const ADDRESS_MESSAGE = "Here is your full address: " +
                            `${address['addressLine1']}, ${address['stateOrRegion']}, ${address['postalCode']}`;
                            var ob =new GeoCalc()
                            var scraper = new tweetScraper();

                            // scraper.flutracer()
                            // .catch((error)=>{
                            //     console.log(error);
                            // })
                            // .then((coorList)=>{
                            //   if(coorList.length!=null){
                            //
                            //   }
                            //
                            //     ob.geoCode(addressParam)
                            //     .catch((err)=>{
                            //         console.log(err);
                            //     })
                            //     .then((data)=>{
                            //
                            //         var parsedData= JSON.parse(data);
                            //       //  console.log("Full Data Returned : " + JSON.stringify(parsedData));
                            //       if(parsedData){
                            //         //Execute
                            //         //console.log("coordinates are : ", parsedData.results[0].geometry.location)
                            //         var coordinates= parsedData.results[0].geometry.location;
                            //
                            //         ob.calcNearest(coordinates,coorList,(dist,loc,add)=>{
                            //           console.log(dist,loc,add);
                            //           if(dist>100){
                            //             var speechlet = "Don\'t worry! It is far from you. But still, stay healthy please.";
                            //           }
                            //           else if(dist<100){
                            //             var speechlet = "It is not far from you. I recommend a healthy and a hygienic lifestyle. Avoid dirty areas and wash your hands before meals. I don\'t want you to get sick."
                            //           }
                            //           var cardtitle = "Nearest Flu Occurence";
                            //           var cardcontent = "Distance : "+Math.floor(dist)+"kms\nLocation : "+add;
                            //           this.emit(':tellWithCard', "The nearest occurence of the flu is " + Math.floor(dist) + "kilometres away, at " + add + ". " + speechlet);
                            //         })
                            //       }
                            //       else{
                            //         this.emit(':tell', 'I can\'t seem to connect to the internet to get the latest alerts on epidemics. Please try again after a while.');
                            //       }
                            //
                            //
                            //     })
                            //
                            //
                            // })

                  scraper.flutracer((errormsg,coorList)=>{
                      if(errormsg!=null){

                        this.emit(':tell', 'There are no latest alerts on epidemics as of now. Please try again after a while.');

                      }else if(coorList.length!=0){

                          ob.geoCode(addressParam,(err,data)=>{
                              if(err){
                                  console.log(err);
                              }else{

                                  var parsedData= JSON.parse(data);
                                  console.log("coordinates of address given is ", parsedData.results[0].geometry.location);
                                  var coordinates= parsedData.results[0].geometry.location;

                                  ob.calcNearest(coordinates,coorList,(dist,loc,add)=>{
                                  console.log(dist,loc,add);
                                  if(dist>100){
                                    var speechlet = "Don\'t worry! It is far from you. But still, stay healthy please.";
                                    }
                                    else if(dist<100){
                                      var speechlet = "It is not far from you. I recommend a healthy and a hygienic lifestyle. Avoid dirty areas and wash your hands before meals. I don\'t want you to get sick."
                                    }
                                    var cardtitle = "Nearest Flu Occurence";
                                    var cardcontent = "Distance : "+Math.floor(dist)+"kms\nLocation : "+add;
                                    this.emit(':tellWithCard', "The nearest occurence of the flu is " + Math.floor(dist) + "kilometres away, at " + add + ". " + speechlet);
                                  })

                              }
                          })
                      }else{
                          this.emit(':tell', 'There are no latest alerts on epidemics as of now. Please try again after a while.');
                      }
                  })





                        break;
                    case 204:
                        // This likely means that the user didn't have their address set via the companion app.
                        console.log("Successfully requested from the device address API, but no address was returned.");
                        this.emit(":tell", "It looks like you don't have an address set. You can set your address from the companion app.");
                        break;
                    case 403:
                        console.log("The consent token we had wasn't authorized to access the user's address.");
                        this.emit(":tellWithPermissionCard", "Please enable Location permissions in the Amazon Alexa app.", PERMISSIONS);
                        break;
                    default:
                        this.emit(":tell", "There was an error with the Device Address API. Please try again later.");
                }

                console.info("Ending getAddressHandler()");
            });

            deviceAddressRequest.catch((error) => {
                this.emit(":tell", "Uh Oh. Looks like something went wrong.");
                console.error(error);
                console.info("Ending getAddressHandler()");
            });
      },

      'SatisfactoryIntent': function(){
        console.log("Satisfactory Intent Triggered");
        this.attributes['speechOutput']="Thank you for using the Clinical Assistant skill. Hope I was helpful. Have a nice day!";
        this.emit(':tell', this.attributes['speechOutput']);

      },

      'AMAZON.HelpIntent': function () {
          console.log("HELP INTENT TRIGGERED");
          var cardtitle = "Welcome to this Skill";
          var cardcontent = "Say the following to get started :\n'Flu or fever symptoms nearby'\n'Epidemic alerts'\n'Check nutrition content'\n'Lookup a medicine or drug info'\n'Get calories burnt today'";
          this.emit(':askWithCard', ' You can begin a coversation by saying, Flu or fever symptoms nearby, epidemic alerts, check nutrition content, lookup a medicine or drug info, or get calories burnt today. Now how can I help you?', 'Are you there?', cardtitle, cardcontent);
      },//HelpIntent

      "AMAZON.StopIntent": function() {
          console.log("STOP INTENT TRIGGERED");
          this.emit(':tell', "Thank you for using the Clinical Assistant Skill. Hope I was helpful. Have a nice day.");
      },//StopIntent

      "AMAZON.CancelIntent": function() {
          console.log("CANCEL INTENT TRIGGERED");
          this.emit(':tell', "Thank you for using the Clinical Assistant Skill. Hope I was helpful. Have a nice day.");
      },//CancelIntent

      'SatisfactoryIntent': function(){
        console.log("Satisfactory Intent");
        this.attributes['speechOutput']="Thank you for using the Clinical Assistant Skill. Hope I was helpful. Have a nice day.";
        this.emit(':tell', this.attributes['speechOutput']);
      },

      'SessionEndedRequest': function () {
         console.log('Session ended!');
         this.attributes['speechOutput']="Thank you for using Clinical Assistant Skill. Hope I was helpful. Have a nice day.";
         this.emit(':tell', this.attributes['speechOutput']);
     },

      'Unhandled': function() {
         console.log("Unhandled Intent");
         this.attributes['speechOutput']="I did not understand that. Please try again.";
         this.attributes['repromptSpeech']="If you are done with your questions, just say, thank you to end the skill.";
         this.emit(':ask', this.attributes['speechOutput'],this.attributes['repromptSpeech']);
     }
}
