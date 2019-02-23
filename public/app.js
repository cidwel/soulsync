const getYoutubeId = require('get-youtube-id');

const generateRandomAnimalName = require('random-animal-name-generator');
const youtubeThumbnail = require('youtube-thumbnail');
const Cookies = require('js-cookie');

const chime = new Audio('chime.wav');
chime.volume = 0.02;


window.socket = io();
const cookieClientName = Cookies.get('clientName');
window.clientName = cookieClientName || generateRandomAnimalName();
window.clientId = uuidv4();


timer_pause = 0;
timer_playing = 1;

window.clientTimer = null;
window.clientTimerStatus = timer_pause;
window.clientTimerSeconds = 0;

window.videoHistory = [];
window.refreshStatusSpam = false;

window.triggeredEvents = [];


// debug


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

window.ytStatus = [];
ytStatus[-1] = 'Paused';
ytStatus[0] = 'Ended';
ytStatus[1] = 'Playing';
ytStatus[2] = 'Paused';
ytStatus[3] = 'Buffering';
ytStatus[4] = 'Unknown';
ytStatus[5] = 'Paused'; // is cued!


if (!cookieClientName) {
  const selectedCookieName = prompt('Please enter your name', window.clientName);
  if (selectedCookieName !== window.clientName) {
    const oldName = window.clientName;
    window.clientName = selectedCookieName;
    Cookies.set('clientName', selectedCookieName);
    socket.emit('changeClientName', {
      clientId: window.clientId,
      clientNewName: selectedCookieName,
      clientName: oldName,
    });
  }
}


$('#clientName').text(window.clientName);

socket.on('playVideo', (videoData) => {
  const { playOnlyFor, playNotFor, mode } = videoData;

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
    if (mode == 'pause') {
      log('Server requested to pause video');
    } else {
      log('Server requested to play video');
    }
    const { videoId, time } = videoData;
    loadVideo(videoId, time, mode);
    $('#addLink').val(`https://www.youtube.com/watch?v=${videoId}&t=${Math.trunc(time)}`);
  }
});


function updateClientsData(clientsData) {
  log("Received a new client list... let's update it");

  const allSameVideo = clientsData.map(x => x.videoId).every((val, i, arr) => val === arr[0]);
  const allSameTime = clientsData.map(x => x.time).every((val, i, arr) => Math.abs(Math.trunc(val) - Math.trunc(arr[0])) < 2);

  clientsData.sort((a, b) => ((a.clientId > b.clientId) ? 1 : ((b.clientId > a.clientId) ? -1 : 0)));

  const clients = clientsData.reduce((old, curr) => {
    const allSameVideoCaption = (!allSameVideo) ? `: ${curr.title}` : '';
    const personalTimeText = (curr.clientId === window.clientId) ? 'personalTime' : '';
    const clock = `[<span id="${personalTimeText}">${secondsToClock(curr.time)}</span>]`;

    const clockText = (!allSameTime) ? clock : '';

    const youText = (curr.clientId === window.clientId) ? '(You) ' : '';
    const youClass = (curr.clientId === window.clientId) ? 'currentUser' : '';

    const statusText = (curr.status !== YT_STATUS_PLAYING) ? `<span class=status status_${curr.status}">[${ytStatus[curr.status]}]</span> - ` : '';

    return `${old}<li class="${youClass}">${statusText}${youText}${curr.clientName}${allSameVideoCaption} ${clockText}</li>`;
  }, '');
  $('#syncMeter').html('');

  if (clientsData.length > 1) {
    $('.clientNameWrapper').hide();

    if (allSameVideo && allSameTime) {
      $('#syncMeter').html('<span class="synced">Synced</span>');
    } else {
      $('#syncMeter').html('<span class="unsynced">Not synced</span>');
    }

    $('#connectedClients').show();
    $('#connectedTotal').html(`Connected users (${clientsData.length}):<br>`);
    $('#connectedClients').html(`<ul>${clients}</ul>`);
  } else {
    $('.clientNameWrapper').show();
    $('#connectedTotal').text('No one is here!');
    $('#connectedClients').hide();
  }
}

socket.on('getVideoStatus', (requestedData) => {
  if (window.clientId !== requestedData.clientId) {
    sendVideoStatusToServer({
      ...getStatus(),
      requestedBy: requestedData.clientId,
    });
  }
});

socket.on('pauseVideo', () => {
  player.pauseVideo();
});

socket.on('continueVideo', () => {
  player.playVideo();
});

socket.on('checkSyncAsk', () => {
  socket.emit('checkSyncGet', getStatus());
});

socket.on('updateClientResults', (data, goSyncVideoClientId) => {
  updateClientsData(data.connectedClients);
  refreshList(data.serverPlaylist, $('.serverPlaylist'));

  if (goSyncVideoClientId && data.connectedClients.length > 1 && goSyncVideoClientId === window.clientId) {
    const clientsPlayingVideo = data.connectedClients.filter(client => client.status === YT_STATUS_PLAYING).length;
    if (data.connectedClients.length - 1 === clientsPlayingVideo) {
      console.log('all clients were playing so... sync video');
      window.syncVideo();
    } else {
      console.log('At least one client is not playing so.. no sync');
    }
  }
});

socket.on('videoQueued', (serverPlaylist) => {
  refreshList(serverPlaylist, $('.serverPlaylist'));
});

