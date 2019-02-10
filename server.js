
var express = require('express');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');

var app = express();

var publicDir = path.join(__dirname, 'public');

app.set('port', process.env.PORT || 3000);
// app.use(logger('dev'))
app.use(bodyParser.json()) // Parses json, multi-part (file), url-encoded
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.sendFile(path.join(publicDir, 'index.html'))
})

var server = http.createServer(app);
var io = require('socket.io')(server);


server.listen(app.get('port'), function () {
  console.log('Web server listening on port ' + app.get('port'))
})

io.on('connection', function (socket) {

  var total=io.engine.clientsCount;

  console.log("Client connected!! " + total + " client(s) online");



  setTimeout(
    function() {
      // socket.emit('playVideo', { id: 'KG5gniA23Wk', second: 100});
    }, 3000);


  socket.on('my other event', function (data) {
    console.log(data);
  });

  socket.on('playVideo',function(videoData){
    const {id, second} = videoData;
    console.log('Client send play video. Broadcasting!!');
    // socket.broadcast.emit('playVideo', { id, second }); // < not for sender
    io.emit('playVideo', { id, second });
  });

});

