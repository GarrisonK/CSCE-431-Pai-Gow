
console.log("EMAIL: "+playerEmail);

function getUrlParameters(parameter, staticURL, decode){
   /*
    Function: getUrlParameters
    Description: Get the value of URL parameters either from 
                 current URL or static URL
    Author: Tirumal
    URL: www.code-tricks.com
   */
   var currLocation = (staticURL.length)? staticURL : window.location.search,
       parArr = currLocation.split("?")[1].split("&"),
       returnBool = true;
   
   for(var i = 0; i < parArr.length; i++){
        parr = parArr[i].split("=");
        if(parr[0] == parameter){
            return (decode) ? decodeURIComponent(parr[1]) : parr[1];
            returnBool = true;
        }else{
            returnBool = false;            
        }
   }
   
   if(!returnBool) return false;  
}

var game = new Object();
//var email = "";
//try{
    email = playerEmail;
//}
//catch(e){
//    console.log("ERROR OCCURED");
//    game['accountExists'] = false;
//}
game['accountExists'] = true;


//Audio files
//Audio files
var betUp = new Howl({
    urls:['/sound/betUp.wav']
});

var betDown = new Howl({
    urls:['/sound/betDown.wav']
});

var clicked = new Howl({
    urls:['/sound/buttonClick.wav']
});

var shuffle = new Howl({
    urls:['sound/Shuffle.wav']
});

var winSound = new Howl({
    urls:['sound/win.wav']
});

var loseSound = new Howl({
    urls:['sound/lose.wav']
});

var drawSound = new Howl({
	 urls:['sound/draw.wav']
});



//Pai Gow tile infomation code
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

    var p1 = getHighestRank(tiles[0],tiles[1]);
    var p2 = getHighestRank(tiles[0],tiles[2]);
    var p3 = getHighestRank(tiles[0],tiles[3]);
    var p4 = getHighestRank(tiles[1],tiles[2]);
    var p5 = getHighestRank(tiles[1],tiles[3]);
    var p6 = getHighestRank(tiles[2],tiles[3]);

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








var unmute = true;
var tileWidth = 75;
var tileHeight = 150;
var tileScale = .5;
var titleBlankCropInfo = [850,70]; // [x,y]
var bankerCropInfo = [15,15,100,100];
var bet5CropInfo = [540,40,100];   //[x cord, y for +, y for -]
var muteButtonInfo = [100,55,1000,480,15,165,230]; //[width, height, x, y for mute, y for umute]
var bankerButtonInfo = [105,55,140,165,225]; //[width, height, x, y for take, y for skip]
var handLockInfo = [100,55,265,35,100]; //[width, height ,x cord, y for lock, y for unlock]
var betLockInfo = [100,55,405,35,100]; //[width, height, x cord, y for lock, y for unlock]
var bet5ButtonInfo = [600,320,52,52];    //xpos,ypos,width,height
var betDown5ButtonInfo = [450,320,52,52]; //xpos,ypos,width,height
var betLockButtonInfo = [500,320,50,25]; //xpos,ypos,width,height
var selectionLockButtonInfo = [500,320,50,25]; //xpos,ypos,width,height
var bankerSelectionInfo = [1000,540,50,25]; //xpos,ypos,width,height
var highlightTitleInfo = [840,240,100,175]; //[x crop, y crop, width, height]
//var dealerBankerSymbolLocation = [550,25]; 
//var bankerSymbolLocations = [[78,156],[117,319],[270,431],[487,459],[718,457],[893,352],[1018,156]];
var exitButtonInfo = [20,500,105,55,405,163]; //x,y,width,height, x crop, y corp
var timerBarInfo = [140,293,410,60,340,230]; //xcrop, ycrop, width, height, xcord, ycord  

var dealerBankerSymbolLocation = [450,250-100]; 
var bankerSymbolLocations = [[450,450+80],[200,450+80],[750,450+80],[50,250+80],[875,250+80],[175,75+80],[750,75+80]];

var tileLocations = [[665,545],[750,545],[98,72],[182,72],[286,72],[370,72],[478,74],[562,74],[666,74],[750,74],[97,229],[181,229],[285,229],[369,229],[477,231],[561,231],[655,231],[749,231],[96,386],[180,386],[284,386],[368,386],[476,388],[560,388],[664,388],[748,388],[96,543],[180,543],[284,543],[368,543],[476,545],[560,545]];

var seatTileLocations = [[[450,450],[450+1*(tileWidth*tileScale+5),450],[450+2*(tileWidth*tileScale+5),450],[450+3*(tileWidth*tileScale+5),450]], 
								 [[200,450],[200+1*(tileWidth*tileScale+5),450],[200+2*(tileWidth*tileScale+5),450],[200+3*(tileWidth*tileScale+5),450]],
								 [[750,450],[750+1*(tileWidth*tileScale+5),450],[750+2*(tileWidth*tileScale+5),450],[750+3*(tileWidth*tileScale+5),450]],
                         [[50,250],[50+1*(tileWidth*tileScale+5),250],[50+2*(tileWidth*tileScale+5),250],[50+3*(tileWidth*tileScale+5),250]],
                         [[875,250],[875+1*(tileWidth*tileScale+5),250],[875+2*(tileWidth*tileScale+5),250],[875+3*(tileWidth*tileScale+5),250]],
                         [[175,75],[175+1*(tileWidth*tileScale+5),75],[175+2*(tileWidth*tileScale+5),75],[175+3*(tileWidth*tileScale+5),75]],
                         [[750,75],[750+1*(tileWidth*tileScale+5),75],[750+2*(tileWidth*tileScale+5),75],[750+3*(tileWidth*tileScale+5),75]]
                        ]; 

