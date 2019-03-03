/* global window, Audio */

const getYoutubeId = require('get-youtube-id');

const generateRandomAnimalName = require('random-animal-name-generator');
const youtubeThumbnail = require('youtube-thumbnail');
const Cookies = require('js-cookie');

const tippy = require('tippy.js');


const chime = new Audio('chime.wav');
chime.volume = 0.02;


window.socket = io();
const cookieClientName = Cookies.get('clientName');
const cookieClientId = Cookies.get('clientId');
window.clientName = cookieClientName || generateRandomAnimalName();
window.clientId = cookieClientId || Cookies.set('clientId', uuidv4());
window.room = window.location.search.split('?')[1];

const urlParams = new URLSearchParams(window.location.search);
const myParam = urlParams.get('myParam');

timer_pause = 0;
timer_playing = 1;

window.clientTimer = null;
window.clientTimerStatus = timer_pause;
window.clientTimerSeconds = 0;

window.videoHistory = [];
window.serverPlaylist = [];
window.favedData = [];
window.refreshStatusSpam = false;
window.showAllFavs = false;
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
  $('.playVideoData').html(`
    <ul>
        <li>time: ${Math.trunc(videoData.time)}</li>
        <li>playOnly: ${videoData.playOnlyFor || ''}</li>
        <li>playNot: ${videoData.playNotFor || ''}</li>
        <li>mode: ${videoData.mode || ''}</li>
    </ul>
  `);


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

  clientsData.sort((a, b) => ((a.clientName > b.clientName) ? 1 : ((b.clientName > a.clientName) ? -1 : 0)));

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
      $('#syncMeter').html('<span class="unsynced">Not synced <button class="btn btn-small" onClick="syncVideo()">Sync now</button></span>');
    }

    $('#connectedClients').show();
    $('#connectedTotal').html(`Room: ${window.room} - Connected users (${clientsData.length}):<br>`);
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
    }, requestedData.goSync);
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
  if (data) {
    if (data.favedData) {
      window.favedData = data.favedData;
      changeFavData();
      window.refillFavedData(data.serverPlaylist);
    }
    if (data.serverPlaylist) {
      window.serverPlaylist = data.serverPlaylist;
    }
  }

  refreshList(data.serverPlaylist, $('.serverPlaylist'));
  refreshList(window.favedData, $('.favs'));


  if (goSyncVideoClientId && data.connectedClients.length > 1 && goSyncVideoClientId === window.clientId) {
    const allWerePlaying = data.connectedClients.filter(x => x.status === YT_STATUS_PLAYING).length === data.connectedClients.length - 1;
    const clientsWerePlayingSameVideo = data.connectedClients.filter(x => x.clientId !== window.clientId).map(x => x.videoId).length === data.connectedClients.length - 1;

    if (allWerePlaying && clientsWerePlayingSameVideo) {
      const videoIdWatching = data.connectedClients.filter(x => x.clientId !== window.clientId).map(x => x.videoId)[0];
      const maxTime = Math.max(...data.connectedClients.filter(x => x.clientId !== window.clientId).map(x => x.time));
      window.loadVideo(videoIdWatching, maxTime);
      log('all clients were playing so... sync video');
      // window.syncVideo();
    } else {
      log('At least one client is not playing so.. no sync');
    }
  }
});

socket.on('playlistUpdated', (receivedServerPlaylist, favedData) => {
  console.log('playlist updated!');
  window.favedData = favedData; // update it
  window.refillFavedData(receivedServerPlaylist);
  changeFavData();
  window.serverPlaylist = receivedServerPlaylist;
  refreshList(receivedServerPlaylist, $('.serverPlaylist'));
  refreshList(favedData, $('.favs'));
});

socket.on('newClient', (newClient) => {
  if (newClient.clientId !== window.clientId) {
    chime.play();
  }
});

