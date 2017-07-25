var SerialPort = require('./server//node_modules/serialport');

SerialPort.list(function (err, ports) {
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    console.log("!!!!Found the following Ports!!!!!!!!");
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    ports.forEach(function(port) {     
        console.log(port.comName);
        //console.log(port.pnpId);
        //console.log(port.manufacturer);
    });
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    console.log("!!!!!!!!!!! End of Port List !!!!!!!!");
    console.log("Change Config.Txt File to update Port");
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");});
