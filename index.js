// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);


// S03. HTTPサーバにソケットをひも付ける（WebSocket有効化）
var io = require('socket.io').listen(server);
var port = process.env.PORT || 3000;


var fs = require("fs");
var xml2js = require("xml2js");

// var net = require('net');
// var client = net.createConnection(10500, 'localhost', function()
// {
//     console.log('connected.');
// });
//
// client.on('data', function(data){
//     xml2js.parseString(data.toString(),(err,result)=> {
//       if(err) {
//         console.log(err);
//       }else{
//         console.log(result.RECOGOUT.WHYPO.WORD[0]);
//       }
//     });
//     client.end();
// });
//
// client.on('end', function()
// {
//     console.log('disconnected.');
// });




// const execs = require('child_process').exec;
// execs('julius -C fast.jconf -module', (err, stdout, stderr) => {
//   if (err) { console.log(err); }
// console.log(stdout);
// });


fs.readFile("test.xml", (err, data)=> {
	xml2js.parseString(data.toString(), (err, result)=> {
		if(err) {
			console.log(err);
		} else {
			console.log(result);
			console.log(result.root.hoge1["word"]);		// 配列になってる
			console.log(result.root.hoge2[0]);		// 配列になってる
		}
	});
});


var net = require('net');

var server = net.createServer(function(conn){
  console.log('server-> tcp server created');

  conn.on('data', function(data){
    console.log('server-> ' + data + ' from ' + conn.remoteAddress + ':' + conn.remotePort);
    conn.write('server -> Repeating: ' + data);
  });
  conn.on('close', function(){
    console.log('server-> client closed connection');
  });
}).listen(3000);

console.log('listening on port 3000');

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));


// S04. connectionイベント・データを受信する
io.sockets.on('connection', function(socket) {
    // S05. client_to_serverイベント・データを受信する
    socket.on('client_to_server', function(data) {
      const exec = require('child_process').exec;
      exec('echo hello >> sample.txt', (err, stdout, stderr) => {
        if (err) { console.log(err); }
      console.log(stdout);
      });
        // S06. server_to_clientイベント・データを送信する
        //io.sockets.emit('server_to_client', {value : data.value});
    });
    // S07. client_to_server_broadcastイベント・データを受信し、送信元以外に送信する
    socket.on('client_to_server_broadcast', function(data) {
        socket.broadcast.emit('server_to_client', {value : data.value});
    });
});
