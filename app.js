var http = require('http'),
	sio = require('socket.io'),
	index = require('fs').readFileSync(__dirname+'/index.html'),
	fs = require('fs'),
	url = require('url');


var app = http.createServer(function(req,res){
	var request = url.parse(req.url,true);
	var action = request.pathname;
	if(action == '/style.css'){
		var style = fs.readFileSync('./style.css');
		res.writeHead(200,{'Content-Type':'text/css'});
		res.end(style,'binary');
	}
	else{
		res.writeHead(200,{'content-Type':'text/html'});
		res.end(index);
	}
}), io=sio.listen(app);

app.listen(3000);

io.sockets.on('connection',function(socket){

	socket.emit("connection acknowledgment");

	socket.on('disconnect',function(){

	});

	socket.on('bet locked',function(){
		socket.emit('bet lock confirm');
	});

	socket.on('bet unlocked',function(){
		socket.emit('bet unlock confirm');
	});

});


