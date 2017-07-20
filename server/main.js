const express = require('express')
const app = express()
var server 	= require('http').Server(app);
var io 		= require('socket.io')(server);

var scanner = require("./scanner.js");

//app.use(express.static(__dirname + '/images'));
app.use(express.static(__dirname + '/resources'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
})

app.listen(3000, function () {
  console.log('listening on port 3000!')
})

server.listen(4400);

io.on('connection', function (socket) {
  console.log("Server Socket connected"); 
  socket.emit('connected', 123);
});