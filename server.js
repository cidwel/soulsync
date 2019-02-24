const express = require('express');
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');
const fetchVideoInfo = require('youtube-info');
const youtubeThumbnail = require('youtube-thumbnail');


const app = express();

const publicDir = path.join(__dirname, 'public');

const notifyTimer = 0;
const notifyTimerLimit = 3;
const notifyTimerClickSeconds = 10;


let connectedClients = [];
let syncedClients = [];
let serverPlaylist = [];
const allClientLists = [connectedClients, syncedClients, serverPlaylist];

/*
setInterval(() => {
  console.log('Interval, sync data!');
  syncData();
}, notifyTimerClickSeconds * 1000);
*/

app.set('port', process.env.PORT || 3000);
app.use(bodyParser.json()); // Parses json, multi-part (file), url-encoded
app.use(express.static(`${__dirname}/public`));

app.get('/', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

const server = http.createServer(app);
const io = require('socket.io')(server);


server.listen(app.get('port'), () => {
  console.log(`Web server listening on port ${app.get('port')}`);
});


io.on('connection', (socket) => {
  const total = io.engine.clientsCount;

  console.log(`Client found! ${total} client(s) online`);

  socket.on('disconnect', () => {
    console.log('Got disconnect!');
    removeClientInList(socket.id);
    syncData();
  });


  socket.on('clientReady', (clientData) => {
    addClientInList(clientData);
    if (io.engine.clientsCount > 1) {
      console.log(`New client found: ${clientData.clientName} ,let's notify others`);
      io.emit('updateClientResults', { connectedClients, serverPlaylist }, clientData.clientId);
      io.emit('newClient', clientData);
    } else {
      console.log('No one in room so... no more commmunication');
    }
  });


  socket.on('playVideo', (videoData) => {
    console.log('Client send play video. Broadcasting!!');
    requestPlayVideo(videoData);
  });


  socket.on('sendVideoStatusToServer', (videoData, goSync) => {
    console.log(`SendVideoStatusToServer: Let's emit play video for only ${videoData.requestedBy}`);

    if (goSync) {
      requestPlayVideo({
        ...videoData,
      });
    } else {
      requestPlayVideo({
        ...videoData,
        playOnlyFor: videoData.requestedBy,
      });
    }
  });

  socket.on('askRunningVideoData', (data) => {
    console.log(`"${data.clientName}" wants to force to sync! Let's ask people!`);
    io.emit('getVideoStatus', data);
  });

  socket.on('videoSeekChanged', (data) => {
    console.log(`"${data.clientName}" changed the seek bar!! Let's update it!`);
    const { videoId, time, clientId } = data;
    requestPlayVideo({
      videoId,
      time,
      playNotFor: clientId,
    });
  });

  socket.on('checkSync', (clientData) => {
    console.log('A client asked for sync data!');
    syncData();
  });


  socket.on('checkSyncGet', (clientData) => {
    console.log(`Get sync data from ${clientData.clientName} (${clientData.clientId}}) - total of: ${io.engine.clientsCount}`);
    if (!syncedClients.find(x => x.clientId === clientData.clientId)) {
      // fix name!

      clientData.clientName = connectedClients.find(x => x.clientId === clientData.clientId).clientName;
      syncedClients.push(clientData);
      console.log('..and pushed the new data');
    }

    // if (syncedClients.length === connectedClients.length) {
    if (syncedClients.length === io.engine.clientsCount) {
      console.log('All clients sent their data.. we send sync info!');
      io.emit('updateClientResults', { connectedClients: syncedClients, serverPlaylist });

      connectedClients = syncedClients.slice();

      syncedClients = []; // clear the poll!
    }
  });


  socket.on('clientBuffering', (clientData) => {
    // syncData();
    const foundClient = connectedClients.find(client => client.clientId === clientData.clientId);
    console.log(`${clientData.clientName} (${clientData.clientId}) Client is buffering, let's announce everyone!`);
    if (!foundClient) {
      console.error("CLIENTBUFFERING: foundClient not found. Here's the search data");
      console.error(clientData);
      console.error('-----and connected clients');
      console.error(connectedClients);
      console.error('-----------------------------------------------');
      console.error('client id should be matching on both!');
    } else {
      foundClient.status = clientData.status;
      io.emit('updateClientResults', { connectedClients, serverPlaylist });
    }
  });

  socket.on('clientPlayingVideo', (clientData) => {
    // syncData();
    const foundClient = connectedClients.find(client => client.clientId === clientData.clientId);
    console.log(`${clientData.clientName} (${clientData.clientId}) Client is playing, let's announce everyone!`);
    if (!foundClient) {
      console.error("CLIENTPLAYINGVIDEO: foundClient not found. Here's the search data");
      console.error(clientData);
      console.error('-----and connected clients');
      console.error(connectedClients);
      console.error('-----------------------------------------------');
      console.error('client id should be matching on both!');
    } else {
      foundClient.status = clientData.status;
      io.emit('updateClientResults', { connectedClients, serverPlaylist });
      syncData();
    }
  });

  socket.on('selectedCookieName', (clientData) => {
    console.log(`Client changes name ${clientData.clientName} > ${clientData.clientNewName}`);
    [...allClientLists].forEach((list) => {
      list.find(client => client.clientId === clientData.clientId).clientName = clientData.clientNewName;
    });
  });


  // //////////////////////////////////////////////////////////////////////////////
  // Video simple actions

  socket.on('videoPaused', (data) => {
    console.log(`"${data.clientName}" paused the video! (partial) Let's pause all!`);
    const { videoId, time, playNotFor: clientId } = data;
    requestPauseVideo({
      videoId, time, playNotFor: clientId,
    });
  });
  socket.on('videoPausedGlobal', (data) => {
    console.log(`"${data.clientName}" paused the video (global)! Let's pause all!`);
    io.emit('pauseVideo');
  });

  socket.on('videoContinueGlobal', (data) => {
    console.log(`"${data.clientName}" continued the video! Let's continue in all`);
    const { videoId, time, clientName } = data;
    io.emit('continueVideo');
  });

  // Video queue

  socket.on('queueVideo', (videoData) => {
    console.log(`"${videoData.clientName}" wants to queue a video`);
    queueVideo(videoData);
  });

  socket.on('dequeueVideo', (videoData) => {
    console.log(`"${videoData.clientName}" wants to dequeue a video`);
    dequeueVideo(videoData);
  });
});


const queueVideo = (videoData) => {
  if (serverPlaylist.length === 0 || serverPlaylist[serverPlaylist.length - 1].videoId !== videoData.videoId) {
    fetchVideoInfo(videoData.videoId).then((videoInfo) => {
      videoData.url = videoInfo.url;
      videoData.title = videoInfo.title;
      videoData.duration = videoInfo.duration;
      videoData.thumbnail = youtubeThumbnail(videoInfo.url);
      console.log(videoData);
      serverPlaylist.push(videoData);
      io.emit('playlistUpdated', serverPlaylist);
    });
  } else {
    console.log(`The video ${videoData.videoId} was already added`);
  }
};

const dequeueVideo = (videoData, position) => {
  serverPlaylist.splice(position, 1)

  io.emit('playlistUpdated', serverPlaylist);

};


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
    if (connectedClients.find(client => client.clientName === clientData.clientName)) {
      console.log('Found duplicidad');
      const sameTotal = connectedClients.filter(client => client.clientOldName === clientData.clientName).length + 2;
      clientData.clientOldName = clientData.clientName;
      clientData.clientName += ` (${sameTotal})`;
    }
    connectedClients.push(clientData);
  }
};

const removeClientInList = (socketId) => {
  const foundClient = connectedClients.find(client => client.socketId === socketId);
  if (foundClient) {
    console.log(`Removed ${foundClient.clientName} (${foundClient.clientId}) sockedId: ${foundClient.socketId}}`);
    connectedClients = connectedClients.filter(client => client.socketId !== socketId);
  } else {
    console.log(`Client with that socked ID doesn't exist: ${socketId}`);
  }
};

const syncData = () => {
  syncedClients = [];
  io.emit('checkSyncAsk');
};


// Al cambiar de video, sie n el local history se quedó con un time, este no vuelve. Deberia volver a 00.
