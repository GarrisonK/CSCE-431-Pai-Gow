var http = require('http'),
sio = require('socket.io'),
index = require('fs').readFileSync(__dirname + '/index.html'),
fs = require('fs'),
url = require('url');
var util = require('util');

var dots = [3, 6, 12, 12, 2, 2, 8, 8, 4, 4, 10, 10, 6, 6, 4, 4, 11, 11, 10, 10,
            7, 7, 6, 6, 9, 9, 8, 8, 7, 7, 5, 5];
var tileNames = ['Gee Joon', 'Gee Joon', 'Teen', 'Teen', 'Day', 'Day', 'Yun',
                 'Yun', 'Gor', 'Gor', 'Mooy', 'Mooy', 'Chong', 'Chong', 'Bon',
                 'Bon', 'Foo', 'Foo', 'Ping', 'Ping', 'Tit', 'Tit', 'Look',
                 'Look', 'Chop Gow', 'Chop Gow', 'Chop Bot', 'Chop Bot',
                 'Chop Chit', 'Chot Chit', 'Chop Ng', 'Chop Ng'];
var ranks = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11,
             11, 12, 12, 13, 13, 14, 14, 15, 15, 16, 16];


//code used for finding the winner of a round


function getNumDots(id) {
    return dots[id];
}

function getRank(id) {
    return ranks[id];
}

function getNonPairValue(id1, id2) {
    //returns 0-9 representing value, or -1 if the ids form a pair
    //If one of the tiles is the Gee Joon, returns the better of the two
    //possible values.
    if (isPair(id1, id2)) {
        return -1;
    }
    else {
        if (getRank(id1) == 1) {
            if((3 + getNumDots(id2))%10 > (6 + getNumDots(id2))%10){
                return ((3 + getNumDots(id2))%10);
            }
            else{
                return ((6 + getNumDots(id2))%10);
            }

        }
        else if (getRank(id2) == 1) {
            if((3 + getNumDots(id1))%10 > (6 + getNumDots(id1))%10){
                return ((3 + getNumDots(id1))%10);
            }
            else{
                return ((6 + getNumDots(id1))%10);
            }

        }
        else {
            var val = getNumDots(id1) + getNumDots(id2);
            return val % 10;
        }
    }
}

function isPair(id1, id2) {
    if (getRank(id1) == getRank(id2)) {
        return true;
    }
    return false;
}

function isWong(id1, id2) {
    if (getRank(id1) == 2 && getNumDots(id2) == 9) {
        return true;
    }
    if (getRank(id1) == 3 && getNumDots(id2) == 9) {
        return true;
    }
    if (getRank(id2) == 2 && getNumDots(id1) == 9) {
        return true;
    }
    if (getRank(id2) == 3 && getNumDots(id1) == 9) {
        return true;
    }
    return false;
}

function isGong(id1, id2) {
    if (getRank(id1) == 2 && getNumDots(id2) == 8) {
        return true;
    }
    if (getRank(id1) == 3 && getNumDots(id2) == 8) {
        return true;
    }
    if (getRank(id2) == 2 && getNumDots(id1) == 8) {
        return true;
    }
    if (getRank(id2) == 3 && getNumDots(id1) == 8) {
        return true;
    }
    return false;
}

function getHighestRank(id1, id2) {
    //considers the rule that a Gee Joon outside of a pair is the lowest ranking
    //tile possible for tie breaking
    if (getRank(id1) == 1) {
        return getRank(id2);
    }
    else if (getRank(id2) == 1) {
        return getRank(id1);
    }
    else if (getRank(id1) < getRank(id2)) {
        return getRank(id1);
    }
    return getRank(id2);
}

function getWinner(id1, id2, id3, id4) {
    //Returns 1 if the first set wins, 2 if the second set wins, or -1 if there
    //is a tie

    if (isPair(id1, id2) && !isPair(id3, id4)) {
        return 1;
    }
    if (!isPair(id1, id2) && isPair(id3, id4)) {
        return 2;
    }
    if (isPair(id1, id2) && isPair(id3, id4)) {
        if (getRank(id1) < getRank(id3)) return 1;
        else return 2;
    }

    //neither is a pair

    if ((isWong(id1, id2) && isWong(id3, id4)) || (isGong(id1, id2) &&
                                                   isGong(id3, id4))) {
        var highestRank1 = getHighestRank(id1, id2);
        var highestRank2 = getHighestRank(id3, id4);
        if (highestRank1 < highestRank2) {
            return 1;
        }
        else {
            return 2;
        }
    }
    else if (isWong(id1, id2)) {
        return 1;
    }
    else if (isWong(id3, id4)) {
        return 2;
    }
    else if (isGong(id1, id2)) {
        return 1;
    }
    else if (isGong(id3, id4)) {
        return 2;
    }

    //Neither is a pair or Wong/Gong
    var val1 = getNonPairValue(id1, id2);
    var val2 = getNonPairValue(id3, id4);

    if (val1 > val2) return 1;
    else if (val2 > val1) return 2;
    else {
        if (val1 === 0 && val2 === 0) return -1;
        var highestRank3 = getHighestRank(id1, id2);
        var highestRank4 = getHighestRank(id3, id4);

        if (highestRank3 < highestRank4) {
            return 1;
        }
        else if (highestRank4 < highestRank3) {
            return 2;
        }
        else return -1;


    }
}

function getOtherPair(tiles, selection) {
    //returns the second pair
    //ex: tiles = [0,1,2,3], selection = [1,2]
    //will return [0,3]
    var pair = [];
    for (var i = 0; i < tiles.length; i++) {
        if (selection.indexOf(tiles[i]) == -1) {
            pair.push(tiles[i]);
        }
    }
    return pair;
}

