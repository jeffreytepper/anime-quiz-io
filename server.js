const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const crypto = require('crypto');
const { emitWarning } = require("process");

const app = express();
const server = http.createServer(app);
const io = new socketio.Server(server);

let activeRooms = [];

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
});

app.get('/room/:roomID', (req,res) => {
    let activeRoomIDs = [];
    activeRooms.forEach(room => activeRoomIDs.push(room.roomID));
    if(activeRoomsIDs.includes(req.params.roomID)){
        res.sendFile(__dirname + '/new-game.html');
    } else {
        res.sendStatus(404);
    }
});


app.get('/newgame', (req,res) => {
    newRoomID = crypto.randomBytes(8).toString('hex');
    activeRooms.push({ 
        roomID: newRoomID,
        players: []
     });
    res.send({ 
        roomID : newRoomID
    });
});

io.on('connection', (socket) => {

    socket.on('disconnect', () => {
        console.log("User has disconnected");
    });

    socket.on('new player', (res) => {
        const roomID = res.roomID;
        const playerID = res.playerID;
        

        socket.join(roomID);
        io.to(roomID).emit('add player', playerID);

    });

});

server.listen(3000, () => {
    console.log('listening on port 3000');
});










