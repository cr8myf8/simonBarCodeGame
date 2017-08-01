const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const SerialPort = require('serialport');
const fs = require('fs');
const port = new SerialPort('/dev/tty.usbmodem1411', {
  autoOpen: true,
  baudRate: 115200,
  parser: SerialPort.parsers.Readline
});
var prevColor;
var newColor;
var gameSocket;

// serve up the front end files
app.use(express.static(__dirname + '/../build/web/'));

// log when the port is opened
port.on('open', function() {
  console.log('The port is now open');
});

// log if there is an error on the port
port.on('error', function(err) {
  console.error('Error on the port: ', err);
});

// initiate a socket connection
io.on('connection', function(socket) {
  gameSocket = socket;
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

    // send a color
    prevColor = getRandomInt(1, 4);
    socket.emit('new color', prevColor);
    console.log('new color: ' + prevColor);
  });
  
  socket.on('end game', function(leaderboard) {
    fs.writeFile(__dirname + '/../build/web/assets/leaderboard.json',
        JSON.stringify(leaderboard), function(err) {
      if (err) {
        console.error('Error writing to file', err);
      }
    });

    console.log('Game is now over');
  });
  
  socket.on('quit game', function() {
    console.log('Game exited by user');
  });
  
  socket.on('disconnect', function() {
    console.log('socket disconnected (client)');
    socket.removeAllListeners();
    socket.disconnect(true);
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

  port.on('data', function(data) {
    var mbRec = parseInt(new Buffer(data, 'utf-8'));
    console.log('scanned: ' + mbRec + ' expected: ' + prevColor);
    // if they got it right, send a point and a new color
    if (mbRec === prevColor) {
      newColor = getRandomInt(1, 4);
      gameSocket.emit('point');
      gameSocket.emit('new color', newColor);
      prevColor = newColor;
      console.log('new color: ' + newColor);
    }
  });