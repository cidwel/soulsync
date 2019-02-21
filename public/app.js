let getYoutubeId = require('get-youtube-id');

const generateRandomAnimalName = require('random-animal-name-generator');
window.socket = io();
window.clientName = generateRandomAnimalName();
window.clientId = uuidv4();


timer_pause = 0;
timer_playing = 1;

window.clientTimer = null;
window.clientTimerStatus = timer_pause;
window.clientTimerSeconds = 0;


/*
-1 - unstarted (sin empezar)
0 - ended (terminado)
1 - playing (en reproducción)
2 - paused (en pausa)
3 - buffering (almacenando en búfer)
5 - video cued (video en fila)
*/

const YT_STATUS_UNSTARTED = -1;
const YT_STATUS_ENDED = 0;
const YT_STATUS_PLAYING = 1;
const YT_STATUS_PAUSED = 2;
const YT_STATUS_BUFFERING = 3;
const YT_STATUS_CUED = 5;

const ytStatus = [];
ytStatus[-1] = "Unstarted";
ytStatus[0] = "Ended";
ytStatus[1] = "Playing";
ytStatus[2] = "Paused";
ytStatus[3] = "Buffering";
ytStatus[4] = "Unknown";
ytStatus[5] = "Cued";




$("#clientName").text(window.clientName);

socket.on('playVideo', function(videoData){
  const {playOnlyFor, playNotFor, mode} = videoData;

  if (playNotFor && window.clientId === playNotFor) {
    return; // early return!
  }

  let send = false;
  if (playOnlyFor) {
    if (playOnlyFor === window.clientId) {
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
    let {videoId, time} = videoData;
    loadVideo(videoId, time, mode);
    $('#addLink').val(`https://www.youtube.com/watch?v=${videoId}&t=${Math.trunc(time)}`)
  }
});


function updateClientsData(clientsData) {

  console.log("Received a new client list... let's update it");

  let allSameVideo = clientsData.map(x => x.videoId).every( (val, i, arr) => val === arr[0] );
  let allSameTime = clientsData.map(x => x.time).every( (val, i, arr) => Math.abs(Math.trunc(val) - Math.trunc(arr[0])) < 2 );

  clientsData.sort((a,b) => (a.clientName > b.clientName) ? 1 : ((b.clientName > a.clientName) ? -1 : 0));

  const clients = clientsData.reduce((old, curr) => {
    const allSameVideoCaption = (!allSameVideo) ? `: ${curr.title}` : '';
    const personalTimeText = (curr.clientName === window.clientName) ? 'personalTime' : '';
    const clock = `[<span id="${personalTimeText}">${secondsToClock(curr.time)}</span>]`;

    let clockText = (!allSameTime) ? clock : '';

    const youText = (curr.clientName === window.clientName) ? '(You) ' : '';
    const youClass = (curr.clientName === window.clientName) ? 'currentUser' : '';

    const statusText = (curr.status !== YT_STATUS_PLAYING) ? `<span class=status status_${curr.status}">[${ytStatus[curr.status]}]</span> - ` : '';

    return old + `<li class="${youClass}">${statusText}${youText}${curr.clientName}${allSameVideoCaption} ${clockText}</li>`;
  }, "");
  $("#syncMeter").html('');

  if (clientsData.length > 1) {
    $(".clientNameWrapper").hide();

    debugger;
    if (allSameVideo && allSameTime) {
      $("#syncMeter").html(`<span class="synced">Synced</span>`)
    } else {
      $("#syncMeter").html(`<span class="unsynced">Not synced</span>`)
    }

    $("#connectedClients").show();
    $("#connectedTotal").html(`Connected users (${clientsData.length}):<br>`)
    $("#connectedClients").html(`<ul>${clients}</ul>`);
  } else {
    $(".clientNameWrapper").show();

    $("#connectedTotal").text(`No one is here!`)
    $("#connectedClients").hide();
  }
}

socket.on("getVideoStatus", function(requestedData) {
  if (window.clientId !== requestedData.clientId) {
    sendVideoStatusToServer({
      ...getStatus(),
      requestedBy: requestedData.clientId,
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
  socket.emit('checkSyncGet', getStatus());
})

socket.on("updateClientResults", function(syncedClients) {
  updateClientsData(syncedClients);

})

function sendVideoStatusToServer(videoData) {
  socket.emit('sendVideoStatusToServer', videoData);
}

function getVideoUrlData() {

  // let videoTest = 'https://www.youtube.com/watch?v=TdBSoy9F9NA&t=2091s';
  let videoTest = $('#addLink').val()
  let id = getYoutubeId(videoTest)
  const urlParams = new URLSearchParams(videoTest.split('?')[1]);
  return {
    videoId: id,
    time: +(urlParams.get('t') && urlParams.get('t').replace('s','')) || 0,
  };
}

window.getStatus = function () {
  const videoData = player && player.getVideoData();
  return {
    clientId: window.clientId,
    clientName: window.clientName,
    videoId: videoData && videoData.video_id || null,
    time: player.getCurrentTime(),
    title: videoData && videoData.title || null,
    status: player.getPlayerState(),
  }
}



window.broadcastVideo = function () {
  console.log("sending broadcast to server");
  socket.emit('playVideo', getVideoUrlData());
}

window.syncVideo = function () {
  console.log("Let's ask server for the updated time!");

  socket.emit('askRunningVideoData', {
    clientName: window.clientName,
    clientId: window.clientId,
  });
};

window.checkSync = function () {
  console.log("Let's ask the server for sync data");
  socket.emit('checkSync', {
    clientName: window.clientName,
  });
};

window.pauseVideo = function () {
  console.log("Let's send a pause event through the server!!");
  socket.emit('videoPausedGlobal', {
    clientName: window.clientName,
  });
};

window.continueVideo = function () {
  console.log("Let's send a continue event through the server!!");
  socket.emit('videoContinueGlobal', {
    clientName: window.clientName,
  });
};

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


function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
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

