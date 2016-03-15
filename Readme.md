webusb-serial
=============

A virtual [node-serialport](https://github.com/voodootikigod/node-serialport) implementation that uses [webusb](https://wicg.github.io/webusb/) as the transport.


# webusbSerialPort

Use webusb to send/receive data to a USB connected physical device:

```js
var webusbSerialPort = require('webusb-serial').SerialPort;
var firmata = require('firmata');


//create the webusb serialport and optionally specify a USB filter
var serialPort = new webusbSerialPort({
  filters: [
    { 'vendorId': 0x2341, 'productId': 0x8036 },
    { 'vendorId': 0x2341, 'productId': 0x8037 }
  ]
});

//use the virtual serial port to send a command to a firmata device
var board = new firmata.Board(serialPort, function (err, ok) {
  if (err){ throw err; }
  //light up a pin
  board.digitalWrite(13, 1);
});

```


