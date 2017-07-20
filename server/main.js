const express = require('express')
const app = express()
var server 	= require('http').Server(app);
var io 		= require('socket.io')(server);

const totalGameTime = 20000; // in miliseconds
var prevColor = 1;

//var scanner = require("./scanner.js");
//app.use(express.static(__dirname + '/images'));
app.use(express.static(__dirname + '/resources'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
})

app.listen(3000, function () {
  console.log('listening on port 3000!')
});

server.listen(4400);

io.on('connection', function (socket) {
  console.log("Socket Connected")
  var SerialPort = require('serialport');
  var Readline = SerialPort.parsers.Readline;
  var port = new SerialPort('COM3', {
    autoOpen: false,
    baudRate: 115200
  });     

  /** Returns a random integer between min (inclusive) and max (inclusive)
   * Using Math.round() will give you a non-uniform distribution! */
  function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function mainGameLoop(){
    setTimeout(function(){ // start Timer to End Game
      socket.emit('endOfGame'); 
      port.close(function(){});
    }, totalGameTime);
    //socket.emit("newColorEvent",getRandomInt(1,4) );
  }

  socket.emit('connected', 123);
  socket.on('startGame', function(data) {
    //socket.emit("newColorEvent",1);
   port.open(function(){});
    mainGameLoop();
  });

  /* Serial Port Stuff */


  port.on('open', function() {
    console.log("port opened")
  });

  port.on('data', function (data) {
    //console.log('Data:', mbRec);
    var mbRec = new Buffer(data, 'utf-8')
	  mbRec = mbRec.toString();
    console.log('Data:', data);
    console.log('scanned:'+ mbRec+" prevColor:"+prevColor);
    if(Number.parseInt(mbRec) === prevColor){
      var newColor = getRandomInt(1,4);
      prevColor = newColor;
      console.log('color:', newColor);
      socket.emit("newColorEvent", newColor);
    }
  });

  port.on('close', function (err) {
    console.log('port closed');
  });

  port.on('error', function (err) {
    console.error("error", err);
  });

});