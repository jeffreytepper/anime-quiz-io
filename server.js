const express = require("express");
const http = require("http");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new socketio.Server(server);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/test-index.html')
});

io.on('connection', (socket) => {

    console.log("New user connected");

    socket.on('disconnect', () => {
        console.log("User has disconnected");
    });

    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });

});

server.listen(3000, () => {
    console.log('listening on port 3000');
});