var dealerTileLocations = [[450,75],[450+1*(tileWidth*tileScale+5),75],[450+2*(tileWidth*tileScale+5),75],[450+3*(tileWidth*tileScale+5),75]];

var tileX = 75;
var tileY = 150;

$(function(){

    var c = document.getElementById("game");
    c.width = 1100;
    c.height = 600;
    var ctx = c.getContext('2d');

    var tileImage = new Image();
    var buttonImage = new Image();
    var tableImage = new Image();
    var tileReady = false;
    tileImage.src = "/tiles.png";
    buttonImage.src = "/buttons.png";
    tableImage.src = "/table.png";
    tileImage.onload = function(){
        tileReady = true;
    }
    
    
    drawPlayerInformation = function(){
        //places the player name, xp, wallet, level in the top bar of the page
        $("#topbar span").text(""+game.firstname+" "+game.lastname+",   Level: "+game.level+" ("+game.experience+" experience)" + "    $"+game.wallet.toFixed(0));
    }

    drawTile = function(id,x,y){
        try{
            ctx.drawImage(tileImage,tileLocations[id][0],tileLocations[id][1],tileWidth,tileHeight,x,y,tileWidth*tileScale,tileHeight*tileScale);
        }
        catch(e){
            console.log("tile id: "+id);
        }
    }

    drawPlayerTiles = function(){

        if(game.state == "dealing" || game.state == "pair selection"){
            //if this player is active, draw his tiles
            if(game.activeSeats[game.seat]){
                for(var j = 0; j < 4; j++){
                    drawTile(game.tiles[j],seatTileLocations[game.seat][j][0],seatTileLocations[game.seat][j][1]);
                }
            }
            for(var i = 0; i < 7; i++){
                if(game.occupiedSeats[i] != 0 && i != game.seat && game.activeSeats[i] == true){
                    for(var j = 0; j < 4; j++){
                        drawTileBack(seatTileLocations[i][j][0],seatTileLocations[i][j][1]);
                    }
                }
            }
        }

        if(game.state == "tile reveal"){
            for(var i = 0; i < 7; i++){
                if(game.seatsTiles[i] != null){
                    for(var j = 0; j < 4; j++){
                        drawTile(game.seatsTiles[i][j],seatTileLocations[i][j][0],seatTileLocations[i][j][1]);
                    }
                }
            }
        }
    }

    drawDealerTiles = function(){
        if(game.state == "dealing" || game.state == "pair selection"){
            drawTileBack(dealerTileLocations[0][0],dealerTileLocations[0][1]);
            drawTileBack(dealerTileLocations[1][0],dealerTileLocations[1][1]);
            drawTileBack(dealerTileLocations[2][0],dealerTileLocations[2][1]);
            drawTileBack(dealerTileLocations[3][0],dealerTileLocations[3][1]);
        }
        else if(game.state == 'tile reveal'){
            drawTile(game.dealerTiles[0],dealerTileLocations[0][0],dealerTileLocations[0][1]);
            drawTile(game.dealerTiles[1],dealerTileLocations[1][0],dealerTileLocations[1][1]);
            drawTile(game.dealerTiles[2],dealerTileLocations[2][0],dealerTileLocations[2][1]);
            drawTile(game.dealerTiles[3],dealerTileLocations[3][0],dealerTileLocations[3][1]);
        }
    }


    drawBankerSymbol = function(){
        
        //draw the white banker symbol at appropriate location
        var position = [0,0];
        if(game.banker == -1){
            position = dealerBankerSymbolLocation;
        }
        else{
            position = bankerSymbolLocations[game.banker];
        }
        ctx.drawImage(buttonImage,bankerCropInfo[0],bankerCropInfo[1],bankerCropInfo[2],bankerCropInfo[3],position[0],position[1],25,25);
        
        //also draw the selection box for banking on players turn
        if(game.bankOnTurn){
            ctx.drawImage(buttonImage,bankerButtonInfo[2],bankerButtonInfo[3],bankerButtonInfo[0],bankerButtonInfo[1],
                          bankerSelectionInfo[0],bankerSelectionInfo[1],bankerButtonInfo[0],bankerButtonInfo[1]);
        }
        else{
            ctx.drawImage(buttonImage,bankerButtonInfo[2],bankerButtonInfo[4],bankerButtonInfo[0],bankerButtonInfo[1],
                          bankerSelectionInfo[0],bankerSelectionInfo[1],bankerButtonInfo[0],bankerButtonInfo[1]);
        }
    }

    drawTileBack = function(x,y){
        ctx.fillStyle = "#000000";
      	 ctx.drawImage(tileImage,titleBlankCropInfo[0],titleBlankCropInfo[1],tileWidth,tileHeight,x,y,tileWidth*tileScale,tileHeight*tileScale);
    }

    drawBettingButtons = function(){
        ctx.fillStyle = "#000000";
        ctx.drawImage(buttonImage,bet5CropInfo[0],bet5CropInfo[1],bet5ButtonInfo[2],bet5ButtonInfo[3],bet5ButtonInfo[0],bet5ButtonInfo[1],bet5ButtonInfo[2],bet5ButtonInfo[3]);
        ctx.drawImage(buttonImage,bet5CropInfo[0],bet5CropInfo[2],betDown5ButtonInfo[2],betDown5ButtonInfo[3],betDown5ButtonInfo[0],betDown5ButtonInfo[1],betDown5ButtonInfo[2],betDown5ButtonInfo[3]);
    }
    
    
    
    drawSelectionLockButtons = function(){
        if(game.selectionLocked){
            ctx.drawImage(buttonImage,handLockInfo[2],handLockInfo[4],handLockInfo[0],handLockInfo[1],
                          selectionLockButtonInfo[0],selectionLockButtonInfo[1],handLockInfo[0],handLockInfo[1]);   
        }
        else{
            ctx.drawImage(buttonImage,handLockInfo[2],handLockInfo[3],handLockInfo[0],handLockInfo[1],
                          selectionLockButtonInfo[0],selectionLockButtonInfo[1],handLockInfo[0],handLockInfo[1]);   
        }
    }

    drawBetLockButton = function(){
        if(game.betsLocked){
            ctx.drawImage(buttonImage,betLockInfo[2],betLockInfo[4],betLockInfo[0],betLockInfo[1],
                          betLockButtonInfo[0],betLockButtonInfo[1],betLockInfo[0],betLockInfo[1]);
        }
        else{
            ctx.drawImage(buttonImage,betLockInfo[2],betLockInfo[3],betLockInfo[0],betLockInfo[1],
                          betLockButtonInfo[0],betLockButtonInfo[1],betLockInfo[0],betLockInfo[1]);
        }

    }

    drawWagers = function(){
        ctx.fillStyle = "#000000";
        ctx.font = '20pt Calibri';
        if(game.state == "betting" && (game.seat != game.banker) ){
            ctx.fillText("$ "+game.bet,betLockButtonInfo[0]+20,betLockButtonInfo[1]+35);
           
        }
        ctx.fillText("$"+game.minimumBet,dealerTileLocations[1][0],dealerTileLocations[1][1]-10);

        for(var i = 0; i < 7; i++){
            if(game.activeSeats[i] === true && game.seatsBets[i] !== null){
                ctx.fillText("$"+game.seatsBets[i],seatTileLocations[i][1][0],seatTileLocations[i][1][1]-10);
            }
        }
    }

    drawWallets = function(){
        ctx.fillStyle = "#000000";
        ctx.font = '20pt Calibri';
        if(game.seatsWallets !== null){
            for(var i = 0; i < game.seatsWallets.length; i++){
                if(game.seatsWallets[i] !== null){
                    ctx.fillText("$"+game.seatsWallets[i].toFixed(0),seatTileLocations[i][2][0],seatTileLocations[i][2][1]-10);
                }
            }
        }
    }

    //takes a pair and highlights those tiles
    var highlightTiles = function(pair){

        for(var i = 0; i < game.tiles.length; i++){
            if(pair.indexOf(game.tiles[i]) != -1){
                //tile is selected
                ctx.fillRect(seatTileLocations[game.seat][i][0]+25,seatTileLocations[game.seat][i][1]-25,10,10);
            }
        }
    }

     // highlights the current selection (Not confirmed by server)
    var highlightSelection = function(){
        ctx.fillStyle = "#FFFF00"; //yellow
        for(var i = 0; i < game.tiles.length; i++){
            if(game.selectedTiles.indexOf(game.tiles[i]) != -1){
                //tile is selected
                ctx.drawImage(tileImage,highlightTitleInfo[0],highlightTitleInfo[1],highlightTitleInfo[2],highlightTitleInfo[3],
                									seatTileLocations[game.seat][i][0]-5,seatTileLocations[game.seat][i][1]-5,highlightTitleInfo[2]*tileScale,highlightTitleInfo[3]*tileScale);
            }
        }  

        //highlight all other players tiles
        for(var i = 0; i < game.seatsPairs.length; i++){
            if(game.seatsPairs[i] != null){
                for(var j = 0; j < game.seatsPairs[i].length; j++){
                    for(var k = 0; k < game.seatsTiles[i].length; k++){
                        if(game.seatsTiles[i][k] == game.seatsPairs[i][j]){
                            	ctx.drawImage(tileImage,highlightTitleInfo[0],highlightTitleInfo[1],highlightTitleInfo[2],highlightTitleInfo[3],
                									seatTileLocations[i][k][0]-5,seatTileLocations[i][k][1]-5,highlightTitleInfo[2]*tileScale,highlightTitleInfo[3]*tileScale);
                        }
                    }
                }
            }
        }
    }

    var highlightDealerSelection = function(){
        ctx.fillStyle = "#FFFF00";
        for(var i = 0; i < game.dealerTiles.length; i++){
            if(game.dealerSelection.indexOf(game.dealerTiles[i]) != -1){
                ctx.drawImage(tileImage,highlightTitleInfo[0],highlightTitleInfo[1],highlightTitleInfo[2],highlightTitleInfo[3],
                									dealerTileLocations[i][0]-5,dealerTileLocations[i][1]-5,highlightTitleInfo[2]*tileScale,highlightTitleInfo[3]*tileScale);
            }
        }
    }

    var drawTimer = function(){
        var d = new Date();   
        var t = (game.stateLength[game.states.indexOf(game.state)]-(d.getTime()-game.lastStateChange))
        t=t/1000;
        t = Math.round(t*10)/10
        if(t<0 || isNaN(t)){
            t = 0;
        }

        ctx.fillStyle = "#000000";
        ctx.font = '20pt Calibri';
        ctx.fillText(t,1000,50);
        
    }

    var drawPlayerPairHelp = function(){
        var text = "";
        if(game.selectedTiles.length == 2 && game.activeSeats[game.seat] === true){
            if(isPair(game.selectedTiles[0],game.selectedTiles[1])){
                text+="Pair";
            }
            else if(isWong(game.selectedTiles[0],game.selectedTiles[1])){
                text+="Wong";
            }
            else if(isGong(game.selectedTiles[0],game.selectedTiles[1])){
                text+="Gong"
            }
            else{
                text+=getNonPairValue(game.selectedTiles[0],game.selectedTiles[1]);
            }

            var other = getOtherPair(game.tiles,game.selectedTiles);

            text+="/";

            if(isPair(other[0],other[1])){
                text+="Pair";
            }
            else if(isWong(other[0],other[1])){
                text+="Wong";
            }
            else if(isGong(other[0],other[1])){
                text+="Gong"
            }
            else{
                text+=getNonPairValue(other[0],other[1]);
            }

            ctx.fillStyle = "#000000";
            ctx.font = '20pt Calibri';
            ctx.fillText(text,seatTileLocations[game.seat][1][0],seatTileLocations[game.seat][1][1]+tileHeight*tileScale+30);
        }

        //display pair help during tile reveal for all players
        if(game.state == 'tile reveal'){
            for(var i = 0; i < game.seatsTiles.length; i++){
                if(game.activeSeats[i] == true){
                    var text = "";
                    if(isPair(game.seatsPairs[i][0],game.seatsPairs[i][1])){
                        text+="Pair";
                    }
                    else if(isWong(game.seatsPairs[i][0],game.seatsPairs[i][1])){
                        text+="Wong";
                    }
                    else if(isGong(game.seatsPairs[i][0],game.seatsPairs[i][1])){
                        text+="Gong"
                    }
                    else{
                        text+=getNonPairValue(game.seatsPairs[i][0],game.seatsPairs[i][1]);
                    }

                    var other = getOtherPair(game.seatsTiles[i],game.seatsPairs[i]);

                    text+="/";

                    if(isPair(other[0],other[1])){
                        text+="Pair";
                    }
                    else if(isWong(other[0],other[1])){
                        text+="Wong";
                    }
                    else if(isGong(other[0],other[1])){
                        text+="Gong"
                    }
                    else{
                        text+=getNonPairValue(other[0],other[1]);
                    }
                    ctx.fillStyle = "#000000";
                    ctx.font = '20pt Calibri';
                    ctx.fillText(text,seatTileLocations[i][1][0],seatTileLocations[i][1][1]+tileHeight*tileScale+30);
                }
            }
        }
    }

    var drawDealerPairHelp = function(){
        var text = "";
        if(game.dealerSelection.length == 2){
            if(isPair(game.dealerSelection[0],game.dealerSelection[1])){
                text+="Pair";
            }
            else if(isWong(game.dealerSelection[0],game.dealerSelection[1])){
                text+="Wong";
            }
            else if(isGong(game.dealerSelection[0],game.dealerSelection[1])){
                text+="Gong"
            }
            else{
                text+=getNonPairValue(game.dealerSelection[0],game.dealerSelection[1]);
            }

            var other = getOtherPair(game.dealerTiles,game.dealerSelection);

            text+="/";

            if(isPair(other[0],other[1])){
                text+="Pair";
            }
            else if(isWong(other[0],other[1])){
                text+="Wong";
            }
            else if(isGong(other[0],other[1])){
                text+="Gong"
            }
            else{
                text+=getNonPairValue(other[0],other[1]);
            }

            ctx.fillStyle = "#000000";
            ctx.font = '20pt Calibri';
            ctx.fillText(text,dealerTileLocations[3][0],dealerTileLocations[3][1]+tileHeight*tileScale+30);
        }
    }

    drawExitButton = function(){
        ctx.fillStyle = "#000000";
        ctx.drawImage(buttonImage,exitButtonInfo[4],exitButtonInfo[5],exitButtonInfo[2],exitButtonInfo[3],exitButtonInfo[0],exitButtonInfo[1],exitButtonInfo[2],exitButtonInfo[3]);
       
    }
    
    drawTimerBar= function(){ 
    
    	  var d1 = new Date();
    	  var m1 = game.stateLength[game.states.indexOf(game.state)]/1000;
        var t1 = (game.stateLength[game.states.indexOf(game.state)]-(d1.getTime()-game.lastStateChange))
        t1=t1/1000;
        t1 = Math.round(t1*10)/10
        if(t1<0 || isNaN(t1)){
            t1 = 0;
        }
          	
    	  ctx.fillStyle = "FF0000";
    	  var timerBarInfo = [140,293,410,60,340,230]; //xcrop, ycrop, width, height, xcord, ycord  
    	  ctx.drawImage(buttonImage,timerBarInfo[0],timerBarInfo[1],timerBarInfo[2],timerBarInfo[3],timerBarInfo[4],timerBarInfo[5],timerBarInfo[2],timerBarInfo[3]);
    	  ctx.fillRect(timerBarInfo[4]+5,timerBarInfo[5]+5,(timerBarInfo[2]-10)*(t1/m1),timerBarInfo[3]-10); 
    }
    
    drawMuteButton = function(){
    		
         if(unmute)    									  
    			ctx.drawImage(buttonImage,muteButtonInfo[4],muteButtonInfo[5],muteButtonInfo[0],muteButtonInfo[1],muteButtonInfo[2],muteButtonInfo[3],muteButtonInfo[0],muteButtonInfo[1]);
    		else 
    		   ctx.drawImage(buttonImage,muteButtonInfo[4],muteButtonInfo[6],muteButtonInfo[0],muteButtonInfo[1],muteButtonInfo[2],muteButtonInfo[3],muteButtonInfo[0],muteButtonInfo[1]);
    			
    }

    render = function(){
        
        if(game.accountExists === -1){
            ctx.fillStyle = "#000000";
            ctx.font = '20pt Calibri';
            ctx.fillText("Invalid account",400,270);
        }
        else{
            //Fill background
            ctx.fillStyle = "#F0FFFF";
            ctx.fillRect(0,0,c.width,c.height);
            ctx.drawImage(tableImage,0,0,c.width,c.height); 
					
         
    			drawTimerBar();
            //Draw game state
            ctx.fillStyle = "#000000";
            ctx.font = '20pt Calibri';
            ctx.fillText("State: "+game.state,400,270);
				if(game.state == "dealing" && unmute && game.playedShuffleSoundOnce === false)
				{	                   				
						  shuffle.play();
                    game.playedShuffleSoundOnce = true;
				}
				if(game.state == "betting" && (game.seat != game.banker))
				{
            	drawBetLockButton();
           	   drawBettingButtons();
            }
            if(game.state == "pair selection")
            {
            	drawSelectionLockButtons();
				}
            ctx.fillStyle = "#000000";
            ctx.font = '20pt Calibri';
            ctx.fillText("Wallet: "+game.wallet.toFixed(0),10,c.height-20);

           

            drawBankerSymbol();

            if(tileReady){
                drawPlayerTiles();
                drawDealerTiles();

            }
            
            highlightSelection();
            highlightDealerSelection();
            // drawTileBack(50,50);
            
            

            if(!game.playerActive){
                ctx.fillStyle = "#000000";
                ctx.font = "30px Arial";
                ctx.fillText("INSUFFICIENT FUNDS",450,350);
            }

            //drawTimer();
            drawPlayerPairHelp();
            drawDealerPairHelp();
            drawWagers();
            drawWallets();

            if(game.activeSeats[game.seat] == false){
                //Let the player know he is inactive
                ctx.fillStyle = "#000000";
                ctx.font = "30px Arial";
                ctx.fillText("Waiting for start of next round",450,350);
            }
    		   drawMuteButton();
            drawExitButton();
        }
    }

    setInterval(function(){
        render();
    },100);
});

