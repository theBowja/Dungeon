var express = require('express');
var app = express();
var http = require('http');

const PORT = 3900; 

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
  console.log("Got response: " + res.statusCode);
  
  //res.send('Hello World!');
});

//middleware
app.use(express.static(__dirname));

var server = app.listen(PORT, function () {
  var host = server.address().address;
  var port = server.address().port;

    console.log("Server listening on http://localhost:%s", PORT);
});

//app.use(express.static(__dirname + '/public'));

