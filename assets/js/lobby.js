$(document).ready(function() {
  var isFull = $('#isFull').text();
  console.log('Is Full: '+isFull);

  if (isFull == 'true') {
    console.log('Start Game');
    var gameID = parseInt($('#gameID').text());
    io.socket.post("/game/start", {gameID: gameID}, function (data, jwres) {
      console.log(data);
      window.location.href = 'http://'+window.location.host+'/game?gameID='+gameID;
    });
  }
});

io.socket.on('connect', function socketConnected() {
  var gameID = parseInt($('#gameID').text());
  console.log(gameID);

  io.socket.get("/games/"+gameID, function(resData, jwres) {
    console.log(resData);
    resData.players.forEach(function (player, index, array) {
      console.log(player);
      addPlayerToView(player.id, player.name);
      //$('#rightGL').append('<p id="player'+player.id+'">'+player.name+'</p>');
    });
  });

  io.socket.on('games', function playerJoinedGame(message) {
    console.log(message);
    if (message.data.status == 'add') {
      io.socket.get("/user/"+message.data.playerID, function(resData, jwres) {
        //console.log(resData);
        addPlayerToView(resData.id, resData.name);
      });
    }
    else if (message.data.update == 'inProgress' && message.data.status == 'true') {
      window.location.href = 'http://'+window.location.host+'/game?gameID='+gameID;
    }
  });

});

function addPlayerToView(id, name) {
  $('#rightGL').append('<p id="player'+id+'">'+name+'</p>');
}