var dots = [3,6,12,12,2,2,8,8,4,4,10,10,6,6,4,4,11,11,10,10,7,7,6,6,9,9,8,8,7,7,5,5];
var tileNames = ["Gee Joon","Gee Joon","Teen","Teen","Day","Day","Yun","Yun","Gor","Gor","Mooy","Mooy","Chong","Chong","Bon","Bon","Foo","Foo","Ping","Ping","Tit","Tit","Look","Look","Chop Gow","Chop Gow","Chop Bot","Chop Bot","Chop Chit","Chot Chit","Chop Ng","Chop Ng"];
var ranks = [1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,14,14,15,15,16,16];

var tileDivNames = ["#one","#two","#three","#four"];

if(game.accountExists !== false){
    var socket = io.connect(window.location.origin,{query:'email='+email});
}
var wallet = 0;
var bet = 0;



game['wallet'] = 0;
game['bet'] = 0;
game['minimumBet'] = 0;
game['betsLocked'] = false;
game['state'] = "pregame";
game['states'] = ['pregame', 'betting', 'dealing', 'pair selection',
                  'tile reveal', 'endgame'];
game['stateChangeTime'] = 5000;
game['lastStateChange'] = 0;
game['banker'] = -1;
game['tiles'] = [];
game['selectedTiles'] = [];
game['selectionLocked'] = false;
game['clickedTiles'] = [];  //Contains the index 0-3 of the tile that was clicked
game['lastConfirmedSelection'] = []; //the last verified valid selection, is used if the player ends selection phase unlocked
game['dealerTiles'] = [];
game['dealerSelection'] = [];
game['bankOnTurn'] = true; //whether the player elects to bank or not
game['playerActive'] = true;
game['seat'] = 0;
game['occupiedSeats'] = [];
game['seatsTiles'] = []; //contains the tiles dealt to each seat
game['seatsPairs'] = [];
game['activeSeats'] = [false,false,false,false,false,false,false];
game['seatsBets'] = [null,null,null,null,null,null,null];  //the value of the bet the person at each seat has made. null if not an active seat
game['seatsWallets'] = [null,null,null,null,null,null,null];
game['stateLength'] = [];
game['exitOnRoundEnd'] = false;
game['accountExists'] = 0;
game['playedShuffleSoundOnce'] = false;
game['level'] = 0;
game['experience'] = 0;
game['firstname'] = "";
game['lastname'] = "";
game['exit'] = false;   //Used for leaving the window

