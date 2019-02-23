// 2. This code loads the IFrame Player API code asynchronously.
const tag = document.createElement('script');

tag.src = 'https://www.youtube.com/iframe_api';
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);


// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
let player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    videoId: '2m7XrMtOey8',
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
  });
}


// 4. The API  will call this function when the video player is ready.
function onPlayerReady(event) {
  console.log("Yay! I'm ready, let's notify master!");
  window.socket.emit('clientReady', window.getStatus());
  $('#connectedTotal').text('No one is here!');
  $('#connectedClients').hide();
}


// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
function onPlayerStateChange(event) {
  triggeredEvents.unshift(event.data);
  triggeredEvents = triggeredEvents.slice(0, 10);

  const currentTime = player.getCurrentTime();

  console.log(ytStatus[event.data]);

  if (triggeredEvents[0] === YT.PlayerState.PLAYING
    && triggeredEvents[1] === YT.PlayerState.BUFFERING
    && triggeredEvents[2] === YT.PlayerState.PAUSED) {
    console.log('SEEKBAR CHANGED??');
    window.socket.emit('videoSeekChanged', window.getStatus());
  }


  if (event.data === YT.PlayerState.PLAYING) {
    refreshStatusSpam = false;
    window.addToHistory(window.getStatus());

    console.log('The player state changed to PLAYING!');

    player.playVideo();
    window.socket.emit('clientPlayingVideo', window.getStatus());
    // window.startTime(currentTime);
    // setTimeout(stopVideo, 6000);
  } else if (event.data === YT.PlayerState.PAUSED && !refreshStatusSpam) {
    // window.socket.emit('videoPaused', window.getStatus());
    // window.pauseTime(currentTime);
  } else if (event.data === YT.PlayerState.BUFFERING && !refreshStatusSpam) {
    refreshStatusSpam = true;
    window.socket.emit('clientBuffering', window.getStatus());
  } else if (event.data === YT.PlayerState.ENDED) {
    window.socket.emit('clientBuffering', window.getStatus());
  }


  /*
  if ([YT.PlayerState.PLAYING,
    YT.PlayerState.BUFFERING,
    YT.PlayerState.PAUSED].includes(event.data)) {
    refreshStatusSpam = false;
  }
  */


  // window.checkSync(); // esto provoca mazo de spam
  // window.updateTime(currentTime);
}
function stopVideo() {
  player.stopVideo();
}


function seekVideo() {
  player.seekTo(100, true);
  console.log('jeje');
}


function loadVideo(videoId, time = 0, mode = '') {
  console.log(`${Math.trunc(player.getCurrentTime())} ---- ${Math.trunc(time)}`);

  if (player.getVideoData().video_id === videoId && +Math.trunc(time) === +Math.trunc(player.getCurrentTime())) {
    if (mode !== 'pause') {
      player.playVideo();
      console.log('Totally synced! loadvideo aborted');
      return;
    }
  }

  if (player.getVideoData().video_id === videoId) {
    console.log('Just seek to the second of the video');
    player.seekTo(time, true);
    player.playVideo();
  } else {
    player.loadVideoById(
      {
        videoId,
        startSeconds: time,
      },
    );
    if (typeof time === 'number') {
      setTimeout(() => {
        player.seekTo(+time + 1);
      }, 1*500);
    }
  }

  if (mode === 'pause') {
    console.log("Let's pause the video");
    // player.pauseVideo();
  }
}
