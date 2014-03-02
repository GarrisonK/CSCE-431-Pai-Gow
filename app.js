var http = require('http'),
	sio = require('socket.io'),
	index = require('fs').readFileSync(__dirname+'/index.html'),
	fs = require('fs'),
	url = require('url');

	var dots = [3,6,12,12,2,2,8,8,4,4,10,10,6,6,4,4,11,11,10,10,7,7,6,6,9,9,8,8,7,7,5,5];
	var tileNames = ["Gee Joon","Gee Joon","Teen","Teen","Day","Day","Yun","Yun","Gor","Gor","Mooy","Mooy","Chong","Chong","Bon","Bon","Foo","Foo","Ping","Ping","Tit","Tit","Look","Look","Chop Gow","Chop Gow","Chop Bot","Chop Bot","Chop Chit","Chot Chit","Chop Ng","Chop Ng"];
	var ranks = [1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,14,14,15,15,16,16];

	var tables = [];
	var gameStates = ["pregame","betting","dealing","pair selection","tile reveal","endgame"];

var shuffleDeck = function(deck){
	for(var j,x,i = deck.length; i; j=Math.floor(Math.random()*i),x=deck[--i],deck[i]=deck[j],deck[j]=x);
	return deck;
}

var newDeck = function(){
	this.tiles = shuffleDeck([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31]);

}

var newPlayer = function(name,id,socket,minimumBet){
	this.name = name;
	this.id = id;
	this.socket = socket;
	this.bet = minimumBet;
	this.wallet = 50;
	this.tiles = [];
	this.tileSelection = [];
	this.selectionLocked = false;
}

var newTable = function(){
	var d = new Date();
	this.timeOfLastStateChange = d.getTime();
	this.state = gameStates[0];
	this.deck = new newDeck();
	this.seats = [null,null,null,null,null,null,null];
	this.minimumBet = 5;
	this.banker = -1; //dealer is banker
	this.dealerTiles = [];
}

var addPlayer = function(table,player){
	table.seats[table.seats.indexOf(null)] = player; //place player in first available seat
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

	var table = new newTable();
	var player = new newPlayer(socket.id,socket.id,socket,table.minimumBet);
	addPlayer(table,player);
	tables.push(table);
	// console.log(tables);


	var d = new Date();
	socket.emit("connection acknowledgment",player.wallet,player.bet,d.getTime(),table.banker);

	socket.on('disconnect',function(){
		console.log("disconnect "+player.name);

		//find the table that player is at, remove him from the seat, and remove that table
		for(var i = 0; i < tables.length; i++){
			for(var j = 0; j < tables.length; j++){
				if(tables[i].seats[j].id == player.id){
					tables[i].seats[j] = null;
					tables.splice(i,1);
					break;
				}
			}
		}


	});

	socket.on('bet locked',function(bet){
		if(player.wallet >= bet){
			socket.emit('bet lock confirm',bet);
		}
	});

	socket.on('bet unlocked',function(){
		socket.emit('bet unlock confirm');
	});

	socket.on('tile selection',function(pair){
		for(var i = 0; i < tables.length; i++){
			for(var j = 0; j < 7; j++){
				if(tables[i].seats[j].id == socket.id){
					tables[i].seats[j].tileSelection = pair;
					break;
				}
			}
		}
	});

	socket.on('pair selection locked',function(pair){
		for(var i = 0; i < tables.length; i++){
			for(var j = 0; j < 7; j++){
				if(tables[i].seats[j] != null){
					if(tables[i].seats[j].id == socket.id){
						tables[i].seats[j].tileSelection = pair;
						tables[i].seats[j].selectionLocked = true;
						socket.emit('confirm selection locked',pair);
					}
				}
			}
		}
	});

	socket.on('pair selection unlocked',function(){
		for(var i = 0; i < tables.length; i++){
			for(var j = 0; j < 7; j++){
				if(tables[i].seats[j] != null){
					if(tables[i].seats[j].id == socket.id){
						tables[i].seats[j].selectionLocked = false;
						socket.emit('confirm selection unlocked');
					}
				}
			}
		}
	});

});

setInterval(function(){
	var d = new Date();
	var time = d.getTime();
	for(var i = 0; i < tables.length; i++){
		if(time - tables[i].timeOfLastStateChange > 5000){
			//this table needs to update
			var currentState = tables[i].state;
			tables[i].state = gameStates[(gameStates.indexOf(currentState)+1)%gameStates.length]
			tables[i].timeOfLastStateChange = time;
			for(var j = 0; j < tables.length; j++){
				if(tables[i].seats[j] != null){
					tables[i].seats[j].socket.emit('game state change',tables[i].state,time);
				}
			}

			if(tables[i].state == "dealing"){
				var count = 0;
				for(var k = 0; k < 4; k++){ //deal 4 tiles each
					for(var j = 0; j < 7; j++){
						if(tables[i].seats[j] != null){
							tables[i].seats[j].tiles.push(tables[i].deck.tiles[count]); //deal the tile
							tables[i].seats[j].socket.emit('player dealt',tables[i].deck.tiles[count]);
							count+=1;
						}
					}
					tables[i].dealerTiles.push(tables[i].deck.tiles[count]);
					count+=1;
				}
			}
			if(tables[i].state == 'tile reveal'){
				for(var j = 0; j < 7; j++){
					if(tables[i].seats[j] != null){
						tables[i].seats[j].socket.emit('other player tiles','dealer',tables[i].dealerTiles);
						for(var k = 0; k < 7; k++){
							if(tables[i].seats[k] != null){
								tables[i].seats[j].socket.emit('other player tiles',tables[i].seats[k].id,tables[i].seats[k].tiles);
							}
						}
					}
				}
			}

		}
	}
},1000);