var updateGameInfo = function(){
    //Prints seconds remaining, game state, etc
    var d = new Date();
    var t = (game.stateChangeTime-(d.getTime()-game.lastStateChange))
    t=t/1000;
    if(t<0){
        t = 0;
    }
    $("#gameInformation").empty();
    $("#gameInformation").html("Seconds remaining: "+t+"<br>Game state: "+game.state+"<br>Current bet: $"+game.bet+"<br>Wallet: $"+game.wallet+"<br>Tile selection: "+game.selectedTiles+"<br>Banker: "+game.banker);

}

//called to reset all information to begin a new game
function resetGameInfo(){
    game.bet = game.minimumBet;
    game.betsLocked = false;
    game.tiles = [];
    game.selectedTiles = [];
    game.selectionLocked = false;
    game.lastConfirmedSelection = [];
    game.dealerTiles = [];
    // resetTileDivs();
    game.clickedTiles = [];
    game.dealerSelection = [];
    game.seatsTiles = [];
    game.seatsPairs = [];
    game.seatsBets = [null,null,null,null,null,null,null];
}

function resetTileDivs(){
    var divs = $('#one, #two, #three, #four');
    for(var i = 0; i < divs.length; i++){
        divs.eq(i).empty();
        divs.eq(i).removeClass('tileSelected').addClass('tile');
    }
}

