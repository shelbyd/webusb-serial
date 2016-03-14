'use strict';

var util = require('util');
var stream = require('stream');

var DEFAULT_FILTERS = [
  { 'vendorId': 0x2341, 'productId': 0x8036 },
  { 'vendorId': 0x2341, 'productId': 0x8037 }
];

function WebUSBSerialPort(options) {
  var self = this;

  self.options = options || {};
  self.filters = options.filters || DEFAULT_FILTERS;

  navigator.usb.requestDevice({filters: self.filters })
    .then(function(device){
      self.device = device;

      var readLoop = function(){
        self.device.transferIn(5, 64).then(function(result){
          console.log('read', result);
          self.emit('data', result.data);
          readLoop();
        }, function(error){
          console.log('read error', error);
          self.emit('emit', error);
        });
      };

      self.device.open()
        .then(function(){
          return self.device.getConfiguration();
        })
        .then(function(config){
          if (config.configurationValue == 1) {
            return {};
          } else {
            throw new Error("Need to setConfiguration(1).");
          }
        })
        .catch(function(error){
          return self.device.setConfiguration(1);
        })
        .then(function(){
          return self.device.claimInterface(2);
        })
        .then(function(){
          return  self.device.controlTransferOut({
            'requestType': 'class',
            'recipient': 'interface',
            'request': 0x22,
            'value': 0x01,
            'index': 0x02});
        })
        .then(function() {
          self.emit('open');
          readLoop();
        });

  })
  .catch(function(err){
    self.emit('error', err);
  });

}

util.inherits(WebUSBSerialPort, stream.Stream);


WebUSBSerialPort.prototype.open = function (callback) {
  this.emit('open');
  if (callback) {
    callback();
  }

};



WebUSBSerialPort.prototype.write = function (data, callback) {
  console.log('send', data);
  return this.device.transferOut(4, data);

};



WebUSBSerialPort.prototype.close = function (callback) {
  console.log('closing');
  var self = this;
  self.device.controlTransferOut({
              'requestType': 'class',
              'recipient': 'interface',
              'request': 0x22,
              'value': 0x00,
              'index': 0x02})
    .then(function(){
      self.device_.close();
      if(callback){
        callback();
      }
    });

};

WebUSBSerialPort.prototype.flush = function (callback) {
  console.log('flush');
  if(callback){
    callback();
  }
};

WebUSBSerialPort.prototype.drain = function (callback) {
  console.log('drain');
  if(callback){
    callback();
  }
};



module.exports = {
  SerialPort: WebUSBSerialPort
};