function getBestPairSelection(tiles) {
    //will return a pair of values 
    //TODO Write better code

    if(isPair(tiles[0],tiles[1])){
        return [tiles[0],tiles[1]];
    }
    if(isPair(tiles[0],tiles[2])){
        return [tiles[0],tiles[2]];
    }
    if(isPair(tiles[0],tiles[3])){
        return [tiles[0],tiles[3]];
    }
    if(isPair(tiles[1],tiles[2])){
        return [tiles[1],tiles[2]];
    }
    if(isPair(tiles[1],tiles[3])){
        return [tiles[1],tiles[3]];
    }
    if(isPair(tiles[2],tiles[3])){
        return [tiles[2],tiles[3]];
    }

    if(isWong(tiles[0],tiles[1])){
        return [tiles[0],tiles[1]];
    }
    if(isWong(tiles[0],tiles[2])){
        return [tiles[0],tiles[2]];
    }
    if(isWong(tiles[0],tiles[3])){
        return [tiles[0],tiles[3]];
    }
    if(isWong(tiles[1],tiles[2])){
        return [tiles[1],tiles[2]];
    }
    if(isWong(tiles[1],tiles[3])){
        return [tiles[1],tiles[3]];
    }
    if(isWong(tiles[2],tiles[3])){
        return [tiles[2],tiles[3]];
    }

    if(isGong(tiles[0],tiles[1])){
        return [tiles[0],tiles[1]];
    }
    if(isGong(tiles[0],tiles[2])){
        return [tiles[0],tiles[2]];
    }
    if(isGong(tiles[0],tiles[3])){
        return [tiles[0],tiles[3]];
    }
    if(isGong(tiles[1],tiles[2])){
        return [tiles[1],tiles[2]];
    }
    if(isGong(tiles[1],tiles[3])){
        return [tiles[1],tiles[3]];
    }
    if(isGong(tiles[2],tiles[3])){
        return [tiles[2],tiles[3]];
    }

    var p1 = getNonPairValue(tiles[0],tiles[1]);
    var p2 = getNonPairValue(tiles[0],tiles[2]);
    var p3 = getNonPairValue(tiles[0],tiles[3]);
    var p4 = getNonPairValue(tiles[1],tiles[2]);
    var p5 = getNonPairValue(tiles[1],tiles[3]);
    var p6 = getNonPairValue(tiles[2],tiles[3]);

    if(p1 >= p2 && p1 >= p3 && p1 >= p4 && p1 >= p5 && p1 >= p6){
        return [tiles[0],tiles[1]];
    }
    if(p2 >= p1 && p2 >= p3 && p2 >= p4 && p2 >= p5 && p2 >= p6){
        return [tiles[0],tiles[2]];
    }
    if(p3 >= p2 && p3 >= p1 && p3 >= p4 && p3 >= p5 && p3 >= p6){
        return [tiles[0],tiles[3]];
    }
    if(p4 >= p2 && p4 >= p3 && p4 >= p1 && p4 >= p5 && p4 >= p6){
        return [tiles[1],tiles[2]];
    }
    if(p5 >= p2 && p5 >= p3 && p5 >= p4 && p5 >= p1 && p5 >= p6){
        return [tiles[1],tiles[3]];
    }
    if(p6 >= p2 && p6 >= p3 && p6 >= p4 && p6 >= p5 && p6 >= p1){
        return [tiles[2],tiles[3]];
    }

    var pp1 = getHighestRank(tiles[0],tiles[1]);
    var pp2 = getHighestRank(tiles[0],tiles[2]);
    var pp3 = getHighestRank(tiles[0],tiles[3]);
    var pp4 = getHighestRank(tiles[1],tiles[2]);
    var pp5 = getHighestRank(tiles[1],tiles[3]);
    var pp6 = getHighestRank(tiles[2],tiles[3]);

    if(pp1 >= pp2 && pp1 >= pp3 && pp1 >= pp4 && pp1 >= pp5 && pp1 >= pp6){
        return [tiles[0],tiles[1]];
    }
    if(pp2 >= pp1 && pp2 >= pp3 && pp2 >= pp4 && pp2 >= p5 && pp2 >= pp6){
        return [tiles[0],tiles[2]];
    }
    if(pp3 >= pp2 && pp3 >= pp1 && pp3 >= pp4 && pp3 >= pp5 && pp3 >= pp6){
        return [tiles[0],tiles[3]];
    }
    if(pp4 >= pp2 && pp4 >= pp3 && pp4 >= pp1 && pp4 >= pp5 && pp4 >= pp6){
        return [tiles[1],tiles[2]];
    }
    if(pp5 >= pp2 && pp5 >= pp3 && pp5 >= pp4 && pp5 >= pp1 && pp5 >= pp6){
        return [tiles[1],tiles[3]];
    }
    if(pp6 >= pp2 && pp6 >= pp3 && pp6 >= pp4 && pp6 >= pp5 && pp6 >= pp1){
        return [tiles[2],tiles[3]];
    }
    return [tiles[0], tiles[1]];
}

function getRoundWinner(bankerTiles, bankerSelection, opTiles, opSelection) {
    //returns 1 if 1 wins, 2 if 2 wins, -1 if push
    //tiles1 is assumed to be the banker (winner of ties)

    bankerOther = getOtherPair(bankerTiles, bankerSelection);
    opOther = getOtherPair(opTiles, opSelection);

    bankerHigh = [];
    bankerLow = [];
    opHigh = [];
    opLow = [];

    if (getWinner(bankerSelection[0], bankerSelection[1], bankerOther[0],
                  bankerOther[1]) == 1) {
        bankerHigh = bankerSelection;
        bankerLow = bankerOther;
    }
    else {
        bankerHigh = bankerOther;
        bankerLow = bankerSelection;
    }

    if (getWinner(opSelection[0], opSelection[1], opOther[0],
                  opSelection[1]) == 1) {
        opHigh = opSelection;
        opLow = opOther;
    }
    else {
        opHigh = opOther;
        opLow = opSelection;
    }

    //compare highs
    var result = 0;
    var highWinner = getWinner(bankerHigh[0], bankerHigh[1], opHigh[0],
                               opHigh[1]);
    if (highWinner == 1) {
        result += 1;
    }
    else if (highWinner == 2) {
        result -= 1;
    }
    else {
        //tie, banker wins
        result += 1;
    }

    var lowWinner = getWinner(bankerLow[0], bankerLow[1], opLow[0], opLow[1]);
    if (lowWinner == 1) {
        result += 1;
    }
    else if (lowWinner == 2) {
        result -= 1;
    }
    else {
        //tie, banker wins
        result += 1;
    }

    if (result == 2) {
        //banker wins, return 1
        return 1;
    }
    else if (result == -2) {
        //opponent wins, return 2
        return 2;
    }
    else {
        // either 1 or -1, indicating neither player won both matches. Push,
        //return -1
        return -1;
    }

}

