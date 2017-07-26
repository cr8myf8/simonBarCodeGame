const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const SerialPort = require('serialport');
const fs = require('fs');

const port = new SerialPort('COM3', {
    autoOpen: false,
    baudRate: 115200
});

var prevColor;
var newColor;

// serve up the front end files
app.use(express.static(__dirname + '/../build/web/'));



// initiate a socket connection
io.on('connection', function(socket) {
  console.log('Socket Connected (server)!');
  
  
  // log out possible errors
  socket.on('error', function(err) {
    console.error('SOCKET ERROR!', err);
  });
  
  // communicating that I'm paying attention
  socket.emit('server');
  socket.on('client', function() {
    console.log('handshake');
  });
  
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
    console.log('new color: ' + prevColor);

    // when the user scans a code
    port.on('data', function(data) {
      var mbRec = parseInt(new Buffer(data, 'utf-8'));
      console.log('scanned: ' + mbRec + ' expected: ' + prevColor);
      // if they got it right, send a point and a new color
      if (mbRec === prevColor) {
        newColor = getRandomInt(1, 4);
        socket.emit('point');
        socket.emit('new color', newColor);
        prevColor = newColor;
        console.log('new color: ' + newColor);
      }
    });
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
      console.error('Error on the port: ', err);
    });

  });
  
  socket.on('end game', function(leaderboard) {
    fs.writeFile(__dirname + '/../build/web/assets/leaderboard.json',
        JSON.stringify(leaderboard), function(err) {
      if (err) {
        console.error('Error writing to file', err);
      }
    });
    if (port.isOpen) {
      port.close();
    }
    console.log('Game is now over');
    socket.emit('ended game');
  });
  
  socket.on('disconnect', function() {
    console.log('socket disconnected (client)');
    socket.removeAllListeners();
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