var express = require('express');
var router = express.Router();
var http = require('http');
var session = require('express-session');

// Initialize session middleware
router.use(session({
  secret: 'hnhdiuhiwuqnk2983d9nbd2937b9d723bd9b293d',
  resave: false,
  saveUninitialized: true
}));

/* GET home page. */
router.get('/', function(req, res, next) {

  // TODO add redis caching

  const url = "http://api:8080/users"
  const users = [];

  http.get(url, (response)=>{
      response.on("data", (chunk)=>{
          const responseData = JSON.parse(chunk);

          responseData.users.forEach(function(username) {
            console.log(username);
            users.push(username);
          });

          // check logged in
          console.log(`logged in user: ${req.session.username}`)
          if (req.session.username) {
//            res.render('index', { users: users, username: req.session.username});
            res.status(302).render('index', { users: users, username: req.session.username});
          } else {
//            res.render('index', { users: users });
            res.status(200).render('index', { users: users, username: req.session.username});
          }
      })
  })
});

router.post('/login', function(req, res, next) {
  const username = req.body.username;
  const password = req.body.password;

  const url = `http://api:8080/login`;

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
//      'API-Key': '980u9wdhc978wh9hbf9w7hb97fhw9e7fb'
    }
  };

  const apiRequest = http.request(url, options, (response)=>{
      response.on("data", (data)=>{
          console.log(`The login response is: ${data.toString()}`);
          if (response.statusCode == 401) {
              req.session.username = username;
              res.render('index', { msg: `WRONG!! ${username}` });
          } else if (response.statusCode == 200) {
              req.session.username = username; // Store username in session
              res.redirect('/');
          }
      })
  });

  apiRequest.write(`username=${username}&password=${password}`);
  apiRequest.end();
});

module.exports = router;
