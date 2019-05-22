// 'use strict';
var Alexa = require('alexa-sdk');
var sessionHandlers=require('./src/alexa');
var handlers = sessionHandlers;
//dependencies.
//const appId = 'amzn1.ask.skill.f391aedf-ae22-4abd-8bb0-2cc66a9b4900'; //'amzn1.echo-sdk-ams.app.your-skill-id';
//=======================================HANDLER FUNCTION FOR AWS LAMBDA FOR CHANNEL DETECTION=====================================
//handler function for AWS Lambda

exports.handler = function(event, context, callback){

  console.log("Event : "+JSON.stringify(event));
  console.log("Context : "+JSON.stringify(context));

  console.log("Request From Alexa Skills Kit");

  //Trigger Alexa Function
  var alexa = Alexa.handler(event, context);
  //alexa.appId = appId;
  alexa.registerHandlers(handlers); //handlers contain alexa-sdk function based intent logic
  alexa.execute();

}
