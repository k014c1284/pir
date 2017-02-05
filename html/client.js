var socket = io();
socket.on("response", (data) => {
	console.log("response");
});

function onTapButton(target, button){
	socket.emit("command", {target: target, button: button});
}
