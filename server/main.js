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
console.log("game time:"+totalGameTime);
/****** Game Variables ******/
var prevColor = 1;
var gamePoint = 0;
var currentPlayer ="fakeName";
var leaderList = fs.readFileSync('../leaders.json').toString();
leaderList = JSON.parse(leaderList);

 /* Serial Port Setup */
  var port = new SerialPort(userConfig["SCANNERPORT"], {
      baudRate: 115200,
      parser: SerialPort.parsers.readline
  });

app.use(express.static(__dirname + '/resources'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/welcome.html');
});

app.get('/game', function (req, res) {
  res.sendFile(__dirname + '/game.html');
});

app.get('/leaderBoard', function (req, res) {
  res.sendFile(__dirname + '/leaderBoard.html');
});

var gameSocket; // magic socket pointer
io.on('connection', function (socket) {
  //console.log(Object.keys(io.sockets.sockets));
  socket.emit('connected',userConfig["GAMETIME"]);

  socket.on('startGame', function() {
    gameSocket = socket;
    console.log("game started:"+socket["id"])
      //socket.emit("newColorEvent",1);
    gamePoint = 0;
    socket.emit("updatePoints",gamePoint);
    prevColor = getRandomInt(1,4);
    socket.emit("newColorEvent", {
      "color":prevColor,"difficulty":userConfig["GAMEDIFFICULTY"] });
    setTimeout(function(){ // start Timer to End Game
      console.log("Serv End of Game")
      socket.emit('endOfGame');
    }, totalGameTime);
  });

  socket.on('leaderPage', function () {
    leaderListSort();
    console.log ("post game leader list sort:"+leaderList[leaderList.length-1]) 
    if (gamePoint > leaderList[leaderList.length-1]["point"]){
        leaderList.push({"name":currentPlayer,"point":gamePoint})
    }
    leaderListSort(); // sort after placing new leader
    socket.emit("currentPoints",{"name":currentPlayer,"point":gamePoint});
    socket.emit("getLeaders",leaderList);
      // limit leader list
      if ( leaderList.length >7){
        leaderList.pop(); // remove the lowest score
        console.log(JSON.stringify(leaderList));
      }
    fs.writeFile("../leaders.json", JSON.stringify(leaderList), function(err) {}); 
    gamePoint = 0;
    currentPlayer = "";
  });   

  socket.on('recordName', function (data) {
        console.log("current Player:"+data);
        currentPlayer = data;
  });

  socket.on('disconnect', function () {
        console.log('disconnected event');
        console.log(socket["id"]);
  });

  socket.on("movePage", function (){
    socket.disconnect();
  });
});
/****** End of Connected Socket ******/


  /****** Serial Port Stuff ******/ 
 /* Port Events */
  port.on('open', function() {
    console.log("port opened:",port.path)
    console.log("Scanner Port Open Event")
    console.log("****************************************")
    console.log("************  Sever Ready  *************")
    console.log("****************************************")
  });
/* Game Logic happens in Serial Data Event. This event drives the game */
  port.on('data', function (data) {
    console.log(Object.keys(io.sockets.sockets));
    var mbRec = new Buffer(data, 'utf-8')
	  mbRec = mbRec.toString();
    //console.log('Data:', data);
    console.log('scanned:'+ mbRec+" prevColor:"+prevColor);
    if(Number.parseInt(mbRec) === prevColor){ // indicates correct scan in game
      var newColor = getRandomInt(1,4);
      prevColor = newColor;
      console.log('SUCCESS !!! new color:', newColor);
      //gameSocket.emit("newColorEvent", newColor);
      gameSocket.emit("newColorEvent", {
      "color":prevColor,"difficulty":userConfig["GAMEDIFFICULTY"] });
      console.log("recorded points:"+ ++gamePoint);
      gameSocket.emit("updatePoints",gamePoint);
    }
  });

  port.on('close', function (err) {
    console.log('port closed');
  });

  port.on('error', function (err) {
    console.error("error", err);
  });
/****** End of Serial Port Stuff ******/

server.listen(3000, function() {
    console.log('socket on port 3000');
  });
/****** General Functions ******/
function getRandomInt(min, max) {
    
      return Math.floor(Math.random() * (max - min + 1)) + min;
}
function leaderListSort(){
  leaderList.sort(function(a,b){
      return b.point - a.point;
  });
}