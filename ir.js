var spawnSync = require("child_process").spawnSync;
var execSync = require("child_process").execSync;
var fs = require("fs");

module.exports = function(){
	var database = {};

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

	this.startLearning = function(target, callback){
		
	};

	try{
		//var targets = "A A\nB B\nC C\n"
		var process = spawnSync("irsend LIST \"\" \"\"");
		var targets = process.stdout
			.toString()
			.split("\n")
			.filter((line) => line != null && line != "")
			.map((line) => line.split(" ")[1]);
		
		targets.forEach((target) => {
			//database[target] = "A A A\nB B B\nC C C\n"
			process = spawnSync("irsend LIST " + target + " \"\"");
			database[target] = process.stdout
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
