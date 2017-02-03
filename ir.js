var execSync = require("child_process").execSync;
var fs = require("fs");

module.exports = function(){
	var database = {};

	this.send = function(target, button){
		for(key in database){
			if(key == target && database[key].find(button) != -1){
				var result = execSync("irsend SEND_ONCE " + target + " " + button);
				return true;
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
	}

	var targets = execSync("irsend LIST \"\" \"\"")
		.toString()
		.split("\n")
		.filter((line) => line != null && line != "")
		.map((line) => line.split(" ")[1]);

	targets.forEach((target) => {
		database[target] = execSync("irsend LIST " + target + " \"\"")
			.toString()
			.split("\n")
			.filter((line) => line != null && line != "")
			.map((line) => line.split(" ")[2]);
	});
};
