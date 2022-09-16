const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const port = 3001;
const app = express();
const server = http.createServer(app);
const io = new socketio.Server(server);

app.get('/', (req,res) => {
    res.sendFile(__dirname + '/test-chat.html');
});

let numUsers = 0;

io.on('connect', (socket) => {
    
    let addedUser = false;

    socket.on('add-user', (username) => {
        
        if (addedUser) return;

        socket.data.username = username;
        ++numUsers;
        addedUser = true;

        socket.emit('login')


    });
    console.log('new socket connected');
    sockets.push(socket.id);


    
});

server.listen(port, () => {
    console.log(`listening on port ${port}`);
});