playerExists = function(player,email){
    var options = {
      host: "heroku-team-bankin.herokuapp.com",
      path: '/services/account/exists/'+email
    };

    console.log(options);

    var callback = function(response){
        var str = '';

        response.on('data', function (chunk) {
        str += chunk;
      });

          //the whole response has been recieved, so we just print it out here
          response.on('end', function () {
            // if(str === "true"){
            //TODO Uncomment line above for deployment
            console.log("ACCOUNT CHECK RESULT: "+str);
            if(str === 'true' || str === 'false'){   //||true handles for now the changing bank api, remove for deployment
                checkWallet();
            }
            else{
                //TODO kick player
                noAccountHandler();
            }
          });
    }

    http.request(options, callback).end();
}

getPlayerInfo = function(email){
    var options = {
      host: "heroku-team-bankin.herokuapp.com",
      path: '/services/account/exists/'+email
    };

    console.log(options);

    var callback = function(response){
        var str = '';
        response.on('data', function (chunk) {
        str += chunk;
      });

      //the whole response has been recieved, so we just print it out here
      response.on('end', function () {
        console.log("RESULT: "+str);

        //TODO complete function stub
      });
    }

    http.request(options, callback).end();

    return "Bob";
};

getPlayerWallet = function(player,email){
    //TODO complete function stub

    var options = {
      host: "heroku-team-bankin.herokuapp.com",
      path: '/services/account/get/'+email
    };

    var callback = function(response){
        var str = '';
        response.on('data', function (chunk) {
        str += chunk;
      });

      //the whole response has been recieved
      response.on('end', function () {
        var jsonOb = JSON.parse(str);
        player.wallet = jsonOb['moneez'];
        player.firstName = jsonOb['firstname'];
        player.lastName = jsonOb['lastname'];
        player.level = jsonOb['level'];
        player.experience = jsonOb['xp'];
        player.walletUpdated = true;
        try{
            player.socket.emit('player info update',player.wallet,player.level,player.experience,player.firstName,player.lastName);
        }
        catch(e){
            console.log(e);
        }
        if(player.wallet >= minimumBet){
            assignTable();
        }
        else{
            alertInsufficientFunds();
        }
      });
    }

    http.request(options, callback).end();
};

updatePlayerWallet = function(player,email){
        //TODO complete function stub

    var options = {
      host: "heroku-team-bankin.herokuapp.com",
      path: '/services/account/get/'+email
    };

    var callback = function(response){
        var str = '';
        response.on('data', function (chunk) {
        str += chunk;
      });

      //the whole response has been recieved
      response.on('end', function () {
        var jsonOb = JSON.parse(str);
        player.wallet = jsonOb['moneez'];
        player.walletUpdated = true;
        player.firstName = jsonOb['firstname'];
        player.lastName = jsonOb['lastname'];
        player.level = jsonOb['level'];
        player.experience = jsonOb['xp'];
        try{
            player.socket.emit('player info update',player.wallet,player.level,player.experience,player.firstName,player.lastName);
        }
        catch(e){
            console.log(e);
        }
        if(player.wallet >= minimumBet){
            //do nothing
        }
        else{
            alertInsufficientFunds();
        }
      });
    }

    http.request(options, callback).end();
}

depositMoney = function(player,amount){
    //amount is positive for deposits, negative for withdrawals
    //TODO complete function stub
    console.log(player.id+" for "+amount);

    if(amount < 0){
        var data = {
            email: player.id,
            withdraw: -1*amount
        };

        var dataString = JSON.stringify(data);
        // console.log(dataString);

        var headers = {
            'Content-Type': 'application/json',
            'Content-Length': dataString.length
        };

        // console.log(headers);


        var options = {
            host: 'heroku-team-bankin.herokuapp.com',
            port: 80,
            path: '/services/account/withdraw',
            method: 'PUT',
            headers: headers
        };

        var req = http.request(options, function(res) {
            res.setEncoding('utf-8');

            var responseString = '';

            res.on('data', function(data) {
                responseString += data;
            });

            res.on('end', function() {
                var resultObject = JSON.parse(responseString);
                console.log(resultObject);
            });
        });
        req.write(dataString);
        req.end();


    }
    else{
        var data = {
            email: player.id,
            deposit: amount
        };

        var dataString = JSON.stringify(data);
        console.log(dataString);

        var headers = {
            'Content-Type': 'application/json',
            'Content-Length': dataString.length
        };

        // console.log(headers);


        var options = {
            host: 'heroku-team-bankin.herokuapp.com',
            port: 80,
            path: '/services/account/deposit',
            method: 'PUT',
            headers: headers
        };

        var req = http.request(options, function(res) {
            res.setEncoding('utf-8');

            var responseString = '';

            res.on('data', function(data) {
                responseString += data;
            });

            res.on('end', function() {
                var resultObject = JSON.parse(responseString);
                // console.log(resultObject);
            });
        });
        req.write(dataString);
        req.end();
    }
}

addPlayerExperience = function(player, amount){
    //adds experience for a player

    console.log("adding "+amount+" experience for "+player.id);

    var data = {
        email: player.id,
        xp: amount
    };

    var dataString = JSON.stringify(data);

    var headers = {
        'Content-Type': 'application/json',
        'Content-Length': dataString.length
    };

    var options = {
        host: 'heroku-team-bankin.herokuapp.com',
        port: 80,
        path: '/services/account/addxp',
        method: 'PUT',
        headers: headers
    };

    var req = http.request(options, function(res) {
        res.setEncoding('utf-8');

        var responseString = '';

        res.on('data', function(data) {
            responseString += data;
        });

        res.on('end', function() {
            var resultObject = JSON.parse(responseString);
            // console.log(resultObject);
        });
    });
    req.write(dataString);
    req.end();
};


var tables = [];
var gameStates = ['pregame', 'betting', 'dealing', 'pair selection',
                  'tile reveal', 'endgame'];
var stateLength = [0,10000,5000,20000,7000,1000];

var newDeck = function() {
    this.tiles = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
                  18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];
};

var minimumBet = 5;
var roundWinExp = 20;

var newPlayer = function(name, id, socket, minimumBet) {
    this.name = name;
    this.id = id;
    this.socket = socket;
    this.bet = minimumBet;
    this.wallet = 50;
    this.tiles = [];
    this.tileSelection = [];
    this.selectionLocked = false;
    this.betLocked = false;
    this.bankOnTurn = true;
    this.nameFound = false;
    this.playerFound = false;
    this.walletUpdated = false; //A flag which is set to true when this players wallet has been updated
    this.experience = 0;
    this.firstName = "";
    this.lastName = "";
    this.level = 0;
    this.seat = -1;
};

