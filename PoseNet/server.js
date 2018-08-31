const port_http = 8080;

// init dependencies
const osc = require('node-osc');

const express = require('express');
const app = express();
const http = require('http').Server(app);
app.use('/', express.static('static'));

const io = require('socket.io')(http);

let server;

process.on('uncaughtException', function (err) {
  if (err.errno === 'EADDRINUSE')
    console.log("already running");
  else
    console.log(err);
  process.exit(1);
});

http.listen(port_http, function () {
  console.log('listening on *:' + port_http);
});


let client = new osc.Client('127.0.0.1', 13000);

io.on('connection', function (socket) {
  console.log('a user connected');
  socket.on('disconnect', function () {
    console.log('user disconnected');
  });
  socket.on('pose', function (msg) {
    client.send('/pose/points', msg, function (error) {
    });
  });
});
