
const express = require('express');
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');
const fetchVideoInfo = require('youtube-info');
const youtubeThumbnail = require('youtube-thumbnail');


const app = express();

const publicDir = path.join(__dirname, 'public');

const notifyTimerClickSeconds = 10;


const connectedClients = [];
const syncedClients = [];
const serverPlaylist = [];
const allClientLists = [connectedClients, syncedClients, serverPlaylist];


app.set('port', process.env.PORT || 3000);
app.use(bodyParser.json()); // Parses json, multi-part (file), url-encoded
console.log(__dirname);
app.use(express.static(`${__dirname}/../public`));

app.get('/', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

const server = http.createServer(app);
const io = require('socket.io')(server);
const db = require('./database');


server.listen(app.get('port'), () => {
  console.log(`Web server listening on port ${app.get('port')}`);
});


io.on('connection', (socket) => {
  // let rooms = Object.keys(socket.rooms);
  // io.emit('roomList', rooms);
  const room = socket.handshake.headers.referer.split('?')[1];
  socket.join(room);

  const total = io.sockets.adapter.rooms[room].length;
  console.log(`Clients in ${room}: ${total}`);


  // Create lists only if they are needed
  [connectedClients, syncedClients, serverPlaylist].forEach((list, I) => {
    if (!list[room]) {
      console.log(`CLEAN LIST ${I}`);
      list[room] = [];
    }
  });

  setInterval(() => {
    // console.log('Interval, sync data!');
    // syncData({ room });
  }, notifyTimerClickSeconds * 1000);

  socket.on('disconnect', () => {
    console.log('Got disconnect!');
    const theRoom = removeClientInList(socket.id, room);
    if (theRoom) {
      syncData({ room: theRoom });
    }
  });


  socket.on('clientReady', (clientData) => {
    addClientInList(clientData);
    if (io.sockets.adapter.rooms[room].length > 1) {
      console.log(`New client found: ${clientData.clientName} ,let's notify others`);
      io.to(room).emit('newClient', clientData);
    } else {
      console.log('No one in room so... no more commmunication, but I added!');
    }

    getRoomFavedVideos(room)
      .then((res) => {
        io.to(room).emit('updateClientResults', { connectedClients: connectedClients[room], serverPlaylist: serverPlaylist[room], favedData: res }, clientData.clientId);
      })
      .catch((res) => {});

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
    io.to(room).emit('getVideoStatus', data);
  });

  socket.on('videoSeekChanged', (data) => {
    console.log(`"${data.clientName}" changed the seek bar!! Let's update it!`);
    const { videoId, time, clientId } = data;
    requestPlayVideo({
      videoId,
      time,
      playNotFor: clientId,
      room: data.room,
    });
  });

  socket.on('checkSync', () => {
    console.log('A client asked for sync data!');
    syncData({ room });
  });


  socket.on('toggleFavVideo', (videoData) => {
    console.log('A client asked to fav a video!');

    // 1. first check if the video was faved by anyone
    db.findOne({ videoId: videoData.videoId, room: videoData.room })
      .then((res) => {
        if (res) {
          // check if the video was faved by the current User
          const videoFavedByUser = res.favedBy.find(x => x === videoData.clientId);
          let newArray = [];
          if (videoFavedByUser) {
            // if the video was faved, then remove it of the stack

            const indexToRemove = res.favedBy.indexOf(videoData.clientId);
            if (indexToRemove !== -1) {
              res.favedBy.splice(indexToRemove, 1);
            }
            newArray = res.favedBy;
          } else {
            // if it was not faved, then add it
            res.favedBy.push(videoData.clientId);
            newArray = res.favedBy;
          }

          db.update(
            { videoId: videoData.videoId, room: videoData.room },
            { $set: { favedBy: newArray } },
            {},
          )
            .then((res) => {
              emitUpdatePlaylist(videoData.room);
            })
            .catch((err) => {
            });
        } else {
          // not found so we create it!

          const video = {
            videoId: videoData.videoId,
            favedBy: [videoData.clientId],
            room: videoData.room,
            url: videoData.url,
            title: videoData.title,
            duration: videoData.duration,
          };
          db.insert(video)
            .then((res) => {
              emitUpdatePlaylist(videoData.room);
            })
            .catch((err) => {});
        }
      })
      .catch((err) => {
      });
  });


  socket.on('checkSyncGet', (clientData) => {
    console.log(`Get sync data from ${clientData.clientName} (${clientData.clientId}}) - total of: ${io.sockets.adapter.rooms[room].length}`);

    const foundClient = connectedClients[room].find(x => x.clientId === clientData.clientId);

    if (foundClient) {
    }

    if (!syncedClients[room].find(x => x.clientId === clientData.clientId)) {
      // fix name!

      if (foundClient) {
        clientData.clientName = foundClient.clientName;
        syncedClients[room].push(clientData);
        console.log('..and pushed the new data');
      }
    }

    // if (syncedClients.length === connectedClients.length) {
    if (syncedClients[room].length === io.sockets.adapter.rooms[room].length) {
      console.log('All clients sent their data.. we send sync info!');



      getRoomFavedVideos(room)
        .then((res) => {
          io.to(room).emit('updateClientResults', { connectedClients: syncedClients[room], serverPlaylist: serverPlaylist[room], favedData: res  });
          connectedClients[room] = syncedClients[room].slice();
          syncedClients[room] = []; // clear the poll!
        })
        .catch((res) => {});
    }
  });


  socket.on('clientBuffering', (clientData) => {
    // syncData();
    const foundClient = connectedClients[room].find(client => client.clientId === clientData.clientId);
    console.log(`${clientData.clientName} (${clientData.clientId}) Client is buffering, let's announce everyone!`);
    if (!foundClient) {
      console.error("CLIENTBUFFERING: foundClient not found. Here's the search data");
      console.error(clientData);
      console.error('-----and connected clients');
      console.error(connectedClients[room]);
      console.error('-----------------------------------------------');
      console.error('client id should be matching on both!');
    } else {
      foundClient.status = clientData.status;

      getRoomFavedVideos(room)
        .then((res) => {
          io.to(room).emit('updateClientResults', { connectedClients: connectedClients[room], serverPlaylist: serverPlaylist[room], favedData: res  });
        })
        .catch((res) => {});

    }
  });

  socket.on('clientPlayingVideo', (clientData) => {
    // syncData();
    const foundClient = connectedClients[room].find(client => client.clientId === clientData.clientId);
    console.log(`${clientData.clientName} (${clientData.clientId}) Client is playing, let's announce everyone!`);
    if (!foundClient) {
      console.error("CLIENTPLAYINGVIDEO: foundClient not found. Here's the search data");
      console.error(clientData);
      console.error('-----and connected clients');
      console.error(connectedClients[room]);
      console.error('-----------------------------------------------');
      console.error('client id should be matching on both!');
    } else {
      foundClient.status = clientData.status;

      getRoomFavedVideos(room)
        .then((res) => {
          io.to(room).emit('updateClientResults', { connectedClients: connectedClients[room], serverPlaylist: serverPlaylist[room], favedData: res  });
          syncData({ room });

        })
        .catch((res) => {});

    }
  });

  socket.on('selectedCookieName', (clientData) => {
    console.log(`Client changes name ${clientData.clientName} > ${clientData.clientNewName}`);
    [...allClientLists].forEach((list) => {
      list[room].find(client => client.clientId === clientData.clientId).clientName = clientData.clientNewName;
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
    io.to(room).emit('pauseVideo');
  });

  socket.on('videoContinueGlobal', (data) => {
    console.log(`"${data.clientName}" continued the video! Let's continue in all`);
    io.to(room).emit('continueVideo');
  });

  // Video queue

  socket.on('queueVideo', (videoData) => {
    console.log(`"${videoData.clientName}" wants to queue a video`);
    queueVideo(videoData);
  });

  socket.on('dequeueVideo', (videoData, position, playNext) => {
    console.log(`"${videoData.clientName}" wants to dequeue a video`);
    dequeueVideo(videoData, position);
    console.log('serverPlaylist', serverPlaylist[videoData.room].length);
    if (playNext && serverPlaylist[videoData.room].length > 0) {
      console.log('Play next video');
      console.log(serverPlaylist[videoData.room][0]);
      io.to(videoData.room).emit('playVideo', serverPlaylist[videoData.room][0]);
    }
  });
});

const emitUpdatePlaylist = (room) => {
  getRoomFavedVideos(room)
    .then((res) => {
      io.to(room).emit('playlistUpdated', serverPlaylist[room], res);
    })
    .catch((res) => {});
};


const queueVideo = (videoData) => {
  if (serverPlaylist[videoData.room].length === 0 || serverPlaylist[videoData.room][serverPlaylist[videoData.room].length - 1].videoId !== videoData.videoId) {
    fetchVideoInfo(videoData.videoId).then((videoInfo) => {
      videoData.url = videoInfo.url;
      videoData.title = videoInfo.title;
      videoData.duration = videoInfo.duration;
      videoData.thumbnail = youtubeThumbnail(videoInfo.url);
      console.log(videoData);
      serverPlaylist[videoData.room].push(videoData);

      emitUpdatePlaylist(videoData.room);
    });
  } else {
    console.log(`The video ${videoData.videoId} was already added`);
  }
};

const dequeueVideo = (videoData, position) => {
  serverPlaylist[videoData.room].splice(position, 1);
  emitUpdatePlaylist(videoData.room);
};


const requestPlayVideo = (attr) => {
  io.to(attr.room).emit('playVideo', attr);
};

const requestPauseVideo = (attr) => {
  requestPlayVideo({
    ...attr,
    mode: 'pause',
  });
};


const addClientInList = (clientData) => {
  if (!connectedClients[clientData.room].find(x => x.clientId === clientData.clientId)) {
    if (connectedClients[clientData.room].find(client => client.clientName === clientData.clientName)) {
      console.log('Found duplicidad');
      const sameTotal = connectedClients[clientData.room].filter(client => client.clientOldName === clientData.clientName).length + 2;
      clientData.clientOldName = clientData.clientName;
      clientData.clientName += ` (${sameTotal})`;
    }
    connectedClients[clientData.room].push(clientData);
  }
};

const removeClientInList = (socketId, room) => {
  const foundClient = connectedClients[room].find(client => client.socketId === socketId);
  if (foundClient) {
    console.log(`Removed ${foundClient.clientName} (${foundClient.clientId}) sockedId: ${foundClient.socketId}}`);
    connectedClients[room] = connectedClients[room].filter(client => client.socketId !== socketId);
  } else {
    console.log(`Client with that socked ID doesn't exist: ${socketId}`);
  }

  return room;
};

const syncData = (data) => {
  console.log(data);
  syncedClients[data.room] = [];
  io.to(data.room).emit('checkSyncAsk');
};


const getRoomFavedVideos = room => db.find({ room });


// Al cambiar de video, sie n el local history se quedó con un time, este no vuelve. Deberia volver a 00.
/*

db.insert({ casa: true }, (err, newDoc) => {
  console.log(newDoc);
});

 */
