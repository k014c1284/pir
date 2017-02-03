var xml2json = require("xml2json");
var net = require("net");
var EventEmitter = require("events");

module.exports = function(){
	var eventEmitter = new EventEmitter();
	var text = "";
	var socket = net.connect(1919, "localhost", () => {
		console.log("Connected to Julius");
	});

	socket.on("error", (error) => {
		console.log("Cannot Connect");
	});
	
	socket.on("data", (data) => {
		var str = data.toString();
		var lines = str.split("\n");
		
		lines.forEach((line) => {
			if(line == "."){
				try{
					var json = xml2json.toJson(text.replace("</s>", "&lt;/s&gt;").replace("<s>", "&lt;s&gt;"));
					console.log(json);
					text = "";
				}catch(e){
					console.log("\n-----error-----\n" + text + "\n-----error-----\n");
					text = "";
				}
			}else{
				text = text + line;
			}
		});
	});

	this.on = function(name, callback){
		eventEmitter.on(name, callback);
	};

	this.pause = function(){
		socket.write("TERMINATE\n");
	};

	this.resume = function(){
		socket.write("RESUME\n");
	};
}