socket.on('newClient', (newClient) => {
  if (newClient.clientId !== window.clientId) {
    chime.play();
  }
});

function sendVideoStatusToServer(videoData) {
  socket.emit('sendVideoStatusToServer', videoData);
}

function getVideoUrlData(url) {
  // let videoTest = 'https://www.youtube.com/watch?v=TdBSoy9F9NA&t=2091s';
  const videoUrl = url || $('#addLink').val();
  if (videoUrl) {
    const id = getYoutubeId(videoUrl);
    const urlParams = new URLSearchParams(videoUrl.split('?')[1]);
    return {
      ...getStatus(),
      videoId: id,
      time: +(urlParams.get('t') && urlParams.get('t').replace('s', '')) || 0,
    };
  }
  const status = getStatus();
  $('#addLink').val(status.url);
  return {
    ...status,
    videoId: status.videoId,
    time: status.time,
  };
}

function refreshList(dataList, $dom, reverse = false) {
  const videoHistoryCopy = (reverse) ? dataList.slice(0).reverse() : dataList.slice(0);
  const videoList = videoHistoryCopy.reduce((old, curr) => `${old}
      <li videoId="${curr.videoId}" onClick={broadcastVideo("${curr.videoId}")}>
        <div ><img class="thumbnail" src="${curr.thumbnail.default.url}"/></div>
        <div class="thumbTextWrapper">${curr.title}<br><span class="duration">${secondsToClock(curr.duration)}</span></div>
      </li>
    `, '');
  $dom.html(`<ul>${videoList}</ul>`);
}

window.getStatus = function () {
  const videoData = player && player.getVideoData();
  const videoUrl = player.getVideoUrl();
  return {
    clientId: window.clientId,
    clientName: window.clientName,
    videoId: videoData && videoData.video_id || null,
    time: player.getCurrentTime(),
    title: videoData && videoData.title || null,
    status: player.getPlayerState(),
    url: videoUrl,
    thumbnail: youtubeThumbnail(videoUrl),
    duration: player.getDuration(),
    socketId: window.socket.id,
  };
};


window.broadcastVideo = function (videoId = null) {
  log('sending broadcast to server');

  const videoData = (videoId) ? { videoId, time: 0 } : getVideoUrlData();
  const status = getStatus();
  if (status && status.videoId === videoData.videoId) {
    // just play at the same second
    videoData.time = status.time;
  }
  socket.emit('playVideo', videoData);
};

window.queueVideoTest = function () {

  queueVideo(getVideoUrlData('https://youtu.be/h8xbjpArhuw'));
  queueVideo(getVideoUrlData('https://www.youtube.com/watch?v=hWIQe9MAa9g'));
  queueVideo(getVideoUrlData('https://youtu.be/NspYa8GcPCs'));
  queueVideo(getVideoUrlData('https://youtu.be/by1QWQprONg'));

}

window.queueVideo = function (videoData) {
  log('sending video to queue to server');
  videoData.requestedBy = window.clientId;
  socket.emit('queueVideo', videoData);
};

window.syncVideo = function () {
  log("Let's ask server for the updated time!");

  socket.emit('askRunningVideoData', {
    clientName: window.clientName,
    clientId: window.clientId,
  });
};

window.checkSync = function () {
  log("Let's ask the server for sync data");
  socket.emit('checkSync', {
    clientName: window.clientName,
  });
};

window.pauseVideo = function () {
  log("Let's send a pause event through the server!!");
  const status = getStatus();
  $('#addLink').val(status.url);
  socket.emit('videoPausedGlobal', {
    clientName: window.clientName,
  });
};

window.continueVideo = function () {
  log("Let's send a continue event through the server!!");
  socket.emit('videoContinueGlobal', {
    clientName: window.clientName,
  });
};

window.secondsToClock = function (sec) {
  const sec_num = parseInt(sec, 10); // don't forget the second param
  let hours = Math.floor(sec_num / 3600);
  let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
  let seconds = sec_num - (hours * 3600) - (minutes * 60);

  if (hours < 10) { hours = `0${hours}`; }
  if (minutes < 10) { minutes = `0${minutes}`; }
  if (seconds < 10) { seconds = `0${seconds}`; }
  if (hours > 0) {
    return `${hours}:${minutes}:${seconds}`;
  }
  return `${+minutes}:${seconds}`;
};


window.addToHistory = function (playerStatus) {
  if (window.videoHistory.length === 0 || window.videoHistory[window.videoHistory.length - 1].videoId !== playerStatus.videoId) {
    window.videoHistory.push(playerStatus);
  }
  refreshList(window.videoHistory, $('.localHistory'), true);
};

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0; const
      v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}


function log(string) {
  console.log(`[${window.clientName}] ${string}`);
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
    log("click");
    clientTimerSeconds++;
    $("#personalTime").text(secondsToClock(clientTimerSeconds))
  }
}, 1000);
*/


window.changeTab = function(list) {
  $(".serverPlaylist").hide();
  $(".serverHistory").hide();
  $(".localHistory").hide();

  $("#serverPlaylist").parent().removeClass('active');
  $("#serverHistory").parent().removeClass('active');
  $("#localHistory").parent().removeClass('active');

  $(`.${list}`).show();
  $(`#${list}`).parent().addClass('active');

}
