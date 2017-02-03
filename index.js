var express = require('express');
var fs = require("fs");
var http = require("http");
var julius = new (require("./julius"));
var ir = new (require("./ir"));

var app = express();
var server = http.createServer(app);
var io = require("socket.io")(server);

io.sockets.on("connection", (socket) => {
	console.log("Connected");
	socket.on("command", (data) => {
		console.log(data);
		if(data.target != null && data.button != null){
			ir.send(data.target, data.button);
			socket.emit("response", {});
		}
	});
});

/*
残タスク
socket.ioイベント定義
クライアント側HTMLコーディング
クライアント側JSコーディング
Juliusへの接続
Juliusから来た単語の解析とアクション
LIRCの調査
基板の作成
システム起動用のスクリプト

*/

var mdlRouter = express.static(__dirname + "/node_modules/material-design-lite");

app.use("/mdl", mdlRouter);
app.get("/", (req, res) => res.sendFile(__dirname + "/html/index.html"));
app.get("/:fileName", (req, res) => {
	var path = __dirname + "/html/" + req.params.fileName;
	if(fs.existsSync(path)){
		//相対パス変換で行けるかも
		//ホストアドレスを埋め込んでHTMLを返す
		res.sendFile(path);
	}else{
		//ないです
		res.sendStatus(404);
	}
});

server.listen(14514);
