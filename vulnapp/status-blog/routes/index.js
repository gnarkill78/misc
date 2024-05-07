var express = require('express');
var router = express.Router();
var http = require('http');



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
          console.log(`logged in user: ${req.cookies['username']}`)
          if (typeof(req.cookies['username']) !== 'undefined') {

            res.render('index', { users: users, username: req.cookies['username']});
          } else {
            res.render('index', { users: users });
          }

      })
      

  })

  

  
});

module.exports = router;
