var http = require('http'),
	sio = require('socket.io'),
	index = require('fs').readFileSync(__dirname+'/index.html'),
	fs = require('fs'),
	url = require('url');

	var dots = [3,6,12,12,2,2,8,8,4,4,10,10,6,6,4,4,11,11,10,10,7,7,6,6,9,9,8,8,7,7,5,5];
	var tileNames = ["Gee Joon","Gee Joon","Teen","Teen","Day","Day","Yun","Yun","Gor","Gor","Mooy","Mooy","Chong","Chong","Bon","Bon","Foo","Foo","Ping","Ping","Tit","Tit","Look","Look","Chop Gow","Chop Gow","Chop Bot","Chop Bot","Chop Chit","Chot Chit","Chop Ng","Chop Ng"];
	var ranks = [1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,14,14,15,15,16,16];


	//code used for finding the winner of a round


	function getNumDots(id){
		return dots[id];
	}

	function getRank(id){
		return ranks[id];
	}

	function getNonPairValue(id1, id2){
		//returns 0-9 representing value, or -1 if the ids form a pair
		//If one of the tiles is the Gee Joon, returns the better of the two possible values.
		if(isPair(id1,id2)){
			return -1;
		}
		else{
			if(getRank(id1) == 1){
				var val1 = 3+getNumDots(id2);
				var val2 = 6+getNumDots(id2);
				if(val1%10 > val2%10){
					return val1%10;
				}
				return val2%10;
			}
			else if(getRank(id2) == 1){
				var val1 = 3+getNumDots(id1);
				var val2 = 6+getNumDots(id1);
				if(val1%10 > val2%10){
					return val1%10;
				}
				return val2%10;
			}
			else{
				var val = getNumDots(id1)+getNumDots(id2);
				return val%10;
			}
		}
	}

	function isPair(id1, id2){
		if(getRank(id1) == getRank(id2)){
			return true;
		}
		return false;
	}

	function isWong(id1, id2){
		if(getRank(id1) == 2 && getNumDots(id2) == 9){
			return true;
		}
		if(getRank(id1) == 3 && getNumDots(id2) == 9){
			return true;
		}
		if(getRank(id2) == 2 && getNumDots(id1) == 9){
			return true;
		}
		if(getRank(id2) == 3 && getNumDots(id1) == 9){
			return true;
		}
		return false;
	}

	function isGong(id1, id2){
		if(getRank(id1) == 2 && getNumDots(id2) == 8){
			return true;
		}
		if(getRank(id1) == 3 && getNumDots(id2) == 8){
			return true;
		}
		if(getRank(id2) == 2 && getNumDots(id1) == 8){
			return true;
		}
		if(getRank(id2) == 3 && getNumDots(id1) == 8){
			return true;
		}
		return false;
	}

	function getHighestRank(id1, id2){
		//considers the rule that a Gee Joon outside of a pair is the lowest ranking tile possible for tie breaking
		if(getRank(id1) == 1){
			return getRank(id2);
		}
		else if(getRank(id2) == 1){
			return getRank(id1);
		}
		else if(getRank(id1) < getRank(id2)){
			return getRank(id1);
		}
		return getRank(id2);
	}

	function getWinner(id1, id2, id3, id4){
		//Returns 1 if the first set wins, 2 if the second set wins, or -1 if there is a tie

		if(isPair(id1,id2) && !isPair(id3,id4)){
			return 1;
		}
		if(!isPair(id1,id2) && isPair(id3,id4)){
			return 2;
		}
		if(isPair(id1,id2) && isPair(id3,id4)){
			if(getRank(id1) < getRank(id3)) return 1;
			else return 2;
		}

		//neither is a pair

		if((isWong(id1,id2) && isWong(id3,id4)) || (isGong(id1,id2) && isGong(id3,id4))){
			var highestRank1 = getHighestRank(id1,id2);
			var highestRank2 = getHighestRank(id3,id4);
			if(highestRank1 < highestRank2){
				return 1;
			}
			else{
				return 2;
			}
		}
		else if(isWong(id1,id2)){
			return 1;
		}
		else if(isWong(id3,id4)){
			return 2;
		}
		else if(isGong(id1,id2)){
			return 1;
		}
		else if(isGong(id3,id4)){
			return 2;
		}

		//Neither is a pair or Wong/Gong
		var val1 = getNonPairValue(id1,id2);
		var val2 = getNonPairValue(id3,id4);

		if(val1>val2) return 1;
		else if(val2>val1) return 2;
		else{
			if(val1 == 0 && val2 == 0) return -1;
			var highestRank1 = getHighestRank(id1,id2);
			var highestRank2 = getHighestRank(id3,id4);

			if(highestRank1 < highestRank2){
				return 1;
			}
			else if(highestRank2 < highestRank1){
				return 2;
			}
			else return -1;


		}
	}

	function getOtherPair(tiles,selection){
		//returns the second pair
		//ex: tiles = [0,1,2,3], selection = [1,2]
		//will return [0,3]
		var pair = [];
		for(var i = 0; i < tiles.length; i++){
			if(selection.indexOf(tiles[i]) == -1){
				pair.push(tiles[i]);
			}
		}
		return pair;
	}

	function getBestPairSelection(tiles){
		//will return a pair of values
		//TODO fully implement, currently just returns default split
		return [tiles[0],tiles[1]];
	}

	function getRoundWinner(bankerTiles, bankerSelection, opTiles, opSelection){
		//returns 1 if 1 wins, 2 if 2 wins, -1 if push
		//tiles1 is assumed to be the banker (winner of ties)

		bankerOther = getOtherPair(bankerTiles,bankerSelection);
		opOther = getOtherPair(opTiles,opSelection);

		bankerHigh = [];
		bankerLow = [];
		opHigh = [];
		opLow = [];

		if(getWinner(bankerSelection[0],bankerSelection[1],bankerOther[0],bankerOther[1]) == 1){
			bankerHigh = bankerSelection;
			bankerLow = bankerOther;
		}
		else{
			bankerHigh = bankerOther;
			bankerLow = bankerSelection;
		}

		if(getWinner(opSelection[0],opSelection[1],opOther[0],opSelection[1]) == 1){
			opHigh = opSelection;
			opLow = opOther;
		}
		else{
			opHigh = opOther;
			opLow = opSelection;
		}

		//compare highs
		var result = 0;
		var highWinner = getWinner(bankerHigh[0],bankerHigh[1],opHigh[0],opHigh[1]);
		if(highWinner == 1){
			result += 1;
		}
		else if(highWinner == 2){
			result -= 1;
		}
		else{
			//tie, banker wins
			result += 1;
		}

		var lowWinner = getWinner(bankerLow[0],bankerLow[1],opLow[0],opLow[1]);
		if(lowWinner == 1){
			result += 1;
		}
		else if(lowWinner == 2){
			result -= 1;
		}
		else{
			//tie, banker wins
			result +=1;
		}

		if(result == 2){
			//banker wins, return 1
			return 1;
		}
		else if(result == -2){
			//opponent wins, return 2
			return 2;
		}
		else{
			// either 1 or -1, indicating neither player won both matches. Push, return -1
			return -1;
		}

	}



	var tables = [];
	var gameStates = ["pregame","betting","dealing","pair selection","tile reveal","endgame"];

