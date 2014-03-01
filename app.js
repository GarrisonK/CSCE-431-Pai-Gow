var http = require('http'),
	sio = require('socket.io'),
	index = require('fs').readFileSync(__dirname+'/index.html'),
	fs = require('fs'),
	url = require('url');

	var dots = [3,6,12,12,2,2,8,8,4,4,10,10,6,6,4,4,11,11,10,10,7,7,6,6,9,9,8,8,7,7,5,5];
	var tileNames = ["Gee Joon","Gee Joon","Teen","Teen","Day","Day","Yun","Yun","Gor","Gor","Mooy","Mooy","Chong","Chong","Bon","Bon","Foo","Foo","Ping","Ping","Tit","Tit","Look","Look","Chop Gow","Chop Gow","Chop Bot","Chop Bot","Chop Chit","Chot Chit","Chop Ng","Chop Ng"];
	var ranks = [1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,14,14,15,15,16,16];

	var gameStates = ["pregame","betting","dealing","pair selection","tile reveal","endgame"];

var newDeck = function(){
	this.tiles = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31];
}

var newPlayer = function(name,id){
	this.name = name;
	this.id = id;
}

var newTable = function(){
	this.players = [];
	this.state = gameStates[0];
	this.deck = new newDeck();
	this.seats = [null,null,null,null,null,null,null];
}


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