var newTable = function() {
    var d = new Date();
    this.timeOfLastStateChange = d.getTime();
    this.state = gameStates[0];
    this.deck = new newDeck();
    this.shuffle = function() {
        for (var j, x, i =
             this.deck.tiles.length; i; j = Math.floor(Math.random() * i),
             x = this.deck.tiles[--i],
             this.deck.tiles[i] = this.deck.tiles[j],
             this.deck.tiles[j] = x);
    };
    this.shuffle();
    this.seats = [null, null, null, null, null, null, null];
    this.minimumBet = minimumBet;
    this.banker = -1; //dealer is banker
    this.dealerTiles = [];
    this.dealerSelection = [];
    this.activeSeats = [false,false,false,false,false,false,false];
    this.advanceState = false;
};

var addPlayer = function(table, player) {
    var seat = table.seats.indexOf(null);
    table.seats[seat] = player; //place player in first
    player.seat = seat;
    //available seat
    if(table.state == "pregame"){
        table.activeSeats[seat] = true;
    }

};

var app = http.createServer(function(req, res) {
    var request = url.parse(req.url, true);
    // console.log("REQUEST: %j",request);
    var action = request.pathname;
    console.log("ACTION: "+action);
    console.log(request);
    if (action == '/style.css') {
        var style = fs.readFileSync('./style.css');
        res.writeHead(200, {'Content-Type' : 'text/css'});
        res.end(style, 'binary');
    }
    else if (action == '/paper.js') {
        var paper = fs.readFileSync('./paper.js');
        res.writeHead(200, {'Content-Type' : 'text/javascript'});
        res.end(paper, 'binary');
    }
    else if (action == '/client.js') {
        var client = fs.readFileSync('./client.js');
        res.writeHead(200, {'Content-Type' : 'text/javascript'});
        res.end(client, 'binary');
    }
    else if (action == '/tiles.png') {
        var tiles = fs.readFileSync('./tiles.png');
        res.writeHead(200, {'Content-Type' : 'image/png'});
        res.end(tiles, 'binary');
    }
    else if (action == '/buttons.png') {
        var buttons = fs.readFileSync('./buttons.png');
        res.writeHead(200, {'Content-Type' : 'image/png'});
        res.end(buttons, 'binary');
    }
    else if (action == '/howler.min.js'){
        var howler = fs.readFileSync('./howler.min.js');
        res.writeHead(200, {'Content-Type' : 'text/javascript'});
        res.end(howler, 'binary');
    }
    else if (action == '/table.png') {
        var table = fs.readFileSync('./table.png');
        res.writeHead(200, {'Content-Type' : 'image/png'});
        res.end(table, 'binary');
    }
     else if (action == '/sound/betUp.wav') {
        var betUpSound = fs.readFileSync('./sound/betUp.wav');
        res.writeHead(200, {'Content-Type' : 'audio/x-wav'});
        res.end(betUpSound, 'binary');
    }
    else if (action == '/sound/betDown.wav') {
        var betDownSound = fs.readFileSync('./sound/betDown.wav');
        res.writeHead(200, {'Content-Type' : 'audio/x-wav'});
        res.end(betDownSound, 'binary');
    }
    else if (action == '/sound/buttonClick.wav') {
        var clickSound = fs.readFileSync('./sound/buttonClick.wav');
        res.writeHead(200, {'Content-Type' : 'audio/x-wav'});
        res.end(clickSound, 'binary');
    }
     else if (action == '/sound/Shuffle.wav') {
        var shuffle = fs.readFileSync('./sound/Shuffle.wav');
        res.writeHead(200, {'Content-Type' : 'audio/x-wav'});
        res.end(shuffle, 'binary');
    }
     else if (action == '/sound/win.wav') {
        var winSound = fs.readFileSync('./sound/win.wav');
        res.writeHead(200, {'Content-Type' : 'audio/x-wav'});
        res.end(winSound, 'binary');
    }
     else if (action == '/sound/lose.wav') {
        var loseSound = fs.readFileSync('./sound/lose.wav');
        res.writeHead(200, {'Content-Type' : 'audio/x-wav'});
        res.end(loseSound, 'binary');
    }
    else if (action == '/sound/draw.wav') {
        var drawSound = fs.readFileSync('./sound/draw.wav');
        res.writeHead(200, {'Content-Type' : 'audio/x-wav'});
        res.end(drawSound, 'binary');
    }
    else if(action == '/exitPage.html'){
        var exitPage = fs.readFileSync('./exitPage.html');
        res.writeHead(200, {'content-Type' : 'text/html'});
        res.end(exitPage);
    }
    else if(action == '/'){
        // console.log("REQUEST: %j",request);
        console.log("USER: "+request.query.email);

        var invalidUser = false;
        if(typeof request.query.email === 'undefined'){
            var exitPage = fs.readFileSync('./exitPage.html');
            res.writeHead(200, {'content-Type' : 'text/html'});
            res.end(exitPage);
            invalidUser = true;
        }
        else{

            var duplicatePlayer = false;
            //Check if this player is currently in a game
            for(var i = 0; i < tables.length; i++){
                if(tables[i] !== null){
                    // console.log("i: "+i);
                    for(var j = 0; j < tables[i].seats.length; j++){
                        if(tables[i].seats[j] !== null){
                            if(tables[i].seats[j].id == request.query.email){
                                var exitPage = fs.readFileSync('./exitPage.html');
                                res.writeHead(200, {'content-Type' : 'text/html'});
                                res.end(exitPage);
                                duplicatePlayer = true;
                                break;
                            }
                        }
                    }
                }
            }
            if(!duplicatePlayer && !invalidUser){
                res.writeHead(200, {'content-Type' : 'text/html'});
                res.end(index);
            }
        }
    }
    else{
        //TODO put something here
        console.log("some strange request");
    }
}), io = sio.listen(app);

app.listen(3000);
io.set('log level',1); //dont log so much debugging stuff

