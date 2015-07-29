// initialize everything, web server, socket.io, filesystem, johnny-five
var app = require('http').createServer(handler);
var io = require('socket.io').listen(app);
var fs = require('fs');
var five = require("johnny-five");
var path = require("path");
var board, servo, led, sensor;

board = new five.Board();

// on board ready
board.on("ready", function() {

  // init a led on pin 13, strobe every 1000ms
  led = new five.Led(13).strobe(1000);

  // setup a stanard servo, center at start
  servo = new five.Servo({
    pin:6,
    range: [0,180],
    type: "standard",
    center:true
  });

  // poll this sensor every second
  sensor = new five.Sensor({
    pin: "A0",
    freq: 58
  });

});

// make web server listen on port 80
app.listen(3000);


// handle web server
function handler (request, response) {

var filePath = '.' + request.url;
if (filePath == './')
  filePath = './index.html';

var extname = path.extname(filePath);
var contentType = 'text/html';
switch (extname) {
  case '.js':
    contentType = 'text/javascript';
    break;
  case '.css':
    contentType = 'text/css';
    break;
  case '.json':
    contentType = 'application/json';
    break;
  case '.png':
    contentType = 'image/png';
    break;      
  case '.jpg':
    contentType = 'image/jpg';
    break;
  case '.wav':
    contentType = 'audio/wav';
    break;
}

fs.readFile(filePath, function(error, content) {
  if (error) {
    if(error.code == 'ENOENT'){
      fs.readFile('./404.html', function(error, content) {
          response.writeHead(200, { 'Content-Type': contentType });
          response.end(content, 'utf-8');
      });
    }
    else {
      response.writeHead(500);
      response.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
      response.end(); 
    }
  }
  else {
    response.writeHead(200, { 'Content-Type': contentType });
    response.end(content, 'utf-8');
  }
});
};


// on a socket connection
io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
 
  // if board is ready
  if(board.isReady){
    // read in sensor data, pass to browser
    sensor.on("data",function(){
      socket.emit('sensor', { raw: this.raw });
    });
  }

  // if servo message received
  socket.on('servo', function (data) {
    console.log(data);
    if(board.isReady){ servo.to(data.pos);  }
  });
  // if led message received
  socket.on('led', function (data) {
    console.log(data);
     if(board.isReady){    led.strobe(data.delay); } 
  });

});
