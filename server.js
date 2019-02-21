var express = require('express');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');

var app = express();

var publicDir = path.join(__dirname, 'public');

var notifyTimer = 0;
var notifyTimerLimit = 3;
var notifyTimerClickSeconds = 10;

var connectedClients = [];

var syncedClients = [];

setInterval(() => {
  syncData();
}, notifyTimerClickSeconds*1000);



app.set('port', process.env.PORT || 3000);
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




io.on('connection', function (socket) {

  var total=io.engine.clientsCount;

  console.log("Client found! " + total + " client(s) online");

  socket.on('disconnect', function(test,test2) {
    console.log('Got disconnect!');
    syncData();
  });


  socket.on('clientReady',function(clientData){
    addClientInList(clientData);
    console.log("New client found: " + clientData.clientName + " ,let's notify others");
    io.emit('updateClientResults', connectedClients);

  });


  socket.on('playVideo',function(videoData){
    console.log('Client send play video. Broadcasting!!');
    requestPlayVideo(videoData)
  });


  socket.on('sendVideoStatusToServer',function(videoData) {
    console.log("SendVideoStatusToServer: Let's emit play video for only " + videoData.requestedBy);
    requestPlayVideo({
      ...videoData,
      playOnlyFor: videoData.requestedBy
    })

  });

  socket.on('askRunningVideoData',function(data){
    console.log(`"${data.clientName}" wants to force to sync! Let's ask people!`)
    io.emit('getVideoStatus', data);
  });

  socket.on('videoSeekChanged',function(data){
    debugger;
    console.log(`"${data.clientName}" changed the seek bar!! Let's update it!`);
    const {videoId, time, clientId} = data;
    requestPlayVideo({
      videoId: videoId,
      time: time,
      playNotFor: clientId,
    })
  });

  socket.on('checkSync', (clientData) => {
    console.log("A client asked for sync data!")
    syncData();
  });


  socket.on('checkSyncGet', (clientData) => {
    console.log("Get sync data from " + clientData.clientName);
    if (!syncedClients.find(x => x.clientId === clientData.clientId)) {
      syncedClients.push(clientData);
      console.log("..and pushed the new data");
    }

    // if (syncedClients.length === connectedClients.length) {
    if (syncedClients.length === io.engine.clientsCount) {
      console.log("All clients sent their data.. we send sync info!")
      io.emit('updateClientResults', syncedClients);
      connectedClients = syncedClients.slice();
      syncedClients = []; // clear the poll!

    }
  });


  socket.on('clientBuffering', (clientData) => {
    console.log("Client is buffering, let's announce everyone! " + clientData.clientName);
    syncData();
  });


  ////////////////////////////////////////////////////////////////////////////////
  // Video simple actions

  socket.on('videoPaused',function(data){
    console.log(`"${data.clientName}" paused the video! Let's pause all!`);
    const {videoId, time, playNotFor: clientId} = data;
    requestPauseVideo({
      videoId, time, playNotFor: clientId
    })
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


const requestPlayVideo = (attr) => {
  io.emit('playVideo', attr);
};

const requestPauseVideo = (attr) => {
  requestPlayVideo({
    ...attr,
    mode: 'pause',
  });
};


const addClientInList = (clientData) => {
  if (!connectedClients.find(x => x.clientId === clientData.clientId)) {
    connectedClients.push(clientData);
  }
};

const syncData = () => {
  syncedClients = [];
  io.emit('checkSyncAsk');
};





