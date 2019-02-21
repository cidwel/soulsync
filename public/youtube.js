// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);


// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    videoId: '2m7XrMtOey8',
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}


//4. The API  will call this function when the video player is ready.
function onPlayerReady (event)  {
  console.log("Yay! I'm ready, let's notify master!");
  window.socket.emit('clientReady', window.getStatus());

}


// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
function onPlayerStateChange(event) {

  let currentTime = player.getCurrentTime();

  if (event.data == YT.PlayerState.PLAYING) {

    console.log("Oh! Seems the seekbar changed!");
    window.socket.emit('videoSeekChanged', window.getStatus());

    player.playVideo();
    // window.startTime(currentTime);

    // setTimeout(stopVideo, 6000);
  } else if (event.data == YT.PlayerState.PAUSED) {
    window.socket.emit('videoPaused', window.getStatus());

    // window.pauseTime(currentTime);

  } else if (YT.PlayerState.BUFFERING) {
    window.socket.emit('clientBuffering', window.getStatus());
  }
  window.checkSync();
  // window.updateTime(currentTime);

}
function stopVideo() {
  player.stopVideo();
}


function seekVideo() {
  player.seekTo(100, true)
  console.log("jeje");

}



function loadVideo(videoId, time = 0, mode = '') {
  console.log(Math.trunc(player.getCurrentTime()) + " ---- " + Math.trunc(time) )

  if (player.getVideoData().video_id == videoId && +Math.trunc(time) == +Math.trunc(player.getCurrentTime())) {
    if (mode !== "pause") {
      player.playVideo();
      console.log("Totally synced! loadvideo aborted");
      return;
    }
  }

  if (player.getVideoData().video_id === videoId) {
    console.log('Just seek to the second of the video');
    player.seekTo(time, true);
  } else {
    player.loadVideoById(
      {
        'videoId': videoId,
        'startSeconds': time
      }
    );
  }

  if (mode === "pause") {
    console.log("Let's pause the video")
    // player.pauseVideo();
  }


}


