const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const io = new socketio.Server(server);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
 
app.get('/newroom', (req,res) => {
    const newRoomID = crypto.randomBytes(8).toString('hex');
    activeRooms.push(newRoomID);
    roomMap.set(newRoomID, {
        activeMembers : new Map(),
        chatLog : []
    });
    res.send(newRoomID);
});

app.get('/room/:roomID', (req,res) => {
    const roomID = req.params.roomID;
    if (activeRooms.includes(roomID)) {
        res.sendFile(__dirname + '/test-room.html');
    } else {
        res.sendStatus(404);
    }
});

io.on('connect', (socket) => {

    io.to(socket.id).emit("join member", Array.from(activeMembers.values()), chatLog);

    socket.on('join room', (roomID) => {
        socket.data.room = roomID;
        socket.join(socket.data.room);
        console.log(`joined ${roomID}`);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('post member', (member) => {
        activeMembers.set(socket.id, member);
        console.log(activeMembers);
        socket.to(socket.data.room).emit('new member', member);
    });

    socket.on('post chat', (message) => {
        const poster = activeMembers.get(socket.id);
        const chat = {
            poster : poster, 
            message : message
        };
        chatLog.push(chat);
        socket.to(socket.data.room).emit('new chat', chat);
    });
});

server.listen(3000, () => {
    console.log('listening on port 3000');
});