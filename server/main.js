const express = require('express');
const app = express();
// var server 	= require('http').Server(app);
var server 	= require('http').createServer(app);
var io 		= require('socket.io')(server);
var SerialPort = require('serialport');
var Readline = SerialPort.parsers.Readline;

const totalGameTime = 20000; // in milliseconds
var prevColor = 1;
var gamePoint = 0;
var comPorts = new Array;

app.use(express.static(__dirname + '/resources'));

app.get('/', function (req, res) {
  comPorts.length=0;
  SerialPort.list(function (err, ports) {
    ports.forEach(function(port) {
     comPorts.push (port.comName);      
      console.log(port.comName);
    } );
  });

  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  var port = new SerialPort("COM3", {
    baudRate: 115200
   });;
  console.log("Socket Connected");
  /** Returns a random integer between min (inclusive) and max (inclusive)
   * Using Math.round() will give you a non-uniform distribution! */
  function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  socket.emit('connected', comPorts);

  socket.on('startGame', function(data) {
   console.log("game started:"+data)
    //socket.emit("newColorEvent",1);
   gamePoint = 0;
   /*
   port = new SerialPort(data, {
    baudRate: 115200
   });
   port.open(function(){});
   setTimeout(function(){ // start Timer to End Game
      socket.emit('endOfGame'); 
      port.close(function(){});
    }, totalGameTime);
    */
   socket.emit("newColorEvent", getRandomInt(1,4));
  });

  /* Serial Port Stuff */

  port.on('open', function() {
    console.log("port opened:",port.path)
  });

  port.on('data', function (data) {
    //console.log('Data:', mbRec);
    var mbRec = new Buffer(data, 'utf-8')
	  mbRec = mbRec.toString();
    console.log('Data:', data);
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

});

server.listen(3000, function() {
    console.log('socket on port 3000');
  });