var newDeck = function(){
	this.tiles = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31];

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
	this.shuffle = function(){
		for(var j,x,i = this.deck.tiles.length; i; j=Math.floor(Math.random()*i),x=this.deck.tiles[--i],this.deck.tiles[i]=this.deck.tiles[j],this.deck.tiles[j]=x);
	}
	this.shuffle();
	this.seats = [null,null,null,null,null,null,null];
	this.minimumBet = 5;
	this.banker = -1; //dealer is banker
	this.dealerTiles = [];
	this.dealerSelection = [];
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
			player.bet = bet;
			socket.emit('bet lock confirm',bet);

		}
	});

	socket.on('bet unlocked',function(){
		socket.emit('bet unlock confirm');
	});

	socket.on('tile selection',function(pair){
		if(pair.length != 2){
			//find this player, return default selection or last valid selection
			//in normal play, this code should never run
			for(var i = 0; i < tables.length; i++){
				for(var j = 0; j < tables[i].seats.length; j++){
					if(tables[i].seats[j] != null){
						if(tables[i].seats[j].id == socket.id){
							//found player
							if(tables[i].seats[j].tileSelection.length == 2){
								//player has a previous valid selection, reuse this
								socket.emit('confirm tile selection', pair);
							}
							else{
								//apply the default selection
								tables[i].seats[j].tileSelection = [tables[i].seats[j].tiles[0],tables[i].seats[j].tiles[1]];
								socket.emit('confirm tile selection',tables[i].seats[j].tileSelection);
							}
						}
					}
				}
			}
		}
		else{
			for(var i = 0; i < tables.length; i++){
				for(var j = 0; j < 7; j++){
					if(tables[i].seats[j].id == socket.id){
						for(var k = 0; k < pair.length; k++){
							//check that the player was dealt these tiles
							if(tables[i].seats[j].tiles.indexOf(pair[k]) == -1){
								//the player does not have access to this tile, apply default selection
								tables[i].seats[j].tileSelection = [tables[i].seats[j].tiles[0],tables[i].seats[j].tiles[1]];
								socket.emit('confirm tile selection',tables[i].seats[j].tileSelection);
								return;
							}
						}
						//at this point, the player has been confirmed to have been dealt the tiles in pair
						tables[i].seats[j].tileSelection = pair;
						break;
					}
				}
			}
			socket.emit('confirm tile selection', pair);
		}
	});

	socket.on('pair selection locked',function(pair){
		//TODO check if player was dealt these tiles
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

			if(tables[i].state == "pregame"){
				for(var j = 0; j < tables[i].seats.length; j++){
					if(tables[i].seats[j] != null){
						tables[i].seats[j].socket.emit('pregame game information',tables[i].banker);
					}
				}
			}
			else if(tables[i].state == "dealing"){
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
			else if(tables[i].state == 'tile reveal'){
				for(var j = 0; j < 7; j++){
					if(tables[i].seats[j] != null){
						//tell each player their final tile selection
						tables[i].seats[j].socket.emit('finalize tile selection',tables[i].seats[j].tileSelection);
					}
				}
				//reveal all player's tiles
				for(var j = 0; j < 7; j++){
					if(tables[i].seats[j] != null){
						tables[i].dealerSelection = getBestPairSelection(tables[i].dealerTiles);
						tables[i].seats[j].socket.emit('other player tiles','dealer',tables[i].dealerTiles,tables[i].dealerSelection);
						for(var k = 0; k < 7; k++){
							if(tables[i].seats[k] != null){
								tables[i].seats[j].socket.emit('other player tiles',tables[i].seats[k].id,tables[i].seats[k].tiles,tables[i].seats[k].tileSelection);
							}
						}
					}
				}

				//now reveal winners and payout
				if(tables[i].banker == -1){
					//dealer is the banker
					var bankerHigh = getBestPairSelection(tables[i].dealerTiles);
					var bankerLow = getOtherPair(tables[i].dealerTiles,bankerHigh);
					for(var j = 0; j < tables[i].seats.length; j++){
						if(tables[i].seats[j] != null){
							var roundWinner = getRoundWinner(tables[i].dealerTiles,tables[i].dealerSelection,tables[i].seats[j].tiles,tables[i].seats[j].tileSelection);
							if(roundWinner == 1){
								//banker win
								tables[i].seats[j].socket.emit('match result','banker win');
								tables[i].seats[j].wallet -= tables[i].seats[j].bet;
								tables[i].seats[j].socket.emit('wallet update',tables[i].seats[j].wallet);
							}
							else if(roundWinner == 2){
								//opponent win
								tables[i].seats[j].socket.emit('match result','opponent win');
								tables[i].seats[j].wallet += tables[i].seats[j].bet;
								tables[i].seats[j].socket.emit('wallet update',tables[i].seats[j].wallet);
							}
							else{
								//push
								tables[i].seats[j].socket.emit('match result','push');
							}
						}
					}
				}
				else{
					//dealer is not the banker
					var bankerHigh = getBestPairSelection(tables[i].seats[tables[i].banker].tiles);
					var bankerLow = getOtherPair(tables[i].seats[tables[i].banker].tiles,bankerHigh);
					//first, compare the dealer tiles to the banker
					var roundWinner = getRoundWinner(tables[i].seats[tables[i].banker].tiles, tables[i].seats[tables[i].banker].tileSelection,tables[i].dealerTiles,tables[i].dealerSelection);
					if(roundWinner == 1){
						//banker wins
						tables[i].seats[tables[i].banker].socket.emit('match result','banker win');
						tables[i].seats[tables[i].banker].wallet += tables[i].minimumBet;
						console.log("new wallet: "+tables[i].seats[tables[i].banker].wallet);
						tables[i].seats[tables[i].banker].socket.emit('wallet update',tables[i].seats[tables[i].banker].wallet);
					}
					else if(roundWinner == 2){
						//dealer wins
						tables[i].seats[tables[i].banker].socket.emit('match result','banker win');
						tables[i].seats[tables[i].banker].wallet -= tables[i].minimumBet;
						tables[i].seats[tables[i].banker].socket.emit('wallet update',tables[i].seats[tables[i].banker].wallet);
					}
					else{
						//push
						tables[i].seats[tables[i].banker].socket.emit('match result','push');
					}

				}

			}
			else if(tables[i].state == 'endgame'){
				//reset all game information, shuffle deck
				for(var j = 0; j < tables[i].seats.length; j++){
					if(tables[i].seats[j] != null){
						tables[i].seats[j].tiles = [];
						tables[i].seats[j].tileSelection = [];
						tables[i].seats[j].selectionLocked = false;
					}
				}
				tables[i].shuffle();
				tables[i].dealerTiles = [];
				tables[i].dealerSelection = [];
				//TODO update banker
				while(true){
					tables[i].banker += 1;
					if(tables[i].banker == 7){
						tables[i].banker = -1;
					}
					if(tables[i].banker != -1 && tables[i].seats[tables[i].banker] == null){
						//continue looking for next banker
					}
					else{
						//found a player to be the next banker
						break;
					}
				}
			}

		}
	}
},1000);