io.sockets.on('connection', function(socket) {

    console.log("QUERY: "+socket.manager.handshaken[socket.id].query.email);

    //TODO replace coolguy9 with data supplied by the lobby team
    var id = socket.manager.handshaken[socket.id].query.email; //get id from client
    var player = new newPlayer("name", id, socket, minimumBet);
    var tableId = -1;
    var seat = -1;

    var name = playerExists(player,id);
    
    checkWallet = function(){
        getPlayerWallet(player,id);
    };

    alertInsufficientFunds = function(){
        socket.emit('insufficient funds');
        socket.disconnect();
    };

    assignTable = function(){
        var foundTable = false;
        tableId = -1;

        var i;
        var j;

        //look for a seat at an existing table
        for(i = 0; i < tables.length; i++){
            if(tables[i] === null){
                console.log("adding player to previously null table: "+i);
                foundTable = true;
                var table = new newTable();
                tables[i] = table;
                addPlayer(tables[i],player);
                tableId = i;
                break;
            }
            else{
                for(j = 0; j < tables[i].seats.length; j++){
                    if(tables[i].seats[j] === null){
                        console.log("adding player to "+i);
                        foundTable = true;
                        addPlayer(tables[i],player);
                        tableId = i;
                        break;
                    }
                }
                if(foundTable){
                    break;
                }
            }
        }

        //could not find a seat for this player, create new table
        if(!foundTable){
            console.log("making new table");
            var table = new newTable();
            addPlayer(table,player);
            tables.push(table);
            tableId = tables.length-1;
        }

        console.log("table id: "+tableId);

        //determine which seat the player was placed at
        seat = -1;
        var banker = -1;
        var occupiedSeats = []; //a copy of the seats array for the players table
        for(i = 0; i < tables.length; i++){
            if(tables[i] !== null){
                for(j = 0; j < tables[i].seats.length; j++){
                    if(tables[i].seats[j] !== null){
                        if(tables[i].seats[j].id == player.id){
                            seat = j;
                            banker = tables[i].banker;
                            occupiedSeats = tables[i].seats;
                            break;
                        }
                    }
                }
            }
        }

        var occupied = [0,0,0,0,0,0,0]; //contains the ids for the players in each seat, 0 if empty.
        for(i = 0; i < occupiedSeats.length; i++){
            if(occupiedSeats[i] === null){
                occupied[i] = 0;
            }
            else{
                occupied[i] = occupiedSeats[i].id;
            }
        }

        //find out how much money each player has
        var seatsWallets = [null,null,null,null,null,null,null];
        for(j = 0; j < tables[tableId].seats.length; j++){
            if(tables[tableId].seats[j] !== null && tables[tableId].activeSeats[j] === true){
                seatsWallets[j] = tables[tableId].seats[j].wallet;
            }
        }
        tables[tableId].seatsWallets = seatsWallets;

        var d = new Date();
        socket.emit('connection acknowledgment', player.wallet, player.bet,
                    d.getTime(), banker,seat,tables[tableId].activeSeats,tables[tableId].seatsWallets);

        for(i = 0; i < occupiedSeats.length; i++){
            if(occupiedSeats[i] !== null){
                occupiedSeats[i].socket.emit('occupied seats',occupied);
            }
        }
    };

    noAccountHandler = function(){
        socket.emit('no account');
        socket.disconnect();
    };

    duplicatePlayerHandler = function(){
        socket.emit('duplicate account');
        socket.disconnect();
    }



    socket.on('disconnect', function() {
        console.log('disconnect ' + player.id);

        //find the table that player is at, remove him from the seat, and remove
        //that table
        // console.log("tableid: "+tableId);
        if(tableId !== 1 && player.seat !== -1){
            player = tables[tableId].seats[player.seat];
        }

        if(player === null){
            //do nothing
        }
        else{
            if(tableId !== -1){
                console.log("disconnect on table: "+tableId);
                console.log("state: "+tables[tableId].state);
                if(tables[tableId].state === "betting" || tables[tableId].state === "dealing" || tables[tableId].state === "tile reveal" || tables[tableId].state == "pair selection"){
                    //Destroy this table
                    console.log("Destroy this table");
                    for(j = 0; j < tables[tableId].seats.length; j++){
                        if(tables[tableId].seats[j] !== null && tables[tableId].seats[j].id !== player.id){
                            var sock = tables[tableId].seats[j].socket;
                            tables[tableId].seats[j] = null;
                            sock.emit('table removed');
                            sock.disconnect();
                        }
                    }
                    tables[tableId] = null;
                }
                else{
                    // This player left at a valid time
                    for (j = 0; j < tables[tableId].seats.length; j++) {
                        if(tables[tableId].seats[j] !== null){
                            if (tables[tableId].seats[j].id == player.id) {
                                tables[tableId].seats[j] = null;
                                tables[tableId].activeSeats[j] = false;

                                //get the number of players at this table
                                var playerCount = 0;
                                for(var k = 0; k < tables[tableId].seats.length; k++){
                                    if(tables[tableId].seats[k] !== null){
                                        playerCount += 1;
                                    }
                                }
                                if(playerCount === 0){
                                    //this table has no more players, remove it
                                    // tables.splice(tableId, 1);
                                    tables[tableId] = null;
                                    console.log("removed table "+tableId);
                                }
                                else{
                                    //Notify all players at this table of the disconnection
                                    for(var k = 0; k < tables[tableId].seats.length; k++){
                                        if(tables[tableId].seats[k] !== null){
                                            tables[tableId].seats[k].socket.emit('active players update',tables[tableId].activeSeats);
                                        }
                                    }    
                                }
                                break;
                            }
                        }
                    }
                }
            }
        }
    });

    socket.on('bet locked', function(bet) {
        if (player.wallet >= bet) {
            //player has enough money

            //check that this bet does not exceed amount of money that banker has
            //this amount is defined as banker.wallet/num_players

            var numActivePlayers = 1; //initialize to 1 because of banker
            for(var j = 0; j < tables[tableId].seats.length; j++){
                if(tables[tableId].activeSeats[j] === true){
                    numActivePlayers += 1;
                }
            }

            if(tables[tableId].banker === -1 || bet <= tables[tableId].seats[tables[tableId].banker].wallet / (numActivePlayers-1)){
                player.bet = bet;
                socket.emit('bet lock confirm', bet);
            }

            var seatsBets = [null,null,null,null,null,null,null];
            for(var j = 0; j < tables[tableId].seats.length; j++){
                if(tables[tableId].seats[j] !== null){
                    seatsBets[j] = tables[tableId].seats[j].bet;
                }
            }

            //update all players of this new bet
            for(j = 0; j < tables[tableId].seats.length; j++){
                if(tables[tableId].seats[j] !== null){
                    tables[tableId].seats[j].socket.emit("seats bets",seatsBets);
                }
            }

            tables[tableId].seats[seat].betLocked = true;
            //TOOD check if all bets are locked
            var allLocked = true;
            for(j = 0; j < tables[tableId].seats.length; j++){
                if(tables[tableId].seats[j] !== null){
                    if(tables[tableId].seats[j].betLocked === false && tables[tableId].activeSeats[j] === true){
                        allLocked = false;
                        break;
                    }
                }
            }

            if(allLocked && tables[tableId].state === "betting"){
                tables[tableId].advanceState = true;
            }
        }
    });

    socket.on('bet unlocked', function() {
        socket.emit('bet unlock confirm');
        tables[tableId].seats[seat].betLocked = false;
    });

    socket.on('tile selection', function(pair) {
        var i;
        var j;
        if (pair.length != 2) {
            //find this player, return default selection or last valid selection
            //in normal play, this code should never run
            for (i = 0; i < tables.length; i++) {
                if(tables[i] !== null){
                    for (j = 0; j < tables[i].seats.length; j++) {
                        if (tables[i].seats[j] !== null) {
                            if (tables[i].seats[j].id == player.id) {
                                //found player
                                if (tables[i].seats[j].tileSelection.length == 2) {
                                    //player has a previous valid selection, reuse
                                    //this
                                    socket.emit('confirm tile selection', pair);
                                }
                                else {
                                    //apply the default selection
                                    tables[i].seats[j].tileSelection =
                                        [tables[i].seats[j].tiles[0],
                                         tables[i].seats[j].tiles[1]];
                                    socket.emit('confirm tile selection',
                                                tables[i].seats[j].tileSelection);
                                }
                            }
                        }
                    }
                }
            }
        }
        else {
            for (i = 0; i < tables.length; i++) {
                if(tables[i] !== null){
                    for (j = 0; j < 7; j++) {
                        if(tables[i].seats[j] !== null){
                            if (tables[i].seats[j].id == player.id) {
                                for (var k = 0; k < pair.length; k++) {
                                    //check that the player was dealt these tiles
                                    if (tables[i].seats[j].tiles.indexOf(pair[k]) ==
                                        -1) {
                                        //the player does not have access to this tile,
                                        //apply default selection
                                        tables[i].seats[j].tileSelection =
                                            [tables[i].seats[j].tiles[0],
                                             tables[i].seats[j].tiles[1]];
                                        socket.emit('confirm tile selection',
                                                    tables[i].seats[j].tileSelection);
                                        return;
                                    }
                                }
                                //at this point, the player has been confirmed to have
                                //been dealt the tiles in pair
                                tables[i].seats[j].tileSelection = pair;
                                break;
                            }
                        }
                    }
                }
            }
            socket.emit('confirm tile selection', pair);
        }
    });

    socket.on('pair selection locked', function(pair) {
        for (var i = 0; i < tables.length; i++) {
            if(tables[i] !== null){
                for (var j = 0; j < 7; j++) {
                    if (tables[i].seats[j] !== null) {
                        if (tables[i].seats[j].id == player.id) {
                            //found the player, now check the tiles
                            var allValidTiles = true;
                            for(var k = 0; k < pair.length; k++){
                                var foundThisTile = false;
                                for(var p = 0; p < tables[i].seats[j].tiles.length; p++){
                                    if(pair[k] == tables[i].seats[j].tiles[p]){
                                        foundThisTile = true;
                                    }
                                }
                                if(!foundThisTile){
                                    allValidTiles = false;
                                    break;
                                }
                            }
                            if(allValidTiles){
                                tables[i].seats[j].tileSelection = pair;
                                tables[i].seats[j].selectionLocked = true;
                                socket.emit('confirm selection locked', pair);
                            }
                        }
                    }
                }
            }
        }

        var allLocked = true;
        for(j = 0; j < tables[tableId].seats.length; j++){
            if(tables[tableId].seats[j] !== null){
                if(tables[tableId].seats[j].selectionLocked === false && tables[tableId].activeSeats[j] === true){
                    allLocked = false;
                    break;
                }
            }
        }

        if(allLocked && tables[tableId].state === "pair selection"){
            tables[tableId].advanceState = true;
        }
    });

    socket.on('pair selection unlocked', function() {
        for (var i = 0; i < tables.length; i++) {
            if(tables[i] !== null){
                for (var j = 0; j < 7; j++) {
                    if (tables[i].seats[j] !== null) {
                        if (tables[i].seats[j].id == player.id) {
                            tables[i].seats[j].selectionLocked = false;
                            socket.emit('confirm selection unlocked');
                        }
                    }
                }
            }
        }
    });

    socket.on('bank on turn', function(selection) {
        for (var i = 0; i < tables.length; i++) {
            if(tables[i] !== null){
                for (var j = 0; j < 7; j++) {
                    if (tables[i].seats[j] !== null) {
                        if (tables[i].seats[j].id == player.id) {
                            tables[i].seats[j].bankOnTurn = selection;
                            break;
                        }
                    }
                }
            }
        }
    });

});

