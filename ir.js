var spawnSync = require("child_process").spawnSync;
var execSync = require("child_process").execSync;
var spawn = require("child_process").spawn;
var fs = require("fs");
var EventEmitter = require("events");

module.exports = function(){
	var eventEmitter = new EventEmitter();
	var database = {};
	var learningSucceeded = false;

	this.send = function(target, button){
		for(key in database){
			if(key == target && database[key].indexOf(button) != -1){
				try{
					var result = execSync("irsend SEND_ONCE " + target + " " + button);
					return true;
				}catch(e){
					console.log("Couldn't send ir command");
					return false;
				}
			}
		}
		return false;
	};

	this.getTargets = function(){
		var result = [];
		for(key in database){
			result.push(key);
		}
		return result;
	};

	this.getButtons = function(target){
		for(key in database){
			if(key == target) return database[key];
		}
		return null;
	};

	this.on = function(eventName, callback){
		eventEmitter.on(eventName, callback);
	};

	this.startLearning = function(target, button){
		try{
			var name = target + "_" + button;
			execSync("sudo service lirc stop");
			
			var process = spawn("irrecord", ["-n", "-f", "-d", "/dev/lirc0", name + ".conf"]);
			process.stdout.on("data", (data) => {
				var str = data.toString();
				if(str.indexOf("Press RETURN to continue.") != -1){
					process.stdin.write("\n");
					process.stdin.end();
				}else if(str.indexOf("Press RETURN now to start recording.") != -1){
					process.stdin.write("\n");
					process.stdin.end();
				}else if(str.indexOf("irrecord: gap not found, can't continue") != -1){
					console.log("Capture failed.");
					eventEmitter.emit("error", new Error("Capture failed."));
				}else if(str.indexOf("Please enter the name for the next button (press <ENTER> to finish recording)") != -1){
					eventEmitter.emit("calibrated");
					setTimeout(() => process.stdin.write(button + "\n\n"), 1000);
				}
			});
			
			process.on("exit", (code, signal) => {
				var succeeded = fs.existsSync(name + ".conf") && fs.statSync(name + ".conf").stats["size"] > 0;
				if(succeeded){
					execSync("sudo sh -c \"echo #" + name + " | cat - " + name + ".conf >> /etc/lirc/lircd.conf\"");
					execSync("sudo sh -c \"echo #" + name + " >> /etc/lirc/lircd.conf\"");
				}
				execSync("sudo service lirc start");
				eventEmitter.emit("learncomplete", succeeded);
			});
			
		}catch(e){
			console.log(e);
		}
	};

	this.deleteButton = function(target, button){
		try{
			var content = fs.readFileSync("/etc/lirc/lircd.conf");
			var name = target + "_" + button;
			fs.writeFileSync("temp.conf", content.replace(new RegExp(name + ".+" + name, "ig"), ""));
			execSync("sudo sh -c \"cat temp.conf > /etc/lirc/lircd.conf\"");
			execSync("sudo service lirc restart");
			fs.unlinkSync("temp.conf");
		}catch(e){
			console.log(e);
		}
	};

	try{
		//var targets = "A A\nB B\nC C\n"
		var process = spawnSync("irsend", ["LIST", "", ""]);
		var commandList = process.stderr
			.toString()
			.split("\n")
			.filter((line) => line != null && line != "")
			.map((line) => line.split(" ")[1]);
		
		
		targets.forEach((target) => {
			//database[target] = "A A A\nB B B\nC C C\n"
			process = spawnSync("irsend", ["LIST", target, ""]);
			database[target] = process.stderr
				.toString()
				.split("\n")
				.filter((line) => line != null && line != "")
				.map((line) => line.split(" ")[2]);
		});
	}catch(e){
		console.log("Couldn't get ir list");
	}
	console.log(database);
};
