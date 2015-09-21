io.socket.on('connect', function socketConnected() {

	io.socket.get("/games", function(resData, jwres) {
		userID = parseInt($('#userID').text());
		console.log(resData);
		for (i = 0; i < resData.length; i++) {
			//console.log('hi');
			if (resData[i].inProgress == false){
				var flag = false;
				for(j = 0; j < resData[i].players.length; j++) {
					if(resData[i].players[j].id == userID) {
						//Player Is Part Of Game
						var isItYourTurn = false;
						flag = true;
					}
				}
				if (flag == true) {
					createCurrentRow(resData[i].id, resData[i].name, resData[i].round, isItYourTurn);
				}
				else {
					createJoinRow(resData[i].id, resData[i].name, resData[i].players.length, resData[i].numPlayers, false);
				}
			}
			else if(resData[i].inProgress == true){
				for(j = 0; j < resData[i].players.length; j++) {
					if(resData[i].players[j].id == userID) {
						//Player Is Part Of Game
						var isItYourTurn = false;
						if (userID == resData[i].currentUserTurn) {
							isItYourTurn = true;
						}
						createCurrentRow(resData[i].id, resData[i].name, resData[i].round, isItYourTurn);
					}
				}
			}
		}
	});

	io.socket.on('games', function notificationRecievedFromServer(message) {
		console.log(message);
		if (message.verb == "created") {
			console.log('Game Created');
			createJoinRow(message.data.id, message.data.name, 1, message.data.numPlayers, false);
		}
		else if (message.verb == "updated") {
			if (message.data.update == "player") {
				if (message.data.status == "add") {
					console.log("Player Added To Game "+message.data.id);
					updatePlayersJoinRow(message.data.id, message.data.currentPlayers, message.data.numPlayers);
				}
			}
			else if (message.data.update == "inProgress") {
				removeJoinRow(message.data.id);
			}
		}
	});


});


$(document).ready(function(){

    $("#JoinGame").click(function(){
 		$("#joinTable").removeClass("hidden");
 		$("#currentTable").addClass("hidden");
    });

    $("#CurrentGames").click(function(){
 		$("#currentTable").removeClass("hidden");
 		$("#joinTable").addClass("hidden");
    });

  $('.joinGame').click(function() {
		//console.log('harro');
		//console.log(this);
		//console.log(this.getAttribute("value"));
		console.log($('#userID').text());

		var gameID = this.getAttribute("value");
		var playerID = parseInt($('#userID').text());
		var playerName = $('#userName').text();
		var password = '';

		var postData = {
			gameID: gameID,
			playerID: playerID,
			password: password
		}

		console.log(postData);


		io.socket.post("/game/join", postData, function (data, jwres) {
			console.log('Posted');
			console.log(data);
			if (data.join == true) {
				window.location.href = 'http://'+window.location.host+'/game?gameID='+gameID;
			}
		});
	});


});

function createJoinRow(gameID, name, currentPlayers, numPlayers, privateStatus){
	$('<tr id="jg'+gameID+'"><td>'+gameID+'</td><td>'+name+'</td><td id="jg'+gameID+'players">'+currentPlayers+'/'+numPlayers+'</td><td>'+privateStatus+'</td><td><a onClick="joinGame('+gameID+');" class="joinGame btn btn-primary center-block" id="jg'+gameID+'JoinBtn" value="'+gameID+'">Join</a></td></tr>').appendTo('#joinTableTbody');
}

function createCurrentRow(gameID, name, round, currentUserTurn){
	$('<tr id="cg'+gameID+'"><td>'+gameID+'</td><td>'+name+'</td><td>'+round+'</td><td>'+currentUserTurn+'</td><td><a class="btn btn-primary center-block" href="/game?gameID='+gameID+'">Play</a></td></tr>').appendTo('#currentTableTbody');
}

function joinGame(gameID) {
		//console.log('harro');
		//console.log(this);
		//console.log(this.getAttribute("value"));
		console.log($('#userID').text());

		//gameID = parseInt(gameID);
		var playerID = parseInt($('#userID').text());
		var playerName = $('#userName').text();
		var password = '';

		var postData = {
			gameID: gameID,
			playerID: playerID,
			password: password
		}

		console.log(postData);


		io.socket.post("/game/join", postData, function (data, jwres) {
			console.log('Posted');
			console.log(data);
			if (data.join == true) {
				window.location.href = 'http://'+window.location.host+'/game?gameID='+gameID;
			}
		});
}

function removeJoinRow(id) {
	$('#jg'+id).remove();
}

function updatePlayersJoinRow(id, currentPlayers, numPlayers) {
	$('#jg'+id+'players').text(currentPlayers+'/'+numPlayers);
}
