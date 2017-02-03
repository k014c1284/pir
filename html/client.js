var socket = io();
socket.on("response", (data) => {
	console.log("response");
});

function onClick(){
	socket.emit("command", {target: "aaa", button: "onoff"});
}
