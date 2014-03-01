var http = require('http'),
	sio = require('socket.io'),
	index = require('fs').readFileSync(__dirname+'/index.html')


var app = http.createServer(function(req,res){
	res.writeHead(200,{'content-Type':'text/html'});
	res.end(index);
}), io=sio.listen(app);

app.listen(3000);


