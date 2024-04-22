const express = require('express');
const app = express();
var rooms = [];
const http = require('http');
var hosts = [];
const server = http.createServer(app);
const io = require("socket.io")(server);
io.on("connection", socket=> {
	socket.on("newroom",r =>{
		if(rooms.includes(r)) socket.emit("taken");
		else{
			rooms.push({room: r, people: 0, correct: 0});
			hosts.push(socket);
			socket.join(r);
			socket.emit("start");
			
		}
	});
	socket.on("g", ()=> {
		socket.broadcast.emit("game");
	})
	socket.on("roomname", r=> {
		var check = false;
		rooms.forEach(room=> {
			if(room.room === r){
				check = true;
			}
		})
		if(check)
		{		
			socket.join(r);
			socket.emit("number", Math.floor(Math.random()* 10));
			rooms.find((roo) => roo.room === Array.from(socket.rooms)[1]).people++;
			console.log(rooms.find((roo) => roo.room === Array.from(socket.rooms)[1]).people)
			hosts.forEach(h=> {
				if(Array.from(h.rooms)[1] === Array.from(socket.rooms)[1]){
					h.emit("player", rooms.find((roo) => roo.room === Array.from(socket.rooms)[1]).people);
				}
			})
		}
	})
	socket.on("host", (num)=> {
		hosts.forEach(h=> {
			if(h.rooms[1] === Array.from(socket.rooms)[1]){
				h.emit("num", num);
			}
		})
	})
	socket.on("finish", async data=> {
		var ss = await io.in(Array.from(socket.rooms)[1]).fetchSockets();
		console.log(ss);
		ss[Math.floor(Math.random()* ss.length)].emit("other", data);
	rooms.find((roo) => roo.room === Array.from(socket.rooms)[1]).correct++;
		console.log(rooms.find((roo) => roo.room === Array.from(socket.rooms)[1]).correct)
		if(rooms.find((roo) => roo.room === Array.from(socket.rooms)[1]).correct === rooms.find((roo) => roo.room === Array.from(socket.rooms)[1]).people){
			console.log("finished game");
			hosts.forEach(h=> {
				console.log(Array.from(h.rooms)[1]);
				if(Array.from(h.rooms)[1] === Array.from(socket.rooms)[1]){
					h.emit("done");
				}
			})
		}
})

})
app.use(express.static(__dirname));

server.listen(3000, () => {
	console.log('listening on *:3000');
});