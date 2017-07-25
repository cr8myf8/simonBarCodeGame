const express = require('express');
const app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var SerialPort = require('serialport');
var port = new SerialPort('/dev/tty.usbmodem1421', {
  autoOpen: false,
  baudRate: 115200
});
var prevColor;
var newColor;
var portError;
var fs = require('fs');

// serve up the front end files
app.use(express.static(__dirname + '/../build/web/'));

// app.post('/leaderboard', function(req, res) {
//   console.log(req.body);
// });

// log when the port is opened
port.on('open', function() {
  console.log('The port is now open');
});

// log when the port is closed
port.on('close', function() {
  console.log('The port is now closed');
});

// log if there is an error on the port
port.on('error', function(err) {
  portError = err;
  console.error('Error on the port: ', portError);
});

// initiate a socket connection
io.on('connect', function(socket) {
  console.log('Socket Connected (server)!');
  
  socket.emit('server');
  
  socket.on('client', function() {console.log('handshake')});
  
  // when the user clicks play and after a 3-2-1 countdown
  socket.on('start game', function() {
    console.log('Game started!');

    // open the serial port for the scanner
    if (!port.isOpen) {
      console.log('Opening serial port');
      port.open();
    }

    // send a color
    prevColor = getRandomInt(1, 4);
    socket.emit('new color', prevColor);

    // when the user scans a code
    port.on('data', function(data) {
      var mbRec = parseInt(new Buffer(data, 'utf-8'));
      // console.log('data', data);
      console.log('scanned: ' + mbRec + ' expected: ' + prevColor);
      // if they got it right, send a point and a new color
      if (mbRec === prevColor) {
        newColor = getRandomInt(1, 4);
        prevColor = newColor;
        socket.emit('point');
        socket.emit('new color', prevColor);
      }
    });
  });
  
  socket.on('end game', function(leaderboard) {
    console.log(leaderboard);
    fs.writeFile(__dirname + '/../web/assets/leaderboard.json',
        JSON.stringify(leaderboard), function(err) {
      if (err) {
        console.log('Error writing to file', err);
      }
    });
    if (port.isOpen) {
      port.close();
    }
    console.log('Game is now over');
  });
  
  socket.on('disconnect', function() {
    console.log('socket disconnected (client)');
  });
});

io.on('disconnect', function() {
  console.log('Socket disconnected (server)');
});

server.listen(3000, function() {
  console.log('App and socket on port 3000');
});

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}