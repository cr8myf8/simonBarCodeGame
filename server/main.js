const express = require('express');
const app = express();
// var server 	= require('http').Server(app);
var server 	= require('http').createServer(app);
var io 		= require('socket.io')(server);
var SerialPort = require('serialport');
var fs = require('fs');

/****** Setup Variables ******/
var userConfig = fs.readFileSync('../CONFIG.json').toString();
userConfig = JSON.parse(userConfig);

const totalGameTime = userConfig["GAMETIME"]; // in milliseconds
/****** End of Connected Socket ******/
var prevColor = 1;
var gamePoint = 0;
var comPorts = new Array; // This was an attempt to define comport via browser and was failure

 /* Port Setup */
  var contents = fs.readFileSync('../CONFIG.json').toString();
  var port = new SerialPort(userConfig["SCANNERPORT"], {
      baudRate: 115200
  });

app.use(express.static(__dirname + '/resources'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  
  console.log("Socket Connected");
  /** Returns a random integer between min (inclusive) and max (inclusive)
   * Using Math.round() will give you a non-uniform distribution! */

  socket.emit('connected', comPorts);

  socket.on('startGame', function() {
    console.log("game started:")
      //socket.emit("newColorEvent",1);
    gamePoint = 0;
    socket.emit("updatePoints",gamePoint);
    socket.emit("newColorEvent", getRandomInt(1,4));
    setTimeout(function(){ // start Timer to End Game
      console.log("Serv End of Game")
        socket.emit('endOfGame');
    }, totalGameTime);
  });

  /****** Serial Port Stuff ******/ 

 /* Port Events */
  port.on('open', function() {
    console.log("port opened:",port.path)
    console.log("Scanner Port Open Event")
  });
/* Game Logic exits in on Data Event. This event really drives the game */
  port.on('data', function (data) {
    var mbRec = new Buffer(data, 'utf-8')
	  mbRec = mbRec.toString();
    //console.log('Data:', data);
    console.log('scanned:'+ mbRec+" prevColor:"+prevColor);
    if(Number.parseInt(mbRec) === prevColor){ // indicates correct scan in game
      var newColor = getRandomInt(1,4);
      prevColor = newColor;
      console.log('color:', newColor);
      socket.emit("newColorEvent", newColor);
      gamePoint++;
      socket.emit("updatePoints",gamePoint);
    }
  });

  port.on('close', function (err) {
    console.log('port closed');
  });

  port.on('error', function (err) {
    console.error("error", err);
  });
/****** End of Serial Port Stuff ******/
});
/****** End of Connected Socket ******/

server.listen(3000, function() {
    console.log('socket on port 3000');
  });
/****** General Functions ******/
function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
}