setInterval(function() {
    var d = new Date();
    var time = d.getTime();
    for (var i = 0; i < tables.length; i++) {
        if(tables[i] !== null){
            var j;
            var k;
            // Make sure all players have enough money before advancing states
            var allWalletsUpdated = true;
            var socketsToKick = [];
            for(j = 0; j < tables[i].seats.length; j++){
                if(tables[i].seats[j]!==null){
                    if(tables[i].seats[j].walletUpdated === false){
                        allWalletsUpdated = false;
                    }
                    else{
                        if(tables[i].seats[j].wallet < tables[i].minimumBet){
                            socketsToKick.push(tables[i].seats[j]);
                        }
                    }
                }
            }

            for(j = 0; j < socketsToKick.length; j++){
                socketsToKick[j].socket.disconnect();
            }

            // console.log("All wallets updated: "+allWalletsUpdated);
            // console.log("Active seats: "+tables[i].activeSeats);
            if ((time - tables[i].timeOfLastStateChange > stateLength[gameStates.indexOf(tables[i].state)] || tables[i].advanceState === true) && allWalletsUpdated) {
                //this table needs to update
                tables[i].advanceState = false;
                console.log("need to update");
                var currentState = tables[i].state;
                tables[i].state = gameStates[(gameStates.indexOf(currentState) +
                                              1) % gameStates.length];
                console.log("new state for table "+i+": "+tables[i].state);
                tables[i].timeOfLastStateChange = time;
                for (j = 0; j < tables[i].seats.length; j++) {
                    if (tables[i].seats[j] !== null) {
                        tables[i].seats[j].socket.emit('game state change',
                                                       tables[i].state, time);
                    }
                }

                if (tables[i].state == 'pregame') {

                    //activate all players
                    for(j = 0; j < tables[i].seats.length; j++){
                        if(tables[i].seats[j] !== null){
                            tables[i].activeSeats[j] = true;
                        }
                    }

                    // console.log("PREGAME SEATS: "+tables[i].seats);
     
                    // find the next willing banker
                    // TODO consider possibility of a player connecting during pregame

                    var numActivePlayers = 1; //initialize to 1 because of dealer
                    for(j = 0; j < tables[i].seats.length; j++){
                        if(tables[i].seats[j] !== null && tables[i].activeSeats[j] === true){
                            numActivePlayers+=1;
                        }
                    }
                     while (true) {
                         tables[i].banker += 1;
                         if (tables[i].banker == 7) {
                             tables[i].banker = -1;
                         }
                         if(tables[i].banker == -1){
                            //dealer will bank
                            break;
                         }
                         if (tables[i].seats[tables[i].banker] === null) {
                             //continue looking for next banker
                         }
                         else if (tables[i].seats[tables[i].banker] !==
                                  null && tables[i].seats[tables[i].
                                                          banker].bankOnTurn ===
                                  false) {
                            //this player doesn't want to bank
                         }
                         else if(tables[i].seats[tables[i].banker].wallet < numActivePlayers*tables[i].minimumBet){
                            //this player doesn't have enough money to bank
                            //Must have (number of players)*minimumBet
                         }
                         else {
                            //found a player to be the next banker
                             break;
                         }
                    }

                    // console.log("active seats: "+tables[i].activeSeats);



                    for (j = 0; j < tables[i].seats.length; j++) {
                        if (tables[i].seats[j] !== null) {
                            tables[i].seats[j].socket.emit(
                                'pregame game information', tables[i].banker,tables[i].activeSeats,stateLength);
                        }
                    }
                }
                else if (tables[i].state == "betting"){
                    
                    //set all players bet lock state
                    for(j = 0; j < tables[i].seats.length; j++){
                        if(tables[i].seats[j] !== null){
                            if(j == tables[i].banker){
                                tables[i].seats[j].betLocked = true;
                            }
                            else{
                                tables[i].seats[j].betLocked = false;
                            }
                        }
                    }

                    //find out how much money each player has
                    var seatsWallets = [null,null,null,null,null,null,null];
                    for(j = 0; j < tables[i].seats.length; j++){
                        if(tables[i].seats[j] !== null && tables[i].activeSeats[j] === true){
                            seatsWallets[j] = tables[i].seats[j].wallet;
                        }
                    }

                    //resend the pregame information at the end of pregame
                    //handles cases where players join towards the end of pregame
                    //also send wallet information
                    for (j = 0; j < tables[i].seats.length; j++) {
                        if (tables[i].seats[j] !== null) {
                            tables[i].seats[j].socket.emit(
                                'pregame game information', tables[i].banker,tables[i].activeSeats,stateLength);
                            tables[i].seats[j].socket.emit('seats wallets',seatsWallets);
                        }
                    }
                }
                else if (tables[i].state == 'dealing') {
                    //let the clients know all of the player's bets
                    var seatsBets = [null,null,null,null,null,null,null];
                    for(j = 0; j < tables[i].seats.length; j++){
                        if(tables[i].seats[j] !== null && tables[i].activeSeats[j] === true){
                            seatsBets[j] = tables[i].seats[j].bet;
                        }
                    }

                    // console.log("\n\n\nseats bets "+seatsBets);
                    for(j = 0; j < tables[i].seats.length; j++){
                        if(tables[i].seats[j] !== null){
                            tables[i].seats[j].socket.emit('seats bets',seatsBets);
                        }
                    }

                    var count = 0;
                    for (k = 0; k < 4; k++) { //deal 4 tiles each
                        for (j = 0; j < 7; j++) {
                            if (tables[i].seats[j] !== null && tables[i].activeSeats[j] === true) {
                                tables[i].seats[j].tiles.push(
                                    tables[i].deck.tiles[count]); //deal the tile
                                tables[i].seats[j].socket.emit(
                                    'player dealt', tables[i].deck.tiles[count]);
                                count += 1;
                            }
                        }
                        tables[i].dealerTiles.push(tables[i].deck.tiles[count]);
                        count += 1;
                    }
                    // Set default selection
                    for (k = 0; k < 7; k++) {
                        if (tables[i].seats[k] !== null && tables[i].activeSeats[k] === true) {
                            tables[i].seats[k].tileSelection =
                                [tables[i].seats[k].tiles[0],
                                 tables[i].seats[k].tiles[1]];
                        }
                    }
                }
                else if (tables[i].state == 'tile reveal') {
                    for (j = 0; j < 7; j++) {
                        if (tables[i].seats[j] !== null && tables[i].activeSeats[j] === true) {
                            //tell each player their final tile selection
                            tables[i].seats[j].socket.emit(
                                'finalize tile selection',
                                tables[i].seats[j].tileSelection);
                        }
                    }
                    //reveal all player's tiles
                    for (j = 0; j < 7; j++) {
                        if (tables[i].seats[j] !== null) {
                            tables[i].dealerSelection = getBestPairSelection(
                                tables[i].dealerTiles);
                            tables[i].seats[j].socket.emit(
                                'other player tiles', 'dealer',
                                tables[i].dealerTiles,
                                tables[i].dealerSelection);
                            for (k = 0; k < 7; k++) {
                                if (tables[i].seats[k] !== null && tables[i].activeSeats[k] === true) {
                                    tables[i].seats[j].socket.emit(
                                        'other player tiles',
                                        tables[i].seats[k].id,
                                        tables[i].seats[k].tiles,
                                        tables[i].seats[k].tileSelection);
                                }
                            }
                        }
                    }

                    //now reveal winners and payout
                    if (tables[i].banker == -1) {
                        //dealer is the banker

                        for (j = 0; j < tables[i].seats.length; j++) {
                            if (tables[i].seats[j] !== null && tables[i].activeSeats[j] === true) {
                                var roundWinner = getRoundWinner(
                                    tables[i].dealerTiles,
                                    tables[i].dealerSelection,
                                    tables[i].seats[j].tiles,
                                    tables[i].seats[j].tileSelection);
                                if (roundWinner == 1) {
                                    //banker win
                                    tables[i].seats[j].socket.emit(
                                        'match result', 'banker win');
                                    tables[i].seats[j].wallet -=
                                        tables[i].seats[j].bet;
                                    tables[i].seats[j].socket.emit(
                                        'wallet update',
                                        tables[i].seats[j].wallet);
                                    //alert bank
                                    depositMoney(tables[i].seats[j],-1*tables[i].seats[j].bet);
                                }
                                else if (roundWinner == 2) {
                                    //opponent win
                                    tables[i].seats[j].socket.emit(
                                        'match result', 'opponent win');
                                    tables[i].seats[j].wallet +=
                                    tables[i].seats[j].bet;
                                    tables[i].seats[j].socket.emit(
                                        'wallet update', tables[i].seats[j].wallet);
                                    depositMoney(tables[i].seats[j],tables[i].seats[j].bet);
                                    addPlayerExperience(tables[i].seats[j],roundWinExp);
                                }
                                else {
                                    //push
                                    tables[i].seats[j].socket.emit(
                                        'match result', 'push');
                                }
                            }
                        }
                    }
                    else {
                        //dealer is not the banker

                        //first, compare the dealer tiles to the banker
                        var proundWinner = getRoundWinner(
                            tables[i].seats[tables[i].banker].tiles,
                            tables[i].seats[tables[i].banker].tileSelection,
                            tables[i].dealerTiles,
                            tables[i].dealerSelection);
                        if (proundWinner == 1) {
                            //banker wins
                            tables[i].seats[tables[i].banker].socket.emit(
                                'match result', 'banker win');
                            tables[i].seats[tables[i].banker].wallet +=
                            tables[i].minimumBet;
                            console.log('new wallet: ' +
                                        tables[i].seats[tables[i].banker].wallet);
                            tables[i].seats[tables[i].banker].socket.emit(
                                'wallet update',
                                tables[i].seats[tables[i].banker].wallet);
                            depositMoney(tables[i].seats[tables[i].banker],tables[i].minimumBet);
                            addPlayerExperience(tables[i].seats[tables[i].banker],roundWinExp);
                        }
                        else if (proundWinner == 2) {
                            //dealer wins
                            tables[i].seats[tables[i].banker].socket.emit(
                                'match result', 'opponent win');
                            tables[i].seats[tables[i].banker].wallet -=
                                tables[i].minimumBet;
                            tables[i].seats[tables[i].banker].socket.emit(
                                'wallet update',
                                tables[i].seats[tables[i].banker].wallet);
                            depositMoney(tables[i].seats[tables[i].banker],-1*tables[i].minimumBet);
                        }
                        else {
                            //push
                            tables[i].seats[tables[i].banker].socket.emit(
                                'match result', 'push');
                        }

                        //now compare all other players against the banker
                        for(j = 0; j < tables[i].seats.length; j++){
                            if(tables[i].seats[j] !== null && tables[i].banker != j && tables[i].activeSeats[j] === true){
                                var pvproundWinner = getRoundWinner(tables[i].seats[tables[i].banker].tiles,
                                    tables[i].seats[tables[i].banker].tileSelection,
                                    tables[i].seats[j].tiles,
                                    tables[i].seats[j].tileSelection);
                                console.log("\n\n\n\nResult: "+pvproundWinner+"\n\n\n\n");
                                if(pvproundWinner == 1){
                                    //banker win
                                    tables[i].seats[tables[i].banker].socket.emit('match result','banker win');
                                    tables[i].seats[j].socket.emit('match result','banker win');
                                    tables[i].seats[tables[i].banker].wallet += tables[i].seats[j].bet;
                                    tables[i].seats[j].wallet -= tables[i].seats[j].bet;
                                    tables[i].seats[tables[i].banker].socket.emit('wallet update',tables[i].seats[tables[i].banker].wallet);
                                    tables[i].seats[j].socket.emit('wallet update',tables[i].seats[j].wallet);
                                    depositMoney(tables[i].seats[tables[i].banker],tables[i].seats[j].bet);
                                    depositMoney(tables[i].seats[j],-1*tables[i].seats[j].bet);
                                    addPlayerExperience(tables[i].seats[tables[i].banker],roundWinExp);
                                }
                                else if(pvproundWinner == 2){
                                    //opponent win
                                    tables[i].seats[tables[i].banker].socket.emit('match result','opponent win');
                                    tables[i].seats[j].socket.emit('match result','opponent win');
                                    tables[i].seats[tables[i].banker].wallet -= tables[i].seats[j].bet;
                                    tables[i].seats[j].wallet += tables[i].seats[j].bet;
                                    tables[i].seats[tables[i].banker].socket.emit('wallet update',tables[i].seats[tables[i].banker].wallet);
                                    tables[i].seats[j].socket.emit('wallet update',tables[i].seats[j].wallet);
                                    depositMoney(tables[i].seats[tables[i].banker],-1*tables[i].seats[j].bet);
                                    depositMoney(tables[i].seats[j],tables[i].seats[j].bet);
                                    addPlayerExperience(tables[i].seats[j],roundWinExp);
                                }
                                else{
                                    tables[i].seats[tables[i].banker].socket.emit('match result','push');
                                    tables[i].seats[j].socket.emit('match result','push');
                                }
                            }
                        }
                    }

                    var seatsWallets = [null,null,null,null,null,null,null];
                    for(j = 0; j < tables[i].seats.length; j++){
                        if(tables[i].seats[j] !== null){
                            seatsWallets[j] = tables[i].seats[j].wallet;
                        }
                    }


                    for(j = 0; j < tables[i].seats.length; j++){
                        if(tables[i].seats[j] !== null){
                            tables[i].seats[j].socket.emit('seats wallets',seatsWallets);
                        }
                    }
                }
                else if (tables[i].state == 'endgame') {
                    //reset all game information, shuffle deck
                    for (j = 0; j < tables[i].seats.length; j++) {
                        if (tables[i].seats[j] !== null) {
                            tables[i].seats[j].tiles = [];
                            tables[i].seats[j].tileSelection = [];
                            tables[i].seats[j].selectionLocked = false;
                            tables[i].seats[j].bet = tables[i].minimumBet;
                        }
                    }
                    tables[i].shuffle();
                    tables[i].dealerTiles = [];
                    tables[i].dealerSelection = [];
                    var seatsWallets = [null,null,null,null,null,null,null];

                    //update wallets
                    for(j = 0; j < tables[i].seats.length; j++){
                        if(tables[i].seats[j] !== null){
                            tables[i].seats[j].walletUpdated = false;
                            updatePlayerWallet(tables[i].seats[j],tables[i].seats[j].id);
                        }
                    }
                }
            }
        }
    }
},1000);
