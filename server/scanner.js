var SerialPort = require('serialport');
var port = new SerialPort('COM3', {
  baudRate: 115200
});

var currentScanData;

port.on('open', function() {
  console.log("port opened") 
});

port.on('data', function (data) {
  //console.log('Data:', data);
  currentScanData = data.toString();
  console.log('scanned:',currentScanData);
});

module.exports = function getCurrData() {
    return currentScanData;
}