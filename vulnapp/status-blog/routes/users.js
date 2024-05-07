var express = require('express');
var http = require('http');
var router = express.Router();

router.get('/', function(req, res, next) {
  // res.send('respond with a resource');
  const requestString = req.query.request;
  const url = `http://api:8080/${requestString}`
  // var status;

  http.get(url, (response)=>{
      response.on("data", (chunk)=>{
          const responseData = JSON.parse(chunk);
          var status = responseData.status;
          console.log(status);
          res.send(`${status}`);
      })
  })

  // res.write(`${status}`);
  // console.log(status);
  // res.send(`${status}`);

});

router.post('/login', function(req, res, next) {
  // res.send('respond with a resource');

  const username = req.body.username;
  const password = req.body.password;

  const url = `http://api:8080/login`;


  const apiRequest = http.request(url, {method:'POST', headers: {"Content-Type": 'application/x-www-form-urlencoded; charset=UTF-8'}} , (response)=>{
      response.on("data", (data)=>{
        console.log(`login response: ${data.toString()}`);
        if (response.statusCode == 401) {
          res.render('index', { msg: "Wrong credentials." });
        } else if (response.statusCode == 200) {
          res.cookie('username', data.toString(), { maxAge: 30000000 });
          res.redirect('/');
        }
       
      //     const responseData = JSON.parse(chunk);
      //     var status = responseData.status;
      //     console.log(status);
      //     res.send(`${status}`);
      })
  })
  apiRequest.write(`username=${username}&password=${password}`);
  apiRequest.end();
});


module.exports = router;
