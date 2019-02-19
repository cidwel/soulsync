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
  window.socket.emit('clientReady', {
    clientName: window.clientName
  });

}


// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
function onPlayerStateChange(event) {

  let currentTime = player.getCurrentTime();

  if (event.data == YT.PlayerState.PLAYING) {

    debugger;
    console.log("Oh! Seems the seekbar changed!");
    window.socket.emit('videoSeekChanged', {
      clientName: window.clientName,
      time: currentTime,
      videoId: player.getVideoData().video_id,
    });

    player.playVideo();

    // setTimeout(stopVideo, 6000);
  } else if (event.data == YT.PlayerState.PAUSED) {
    window.socket.emit('videoPaused', {
      clientName: window.clientName,
      time: currentTime,
      videoId: player.getVideoData().video_id,
    });

  }
}
function stopVideo() {
  player.stopVideo();
}


function seekVideo() {
  player.seekTo(100, true)
  console.log("jeje");

}

function loadVideo(id, second = 0, mode = '') {
  console.log(Math.trunc(player.getCurrentTime()) + " ---- " + Math.trunc(second) )

  if (player.getVideoData().video_id == id && +Math.trunc(second) == +Math.trunc(player.getCurrentTime())) {
    if (mode !== "pause") {
      player.playVideo();
      console.log("Totally synced! loadvideo aborted");
      return;
    }
  }

  if (player.getVideoData().video_id === id) {
    console.log('Just seek to the second of the video');
    player.seekTo(second, true);
  } else {
    player.loadVideoById(
      {
        'videoId': id,
        'startSeconds': second
      }
    );
  }

  if (mode === "pause") {
    console.log("Let's pause the video")
    // player.pauseVideo();
  }


}

