let getYoutubeId = require('get-youtube-id')

const generateRandomAnimalName = require('random-animal-name-generator');
window.socket = io();
window.clientName = generateRandomAnimalName();


$("#clientName").text(window.clientName);

socket.on('playVideo', function(videoData){
  const {playOnlyFor, playNotFor, mode} = videoData;

  if (playNotFor && window.clientName === playNotFor) {
    return; // early return!
  }

  let send = false;
  if (playOnlyFor) {
    if (playOnlyFor === window.clientName) {
      send = true;
    }
  } else {
    send = true;
  }

  if (send) {
    if (mode == "pause") {
      console.log("Server requested to pause video");
    } else {
      console.log("Server requested to play video");
    }
    let {id, second} = videoData;
    loadVideo(id, second, mode);
    $('#addLink').val(`https://www.youtube.com/watch?v=${id}&t=${Math.trunc(second)}`)
  }
});


socket.on('newConnection', function(data){

  if (window.clientName === data.clientName) {
    console.log("Yeah! Server is notification all the friends!")
  } else {
    console.log("Oh! Server says A new friend! Let's send our progress!");
    notifyVideoStatus({
      videoId: player.videoId,
      time: player.getCurrentTime(),
      clientName: window.clientName,
    });

  }

})


socket.on("ping", function(data){
  console.log("Server says ping! Let's reply that fucker!!");

  socket.emit('pong', {
    clientName: window.clientName,
  });

})

socket.on("updateConnectedClients", function(connectedClients){

  console.log("Received a new client list... let's update it");
  const clients = connectedClients.reduce((old, curr) => {
    return old + `<li>${curr}</li>`
  }, "");

  $("#connectedClients").html(`<ul>${clients}</ul>`);

})


socket.on("getVideoStatus", function(requestedBy) {
  if (window.clientName !== requestedBy) {
    sendVideoStatusToServer({
      videoId: player.getVideoData().video_id,
      time: player.getCurrentTime(),
      clientName: window.clientName,
      requestedBy,
    });
  }

})

socket.on("pauseVideo", function() {
  player.pauseVideo();
})

socket.on("continueVideo", function() {
  player.playVideo();
})


function sendVideoStatusToServer(videoData) {
  socket.emit('sendVideoStatusToServer', videoData);
}


function notifyVideoStatus(videoData) {
  socket.emit('notifyStatus', videoData);
}


function getVideoUrlData() {


  // let videoTest = 'https://www.youtube.com/watch?v=TdBSoy9F9NA&t=2091s';
  let videoTest = $('#addLink').val()
  let id = getYoutubeId(videoTest)
  const urlParams = new URLSearchParams(videoTest.split('?')[1]);
  return {
    id: id,
    second: +(urlParams.get('t') && urlParams.get('t').replace('s','')) || 0,
  };
}

window.broadcastVideo = function () {
  debugger;
  let {id, second } = getVideoUrlData();
  console.log("sending broadcast to server");
  socket.emit('playVideo', {
    id,
    second,
  });
}

window.syncVideo = function () {
  console.log("Let's ask server for the updated time!");

  socket.emit('askRunningVideoData', {
    clientName: window.clientName,
  });
}

window.pauseVideo = function () {
  console.log("Let's send a pause event through the server!!");
  socket.emit('videoPausedGlobal', {
    clientName: window.clientName,
  });
}

window.continueVideo = function () {
  console.log("Let's send a continue event through the server!!");
  socket.emit('videoContinueGlobal', {
    clientName: window.clientName,
  });
}


