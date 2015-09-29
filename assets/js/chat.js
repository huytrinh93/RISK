//create chat form
$('#chatForm').submit(function(e){
	e.preventDefault();
	//make input
	var msg =  $('#chatInput').val();
	var gameID = parseInt($('#gameID').text());
	//create socket.io and posting chat to server
	io.socket.post("/game/chat", {gameID: gameID, message: msg}, function (data, jwres) {
		console.log(data);
	});
	//socket.emit('chat message', $('#m').val());
	$('#chatInput').val('');
	return false;
});
//connect socket.io
io.socket.on('connect', function socketConnected() {

	io.socket.on('games', function chatMessage(message) {
		if (message.data.update == 'chat' && message.data.status == 'message') {
			var msg = message.data.message;
			$('#chatGL').append('<p>'+msg+'</p>');
			$("#chatGL").scrollTop($("#chatGL")[0].scrollHeight);
		}
	});
//end of update chat
});