function sendVideoStatusToServer(videoData, goSync) {
  socket.emit('sendVideoStatusToServer', videoData, goSync);
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


const changeFavData = () => {
  const currentVideo = window.getStatus();
  const favedVideo = window.favedData.find(x => x.videoId === currentVideo.videoId);
  const favedByUser = favedVideo && favedVideo.favedBy && favedVideo.favedBy.find(x => x === window.clientId);
  $('#favStar').removeClass('fas');
  $('#favStar').removeClass('far');
  if (favedByUser) {
    $('#favStar').addClass('fas');
  } else {
    $('#favStar').addClass('far');
  }
};


function refreshList(dataList, $dom, reverse = false) {
  const videoHistoryCopy = (reverse) ? dataList.slice(0).reverse() : dataList.slice(0);


  if (videoHistoryCopy.length) {

    const videoList = videoHistoryCopy.reduce((old, curr, index) => {
      if ($dom.selector === '.favs' && !window.showAllFavs && !curr.favedBy.includes(window.clientId)) {
        return old;
      }

      const favedVideo = window.favedData.find(x => x.videoId === curr.videoId);
      const favedByUser = favedVideo && favedVideo.favedBy && favedVideo.favedBy.find(x => x === window.clientId);
      const favedByUserText = (favedByUser) ? 'fas' : 'far';

      const dequeueVideoEl = ($dom.selector === '.serverPlaylist') ? `<i onClick="event.stopPropagation(); window.dequeueVideoByIndex(${index})" class="fa fa-times"/>` : '';

      const base64title = window.btoa(unescape(encodeURIComponent(curr.title)));
      const favElement = ($dom.selector !== '.localHistory') ? `<i data-tippy-content="Added!" onClick="event.stopPropagation(); window.handleFavVideo('${curr.videoId}', '${curr.url}', '${base64title}', ${curr.duration})" class="${favedByUserText} fa-star"/>` : '';


      const addToPlaylistEl = ($dom.selector !== '.serverPlaylist') ? `<i class="smallButton addToQueueFromPlaylist fa fa-plus" onClick="event.stopPropagation(); window.queueVideoByUrl('${curr.url}')(this)" />` : '';


      return `${old}
      <li videoId="${curr.videoId}" onClick={broadcastVideo("${curr.videoId}",0)}>
        <div ><img class="thumbnail" src="${curr.thumbnail.default.url}"/></div>
        <div class="thumbTextWrapper">
            ${curr.title}<br><span class="duration">${secondsToClock(curr.duration)}</span>
            <span class="videoCommands">${favElement}${dequeueVideoEl}${addToPlaylistEl}</span>
        </div>
      </li>
    `;
    }, '');

    $dom.html(`<ul>${videoList}</ul>`);
    debugger;
    tippy('.smallButton', {
      content: 'Added!',
      trigger: 'click',
      arrow: true,
      arrowType: 'sharp',
      placement: 'bottom',
      theme: 'light',

    });
  } else {
    $dom.html(`<div class="noVideosWrapper">No videos on list</div>`);
  }

}

window.playNextVideo = () => {
  socket.emit('playVideo', { ...status, ...window.serverPlaylist[0] });
};


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
    room: window.room,
  };
};

window.refillFavedData = (videoList) => {
  window.favedData.forEach((favedVideo) => {
    const foundVideo = videoList.find(x => x.videoId === favedVideo.videoId);
    if (foundVideo) {
      favedVideo.thumbnail = foundVideo.thumbnail;
      favedVideo.title = foundVideo.title;
      favedVideo.duration = foundVideo.duration;
      favedVideo.url = foundVideo.url;
    } else {
      favedVideo.thumbnail = youtubeThumbnail(favedVideo.url);
    }
  });
};


window.broadcastVideo = function (videoId = null, time) {
  log('sending broadcast to server');

  const videoData = (videoId) ? { videoId, time: 0 } : getVideoUrlData();
  const status = getStatus();
  if (status && status.videoId === videoData.videoId) {
    // just play at the same second
    videoData.time = status.time;
  }

  if (typeof time === 'number') {
    videoData.time = time;
  }
  socket.emit('playVideo', { ...status, ...videoData });
};

window.queueVideoTest = function () {
  queueVideo(getVideoUrlData('https://youtu.be/h8xbjpArhuw'));
  queueVideo(getVideoUrlData('https://www.youtube.com/watch?v=hWIQe9MAa9g'));
  queueVideo(getVideoUrlData('https://youtu.be/NspYa8GcPCs'));
  queueVideo(getVideoUrlData('https://youtu.be/by1QWQprONg'));
};

window.queueVideoByUrl = url => (context) => {
  debugger;
  const videoData = getVideoUrlData(url);
  window.queueVideo(videoData);
};


window.queueVideo = function (videoData) {
  const data = videoData || getVideoUrlData();
  log('sending video to queue to server');
  data.requestedBy = window.clientId;
  socket.emit('queueVideo', data);
};

window.dequeueVideoByIndex = (index) => {
  const videoData = window.serverPlaylist[index];
  videoData.clientId = window.clientId;
  videoData.clientName = window.clientName;
  window.socket.emit('dequeueVideo', videoData, index);
};

window.syncVideo = function () {
  log("Let's ask server for the updated time!");

  socket.emit('askRunningVideoData', {
    clientName: window.clientName,
    clientId: window.clientId,
    goSync: true,
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


window.log = (string) => {
  console.log(`[${window.clientName}] ${string}`);
};

window.favVideo = () => {
  debugger;
  const currentVideo = window.getStatus();
  const {
    videoId,
    url,
    duration,
    title,
  } = currentVideo;
  const b64title = window.btoa(unescape(encodeURIComponent(title)));
  window.handleFavVideo(videoId, url, b64title, duration);
};

window.handleFavVideo = (videoId, url, b64title, duration) => {
  const title = decodeURIComponent(escape(window.atob(b64title)));

  const videoData = {
    videoId,
    room: window.room,
    clientId: window.clientId,
    url,
    title,
    duration,
  };
  socket.emit('toggleFavVideo', videoData);
};


/*

window.updateTime = function (seconds) {
  $("#personalTime").text(secondsToClock(se7conds))
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


window.changeTab = function (list) {
  $('.serverPlaylist').hide();
  $('.serverHistory').hide();
  $('.localHistory').hide();
  $('.favList').hide();

  $('#serverPlaylist').parent().removeClass('active');
  $('#serverHistory').parent().removeClass('active');
  $('#localHistory').parent().removeClass('active');
  $('#favList').parent().removeClass('active');

  $(`.${list}`).show();
  $(`#${list}`).parent().addClass('active');
};


window.changeFavVisibility = () => {
  window.showAllFavs = !window.showAllFavs;
  refreshList(window.favedData, $('.favs'));
};
