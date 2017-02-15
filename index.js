var express = require('express');
var fs = require("fs");
var http = require("http");
var julius = new (require("./julius"));
var ir = new (require("./ir"));

var app = express();
var server = http.createServer(app);
var io = require("socket.io")(server);

io.sockets.on("connection", (socket) => {
	console.log("New socket.io client connected");
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
Juliusから来た単語の解析とアクション
LIRC学習
システム起動用のスクリプト
*/

function getControllerTabContents(){
	var targets = ir.getTargets();
	var html = "";
	for(var i = 0; i < targets.length; i++){
		html = html +
			"<section class=\"mdl-layout__tab-panel" +
			(i ? "" : " is-active") + "\" id=\"scroll-tab-" + (i + 1) + "\">\n" +
			"<div class=\"mdl-grid\">\n";

		var buttons = ir.getButtons(targets[i]);
		for(var j = 0; j < buttons.length; j++){
			html = html +
				"<div class=\"mdl-cell mdl-cell--2-col\">\n" +
				"<button " +
				"class=\"mdl-button mdl-js-button mdl-button--raised mdl-button--colored mdl-js-ripple-effect\" " +
				"onclick=\"onTapButton('" + targets[i] + "', '" + buttons[j] + "')\">" +
				buttons[j] +
				"</button>\n" +
			"</div>\n";
		}
		html = html + "</div>\n</section>\n";
	}
	return html;
}

function getControllerTabs(){
	var targets = ir.getTargets();
	var html = "";
	for(var i = 0; i < targets.length; i++){
		html = html +
			"<a href=\"#scroll-tab-" + (i + 1) + "\" class=\"mdl-layout__tab" +
			(i ? "" : " is-active") + "\">" + targets[i] + "</a>\n";
	}
	return html;
}

function getIndexHtml(){
	var baseFile = fs.readFileSync(__dirname + "/html/index.html").toString();
	baseFile = baseFile.replace("<!-- Replace to tab header -->", getControllerTabs());
	baseFile = baseFile.replace("<!-- Replace to tab content -->", getControllerTabContents());
	return baseFile;
}

var mdlRouter = express.static(__dirname + "/node_modules/material-design-lite");

app.use("/mdl", mdlRouter);
app.get("/", (req, res) => {
	res.type("html");
	res.send(getIndexHtml());
});

app.get("/:fileName", (req, res) => {
	var path = __dirname + "/html/" + req.params.fileName;
	if(fs.existsSync(path)){
		if(/index\.html/ig.test(req.params.fileName)){
			res.type("html");
			res.send(getIndexHtml());
		}else res.sendFile(path);
	}else{
		//ないです
		res.sendStatus(404);
	}
});

server.listen(14514);
julius.on("recogout", (sentence) => {
	console.log(sentence);
	if(sentence.indexOf(/暑い|熱い|厚い|アツい|あつい/ig) != -1){
		ir.send("プロジェクター", "Menu");
	}
});
