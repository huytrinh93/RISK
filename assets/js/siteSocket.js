io.socket.on('connect', function socketConnected(){

	console.log("This is from the connect: ", this.socket.sessionid);

});

io.socket.on("/games", function(resData, jwres){

		console.log(resData);

});
