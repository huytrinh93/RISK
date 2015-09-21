var io = require('socket.io');
var express = require('express');
var app = express.createServer();

app.configure(function (){
	app.use(express.cookieParser());
	app.use(express.session({secret: 'secret', key: 'express.sid'}));
	app.use(function (req, res){
		res.end('<h2>Hello, your session id is ' + req.sessionID + '<h2>');
	});
});

app.listen(1337);
var sio = io.listen(app);
/*$("go").click(function(){
  socket.post("/game/addTerritory", userID, troops, regionID);
}, function(res, info{
  $("region.id.owner").find("army count").text(resp.value)
});
});*/
