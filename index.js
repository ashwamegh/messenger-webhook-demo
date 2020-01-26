'use strict';
const request = require('request');


// Imports dependencies and set up http server
const
  express = require('express'),
  bodyParser = require('body-parser'),
  app = express().use(bodyParser.json()); // creates express http server
  const PAGE_ACCESS_TOKENS = {
    '813586928715411': 'EAAnV1gCU7UkBAPD91MmM072nXSOH2wanZAyjXVYcUp0OTbsP4JowMYWSKOAKRkZA14MEdXc5H2dzHLq19BCMFqJ4bkWG88fDhpfteZBeZCFyuZAyqCJx1SfjZAU9oxZBfjg7cSZC3avR9rX4lhh6e317cQXzv0xfNoK5wFtqC1CtXxpjWsbnXC5TBZCxrL3suYDsZD',
    '112980233584055': 'EAAnV1gCU7UkBACtOQ2bsZCEzqUcl2pcoScGwbySRUWRGYXglDnqfSzhY0GBj5I6WZBGTetO9BvPxJybd6EQecfcVD2OOaEXnLib55IkBR4k2pzUQQQbn8wW8eDgRvl6advNBfYatAn7l4zckU4BGIrxJt0NH4ljpveJT5rA2AlO6l4aUttf0GxssRkO9EZD'
  }

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

// Creates the endpoint for our webhook 
app.post('/webhook', (req, res) => {  
 
  let body = req.body;

  // Checks this is an event from a page subscription
  if (body.object === 'page') {

    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {

      // Gets the message. entry.messaging is an array, but 
      // will only ever contain one message, so we get index 0
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);
    });

    // Returns a '200 OK' response to all requests
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

});


// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {

  // Your verify token. Should be a random string.
  let VERIFY_TOKEN = "random_string"
    
  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
    
  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
  
    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      
      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);      
    }
  }
});

app.post('/message', (req, response) => {  
 
  let body = req.body;
  const { senderId, message, recipientId } = body
  const access_token = PAGE_ACCESS_TOKENS[senderId];

   // Construct the message body
   let request_body = {
    "recipient": {
      "id": recipientId
    },
    "message": {
      "text": message
    }
  }

  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": access_token },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!')
      response.send(200);
    } else {
      console.error("Unable to send message:" + err);
      response.send(403);
    }
  }); 

});
