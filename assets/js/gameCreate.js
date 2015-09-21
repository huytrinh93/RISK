$('#create-game').submit(function(e) {
  e.preventDefault();
  var gameName = $('#gameName').val();
  var password = $('#password').val();
  var numPlayers = parseInt($('#numPlayers').val());
  console.log(gameName+' '+password+' '+numPlayers);
  console.log('Submitted Form');

  var postData = {
    gameName: gameName,
    password: password,
    numPlayers: numPlayers
  }

  io.socket.post("/game/create", postData, function (data, jwres) {

    /*console.log('Posted');
    console.log(data);*/

    if (data.create == true) {
      window.location.href = 'http://'+window.location.host+'/game?gameID='+data.id;
    }
  });

});