$(function(){   //document is ready
    socket.on('connection acknowledgment',function(wallet,bet,time,banker,seat,active,wallets){
        game.lastStateChange = time;
        game.bet = bet;
        game.minimumBet = bet;
        game.wallet = wallet;
        game.banker = banker;
        game.seat = seat;
        game.activeSeats = active;
        game.seatsWallets = wallets;
        game.accountExists = 1;
        // $("#messages").prepend("<li>Got a connection from the server</li>");
        updateGameInfo();
    });
    socket.on('bet lock confirm',function(bet){
        // $("#messages").prepend("<li>Server confirms bet lock at $"+bet+"</li>");
    });
    socket.on('bet unlock confirm',function(){
        // $("#messages").prepend("<li>Server confirms bet unlock.</li>");
    });

    // Handle state changes
    socket.on('game state change',function(state,time){
        game.state = state;
        if(state == "dealing" && !game.betsLocked && game.activeSeats[game.seat] == true){
            socket.emit("bet locked",game.bet);
            game.betsLocked = true;
            game.playedShuffleSoundOnce = false;
        }
        if(state == "pregame"){
            game.bet = game.minimumBet;
        }
        if(state == "tile reveal"){
            game.selectionLocked = true;
            if(game.selectedTiles.length != 2 && game.selectionLocked == false && game.activeSeats[game.seat] == true){
                if(game.lastConfirmedSelection.length == 2){
                    //the user had perviously locked with a valid selection, reapply this selection
                    game.selectedTiles = game.lastConfirmedSelection;
                }
                else{
                    //the user has not locked anything, and doesn't have two tiles selected. Apply default.
                    game.selectedTiles = [game.tiles[0],game.tiles[1]];
                }
                socket.emit('tile selection',game.selectedTiles);
            }
            else if(game.selectionLocked == false && game.activeSeats[game.seat] == true){
                //player hasn't locked, but has two tiles highlighted
                //consider changing this logic, do we want to use the two selected, or the last locked in pair?
                game.selectedTiles = game.lastConfirmedSelection;
                socket.emit('tile selection', game.selectedTiles);
            }
            else{
                if(game.activeSeats[game.seat] == true){
                    socket.emit('tile selection', game.selectedTiles);
                }
            }
        }
        if(state == 'endgame'){
            resetGameInfo();
            if(game.exitOnRoundEnd){
                socket.disconnect();
                window.location.replace("./exitPage.html");
            }
        }
        game.lastStateChange = time;
        updateGameInfo();
        // $("#messages").prepend("<li>Game state changed to "+state+"</li>");
    });

    socket.on('confirm tile selection',function(pair){
        // $("#messages").prepend("<li>Server confirms pair selection: "+pair+"</li>");
        game.lastConfirmedSelection = pair;
        //on the confirmation, change the highlighted tiles
    });

    socket.on('finalize tile selection',function(pair){
        // $("#messages").prepend("<li>Server finalizes pair selection: "+pair+"</li>");
        game.lastConfirmedSelection = pair;
        game.selectedTiles = pair;
    });

    socket.on('player dealt',function(tile){
        game.tiles.push(tile);
        // $("#messages").prepend("<li>Player dealt tile "+tile+"</li>");
    });
    socket.on('other player tiles',function(id,tiles,pair){
        // $("#messages").prepend("<li>Player \'"+id+"\' dealt tile "+tiles+" and selected pair "+pair+"</li>");
        if(id == 'dealer'){
            game.dealerTiles = tiles;
            game.dealerSelection = pair;
        }
        else{
            for(var i = 0; i < 7; i++){
                if(game.occupiedSeats[i] == id){
                    game.seatsTiles[i] = tiles;
                    game.seatsPairs[i] = pair;
                }
            }
        }
    });
    socket.on('confirm selection locked',function(pair){
        game.lastConfirmedSelection = pair;
        // $("#messages").prepend("<li>Server confirms pair locked: "+pair+"</li>");
    });
    socket.on('confirm selection unlocked',function(){
        // $("#messages").prepend("<li>Server confirms pair unlocked</li>");
    });
    socket.on('wallet update',function(wallet){
        // $("#messages").prepend("<li>Wallet update: "+wallet+"</li>");
        game.wallet = wallet;
    });
    socket.on('match result',function(result){
    
    		//$("#messages").prepend("<li>Seat = "+game.seat+" Banker = "+game.banker+"</li>");
    		
        if(result == 'push'){
            // $("#messages").prepend("<li>Matched ended in a push</li>");
            drawSound.play();
        }
        if(result == 'banker win'){
            // $("#messages").prepend("<li>Banker win</li>");
            if(game.seat != game.banker)
            	loseSound.play();
            else
            	winSound.play();
        }
        if(result == 'opponent win'){
            // $("#messages").prepend("<li>Opponent win</li>");
            if(game.seat != game.banker)
            	winSound.play();
            else 
            	loseSound.play();
        }
    });
    // Information about the game from the server
    socket.on('pregame game information',function(banker,active,stateLength){
        game.banker = banker;
        game.activeSeats = active;
        game.stateLength = stateLength;
        console.log(game.activeSeats);
    });
    // Server informs client that he doesnt have enough money to continue
    socket.on('insufficient funds',function(){
        game.playerActive = false;
    });
    // Server informs client of a connection or disconnection
    socket.on('occupied seats',function(occupied){
        game.occupiedSeats = occupied;
    });
    socket.on('seats bets',function(seatsBets){
        game.seatsBets = seatsBets;
        console.log("seatsBets"+seatsBets);
    });
    socket.on('seats wallets',function(seatsWallets){
        game.seatsWallets = seatsWallets;
        console.log("seats wallets: "+seatsWallets);
    });
    //Called when the server wants to notify the client of a connection or disconnection
    socket.on('active players update',function(seats){
        game.activeSeats = seats;
    });
    //Called when the server cant find this players account
    socket.on('no account',function(){
        game.accountExists = -1;
    });

    socket.on('duplicate account',function(){
        game.accountExists = -1;
    });
    socket.on('player info update',function(wallet,level,xp,first,last){
        game.level = level;
        game.experience = xp;
        game.firstname = first;
        game.lastname = last;
        drawPlayerInformation();

    });
    socket.on('table removed',function(){
        game.exit = true;
        window.location.replace("./destroyedTablePage.html");
    });

    setInterval(function(){
        updateGameInfo();
    },50);

    //Listener for the canvas
    $("#game").click(function(e){
        var x = Math.floor((e.pageX-$("#game").offset().left));
        var y = Math.floor((e.pageY-$("#game").offset().top));
        console.log(x+" "+y);

        // Bet +5
        if(x>bet5ButtonInfo[0] && x<bet5ButtonInfo[0]+bet5ButtonInfo[2] && y>bet5ButtonInfo[1] && y < bet5ButtonInfo[1]+bet5ButtonInfo[3]){
            //the bet 5 button has been clicked
            console.log("bet +5 button clicked");
            if(game.betsLocked || game.state != "betting" || game.banker == game.seat){
                //do nothing
            }
            else if(game.wallet >= game.bet+5){

                //check if bet exceeds maximum
                var numActivePlayers = 1;
                for(var j = 0; j < game.activeSeats.length; j++){
                    if(game.activeSeats[j] === true){
                        numActivePlayers++;
                    }
                }
                if(game.banker === -1 || game.bet+5 <= game.seatsWallets[game.banker]/(numActivePlayers-1)){
                    game.bet = game.bet+5;
                    betUp.play();
		            
                }
            }
            updateGameInfo();
        }
        
        
        // Bet -5
         if(x>betDown5ButtonInfo[0] && x<betDown5ButtonInfo[0]+betDown5ButtonInfo[2] && y>betDown5ButtonInfo[1] && y < betDown5ButtonInfo[1]+betDown5ButtonInfo[3]){
            //the bet 5 button has been clicked
            console.log("bet -5 button clicked");
            if(game.betsLocked || game.state != "betting" || game.banker == game.seat){
                //do nothing
            }
            else if(game.wallet >= game.bet+5 && game.bet > 5){
               game.bet = game.bet-5;
               
		         betDown.play();
		          
            }
            updateGameInfo();
        }
        

        // Bet lock button
        if(x>betLockButtonInfo[0] && x<betLockButtonInfo[0]+betLockInfo[0] && y > betLockButtonInfo[1] && y < betLockButtonInfo[1]+betLockInfo[1]){
            if(game.state == "betting" && game.banker != game.seat){
                console.log(game.betsLocked);
               
		              clicked.play();
		          		          
                if(!game.betsLocked){
                    socket.emit("bet locked",game.bet);
                    game.betsLocked = true;
                }
                else{
                    game.betsLocked = false;
                    socket.emit("bet unlocked");
                }
            }
        }

        // Pair lock button
        if(x>selectionLockButtonInfo[0] && x<selectionLockButtonInfo[0]+handLockInfo[0] && y>selectionLockButtonInfo[1] && y < selectionLockButtonInfo[1]+handLockInfo[1] && game.activeSeats[game.seat] === true){
            console.log("clicked on pair lock button");
            if(game.state == "pair selection"){            
              				
		              clicked.play();
		          		          
                if(!game.selectionLocked){
                    if(game.state == "pair selection" && game.selectedTiles.length == 2 && !game.selectionLocked){
                        game.selectionLocked = true;
                        socket.emit('pair selection locked',game.selectedTiles);
                    }
                }
                else{
                    if(game.state == "pair selection" && game.selectionLocked){
                        game.selectionLocked = false;
                        socket.emit('pair selection unlocked');
                    }
                }
            }
        }

        // Clicking on tiles
        for(var i = 0; i < 4; i++){
            if(x>seatTileLocations[game.seat][i][0] && x<seatTileLocations[game.seat][i][0]+tileWidth*tileScale && y>seatTileLocations[game.seat][i][1] && y < seatTileLocations[game.seat][i][1]+tileHeight*tileScale){
                console.log("clicked on "+i);
                
                clicked.play();
                
                if(game.state == "pair selection" && !game.selectionLocked){
                    // Tile i was clicked on and its state should flip
                    if(game.clickedTiles.indexOf(i) != -1){
                        // It was previously selected, and should be unselected
                        var index = game.clickedTiles.indexOf(i);
                        game.clickedTiles.splice(index,1);
                        var index = game.selectedTiles.indexOf(game.tiles[i]);
                        game.selectedTiles.splice(index,1);
                    }
                    else{
                        // Select tile i
                        game.selectedTiles.push(game.tiles[i]);
                        game.clickedTiles.push(i);
                    }
                }
            }
        }

        // Click on banker selection button
        if(x>bankerSelectionInfo[0] && x<bankerSelectionInfo[0]+bankerButtonInfo[0] && y>bankerSelectionInfo[1] && y<bankerSelectionInfo[1]+bankerButtonInfo[1]){
     	    
	              clicked.play();
	          
            if(game.bankOnTurn){
                game.bankOnTurn = false;
                socket.emit('bank on turn',false);
            }
            else{
                game.bankOnTurn = true;
                socket.emit('bank on turn',true);
            }
        }
     
                                           
        //mute button 
        if(x>muteButtonInfo[2] && x<muteButtonInfo[2]+muteButtonInfo[0] && y>muteButtonInfo[3] && y<muteButtonInfo[3]+muteButtonInfo[1])
        {
        		if(unmute)
        		{
        			unmute = false;
        			Howler.mute(); 
        		}
        		else 
        		{
        			unmute = true;
               Howler.unmute();
	             clicked.play();
        		}
        }

        //Exit button
        if(x>exitButtonInfo[0] && x<exitButtonInfo[0]+exitButtonInfo[2] && y>exitButtonInfo[1] && y<exitButtonInfo[1]+exitButtonInfo[3]){
            console.log("exit button clicked");
           
	              clicked.play();
	          
            if(game.exitOnRoundEnd === true){
                game.exitOnRoundEnd = false;
            }
            else{
                game.exitOnRoundEnd = true;
                alert("You will be removed from the table at the end of the round");
            }
            // $("#messages").prepend("<li>Exit at end of round: "+game.exitOnRoundEnd+"</li>");
        }
    });
});

window.onbeforeunload = function() {
    if(game.exit){

    }
    else{
        if(game.state != "endgame"){
            return "Please don't exit the game while it is in progress";
        }
    }
}
