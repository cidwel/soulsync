
var express = require('express');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');

var app = express();

var publicDir = path.join(__dirname, 'public');

var notifyTimer = 0;
var notifyTimerLimit = 3;
var notifyTimerClickSeconds = 1;

var connectedClients = [];

setInterval(() => {
  notifyTimer++;
}, notifyTimerClickSeconds*1000);



app.set('port', process.env.PORT || 3000);
// app.use(logger('dev'))
app.use(bodyParser.json()) // Parses json, multi-part (file), url-encoded
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.sendFile(path.join(publicDir, 'index.html'))
})

var server = http.createServer(app);
var io = require('socket.io')(server);


server.listen(app.get('port'), function () {
  console.log('Web server listening on port ' + app.get('port'))
})

const notifyNewConnection = (data) => {
  io.emit('newConnection', data );
}

const sendPingToClients = () => {
  console.log("Let's ping all the users!");
  io.emit('ping', data );
  connectedClients = []; // we clean the connected clients stack
}


io.on('connection', function (socket) {

  var total=io.engine.clientsCount;

  console.log("Client found! " + total + " client(s) online");

  socket.on('clientReady',function(clientData){
    connectedClients.push(clientData.clientName);
    io.emit('updateConnectedClients', connectedClients );
    console.log("New client found: " + clientData.clientName + " ,let's notify others");
    notifyNewConnection({
      total,
      ...clientData,
    });

  });


  socket.on('pong',function(clientData){
    connectedClients.push(clientData.clientName);
    io.emit('updateConnectedClients', connectedClients );

  });

  socket.on('playVideo',function(videoData){
    const {id, second} = videoData;
    console.log('Client send play video. Broadcasting!!');
    io.emit('playVideo', { id, second });
  });


  socket.on('notifyStatus',function(data){

    if (notifyTimer > notifyTimerLimit){
      console.log(data);
      const {
        id, second
      } = data;

      notifyTimer = 0;
      console.log("Locked notifyStatus!! for client: videoData")

      io.emit('playVideo', { id, second });
      // sendPingToClients();
    }
  });

  socket.on('sendVideoStatusToServer',function(videoData) {

    console.log("SendVideoStatusToServer: Let's emit play video!!");
    const { videoId, time, clientName, requestedBy } = videoData;

    io.emit('playVideo', {
      id: videoId,
      second: time,
      playOnlyFor: requestedBy
    });

  });



  socket.on('askRunningVideoData',function(data){
    console.log(`"${data.clientName}" is asking to sync! Let's ask people!`)
    io.emit('getVideoStatus', data.clientName);
  });


  socket.on('videoSeekChanged',function(data){
    console.log(`"${data.clientName}" changed the seek bar!! Let's update it!`);

    const {videoId, time, clientName} = data;
    io.emit('playVideo', {
      id: videoId,
      second: time,
      playNotFor: clientName,
    });

  });

  socket.on('videoPaused',function(data){
    console.log(`"${data.clientName}" paused the video! Let's pause all!`);

    const {videoId, time, clientName} = data;
    io.emit('playVideo', {
      id: videoId,
      second: time,
      playNotFor: clientName,
      mode: 'pause',
    });

  });


  socket.on('videoPausedGlobal',function(data){
    console.log(`"${data.clientName}" paused the video! Let's pause all!`);
    io.emit('pauseVideo');

  });

  socket.on('videoContinueGlobal',function(data){
    console.log(`"${data.clientName}" continued the video! Let's continue in all`);
    const {videoId, time, clientName} = data;
    io.emit('continueVideo');

  });










});




