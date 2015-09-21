var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);


app.all('*', function(req, res){
	res.render('real_time.ejs');	
//res.sendFile(__dirname + '/../../views/real_time.ejs');
});


io.on('connection', function(socket){
      	socket.on('chat message', function(msg){
		io.emit('chat message', msg);
	});
});

http.listen(1337, function(){
        console.log('listening on *:1337');
});
