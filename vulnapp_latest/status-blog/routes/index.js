var express = require('express');
var router = express.Router();
var http = require('http');
var session = require('express-session'); // Import express-session

// Add session middleware with HttpOnly and Secure flags
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
  const url = "http://api:8080/users";
  const users = [];

  // Add API key to the request headers
  const options = {
    headers: {
      'API-Key': '980u9wdhc978wh9hbf9w7hb97fhw9e7fb'
    }
  };

  http.get(url, options, (response) => {
      response.on("data", (chunk)=>{
          const responseData = JSON.parse(chunk);

          responseData.users.forEach(function(username) {
            console.log(username);
            users.push(username);
          });

//    let responseData = '';

//    response.on("data", (chunk) => {
//      responseData += chunk;
//    });

//    response.on("end", () => {
      try {
//        const data = JSON.parse(responseData);
//        console.log("Response Data:", data); // Log the response data


        // check logged in
        console.log(`currently logged in user: ${req.session.username}`)
        if (req.session.username) {
        res.status(302).render('index', { users: users, username: req.session.username});
        } else {
        res.status(200).render('index', { users: users, username: req.session.username});
        }
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    });
  }).on("error", (err) => {
    console.error("Error: " + err.message);
    res.status(500).send("Internal Server Error");
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
          }
      })
  });

  apiRequest.write(`username=${username}&password=${password}`);
  apiRequest.end();
});

router.get('/status', async function(req, res, next) {
  // Assuming you have the username stored in session
  const username = req.session.username;
  
  // Assuming you have the password stored in session
  const password = req.session.password;
  
  // Assuming you want to fetch the status from the API
  const url = `http://api:8080/status`;

  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'API-Key': '980u9wdhc978wh9hbf9w7hb97fhw9e7fb'
    }
  };

  // Create the API request
  const apiRequest = http.request(url, options, (response)=> {
      response.on("data", (data)=>{
          console.log(`Status response: ${data.toString()}`);
          if (response.statusCode == 200) {
              // Assuming you want to render a template with the status data
              res.render('status', { status: JSON.parse(data).status });
          } else {
              // Handle other status codes
              // For example, you might want to render an error page
              res.render('error', { error: `Error fetching status: ${response.statusCode}` });
          }
      })
  });

  apiRequest.end();
});



// Function to normalize URL
function normalizeUrl(url) {
  return url.replace(/([^:]\/)\/+/g, "$1");
}

module.exports = router;
