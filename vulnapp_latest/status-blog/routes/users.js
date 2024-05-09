var express = require('express');
var http = require('http');
var router = express.Router();
var session = require('express-session');

// Add session middleware
router.use(session({
  secret: 'hnhdiuhiwuqnk2983d9nbd2937b9d723bd9b293d',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 3600000, // Example: set the session to expire after 1 hour
  }
}));

router.get('/', function(req, res, next) {
  const requestString = req.query.request;
  const url = `http://api:8080/${requestString}`;

  const options = {
    headers: {
      'API-Key': '980u9wdhc978wh9hbf9w7hb97fhw9e7fb'
    }
  };

  http.get(url, options, (response)=>{
      response.on("data", (chunk)=>{
          const responseData = JSON.parse(chunk);
          var status = responseData.status;
          console.log(status);
          res.send(`${status}`);
      })
  });
});

router.post('/login', function(req, res, next) {
  const username = req.body.username;
  const password = req.body.password;
  const url = `http://api:8080/login`;

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'API-Key': '980u9wdhc978wh9hbf9w7hb97fhw9e7fb'
    }
  };

  const apiRequest = http.request(url, options, (response)=>{
      response.on("data", (data)=>{
          console.log(`login response: ${data.toString()}`);
          if (response.statusCode == 401) {
              req.session.username = username;
              res.render('index', { msg: `You have entered the wrong credentials. ${username}` });
          } else if (response.statusCode == 200) {
              req.session.username = username; // Store username in session
              res.redirect('/');
          } else if (response.statusCode == 302) {
              req.session.username = username; // Store username in session
              res.redirect('/');
          }
      })
  });

  apiRequest.write(`username=${username}&password=${password}`);
  apiRequest.end();
});

router.post('/status', function(req, res, next) {
//  const { username, status, postContent } = req.session; // Assuming your form sends username, status, and post content
  const username = req.session.username;
  const password = req.session.password; // Assuming you have the password stored in session
  const status = req.body.status;
  console.log(`The user that is posting is: ${username}`);
  // Construct the URL for the backend API endpoint to add a new post
  const url = `http://api:8080/status`;
  console.log("Username is: ", username);
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'API-Key': '980u9wdhc978wh9hbf9w7hb97fhw9e7fb'
    }
  };

  // Make a POST request to the backend API endpoint
  const apiRequest = http.request(url, options, (response) => {
    response.on("data", (data) => {
      console.log(`Response from adding post: ${data.toString()}`);
      // Optionally, you can handle the response here
      // For example, redirect to a different page or send a response to the client
//      if (response.statusCode == 302) {
//          req.session.username = username;
      res.redirect('/');
//      } else if (response.statusCode == 200) {
//          req.session.username = username;
//          res.redirect('/');
//      } 
    });
  });

  // Send the post data as data in the request body
  apiRequest.write(`username=${username}&status=${status}`);
  apiRequest.end();
});

module.exports = router;
