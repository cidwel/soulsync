let getYoutubeId = require('get-youtube-id');

const generateRandomAnimalName = require('random-animal-name-generator');
window.socket = io();
window.clientName = generateRandomAnimalName();


timer_pause = 0;
timer_playing = 1;

window.clientTimer = null;
window.clientTimerStatus = timer_pause;
window.clientTimerSeconds = 0;


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
    console.log("Yeah! Server is notificating all the friends!")
  } else {
    console.log("Oh! Server says A new friend! Let's send our progress!");
    notifyVideoStatus({
      videoId: player.getVideoData().video_id,
      time: player.getCurrentTime(),
      clientName: window.clientName,
    });
  }

})


socket.on("ping", function(){
  console.log("Server says ping! Let's reply that fucker!!");
  socket.emit('pong2', {
    clientName: window.clientName,
    videoId: player.getVideoData().video_id,
    time: player.getCurrentTime(),
    title: player.getVideoData().title,
  });

})

socket.on("updateConnectedClients", function(connectedClients){
  updateClientsData(connectedClients);
})

function updateClientsData(clientsData) {

  console.log("Received a new client list... let's update it");

  const allSameVideo = clientsData.map(x => x.videoId).every( (val, i, arr) => val === arr[0] );
  const allSameTime = clientsData.map(x => x.time).every( (val, i, arr) => Math.abs(Math.trunc(val) - Math.trunc(arr[0])) < 2 );

  clientsData.sort((a,b) => (a.clientName > b.clientName) ? 1 : ((b.clientName > a.clientName) ? -1 : 0));

  const clients = clientsData.reduce((old, curr) => {
    const allSameVideoCaption = (!allSameVideo) ? `: ${curr.title}` : '';
    const personalTimeText = (curr.clientName === window.clientName) ? 'personalTime' : '';
    const clock = `[<span id="${personalTimeText}">${secondsToClock(curr.time)}</span>]`;

    let clockText = (!allSameTime) ? clock : '';

    return old + `<li>${curr.clientName}${allSameVideoCaption} ${clockText}</li>`;
  }, "");
  if (clientsData.length > 1) {

    if (allSameVideo && allSameTime) {
      $("#syncMeter").html(`<span class="synced">Synced</span>`)
    } else {
      $("#syncMeter").html(`<span class="unsynced">Not synced</span>`)
    }

    $("#connectedClients").show();
    $("#connectedTotal").html(`Connected users (${clientsData.length}):<br>`)
    $("#connectedClients").html(`<ul>${clients}</ul>`);
  } else {
    $("#connectedTotal").text(`No one is here!`)
    $("#connectedClients").hide();
  }


}


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

socket.on("checkSyncAsk", function() {
  socket.emit('checkSyncGet', {
    videoId: player.getVideoData().video_id,
    time: player.getCurrentTime(),
    clientName: window.clientName,
  });
})

socket.on("checkSyncResults", function(syncedClients) {
  updateClientsData(syncedClients);

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



window.checkSync = function () {
  console.log("Let's ask the server for sync data");
  socket.emit('checkSync', {
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

window.secondsToClock = function (sec) {
  let sec_num = parseInt(sec, 10); // don't forget the second param
  let hours   = Math.floor(sec_num / 3600);
  let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
  let seconds = sec_num - (hours * 3600) - (minutes * 60);

  if (hours   < 10) {hours   = "0"+hours;}
  if (minutes < 10) {minutes = "0"+minutes;}
  if (seconds < 10) {seconds = "0"+seconds;}
  if (hours > 0) {
    return hours+':'+minutes+':'+seconds;
  } else {
    return +minutes+':'+seconds;
  }
}

/*

window.updateTime = function (seconds) {
  $("#personalTime").text(secondsToClock(seconds))
}

window.pauseTime = function (refreshData) {
  if (refreshData) {
    clientTimerSeconds = refreshData;
  }
  clientTimerStatus = timer_pause;
};

window.startTime = function (refreshData) {
  if (refreshData) {
    clientTimerSeconds = refreshData;
  }
  clientTimerStatus = timer_playing;

};

*/

/*
setInterval(function(){
  if (clientTimerStatus == timer_playing) {
    console.log("click");
    clientTimerSeconds++;
    $("#personalTime").text(secondsToClock(clientTimerSeconds))
  }
}, 1000);
*/

