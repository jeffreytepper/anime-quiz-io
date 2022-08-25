const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const port = 3000;

const app = express();
const server = http.createServer(app);
const io = new socketio.Server(server);

app.use(bodyParser.json());

let gameRooms = new Map();

class Player {
    constructor(id, username, host, room) {
        this.id = id;
        this.username = username;
        this.score = 0;
        this.host = host;
        this.room = room;
        this.avatar = {};
    }

}

class Round {
    constructor() {
        this.answer = Math.ceil(Math.random() * 10);
        this.active = false;
        this.winners = [];
    }

    check(guess) {
        return guess === this.answer;
    }
}

class Game {

    constructor(roomID) {
        this.roomID = roomID;
        this.settings = {};
        this.players = [];
        this.round = new Round();
        this.public = false;
    }

    checkGuess(playerID, guess) {

        if(!this.round.check(guess)) {
            console.log(guess, 'is not the answer.');
            return
        }

        const winner = this.players.find((player) => player.id === playerID);
        const losers = players.length - winners.length;

        this.round.winners.push({
            player: winner,
            score: 100 * losers
        });

        if(losers == 0) {
            //end round
        }

    }

    async startRound() {

        return new Promise((pass) => {
            this.round = new Round();
            io.in(this.roomID).emit('ready-round');
            setTimeout(() => pass(), 3000)
        }).then(() => {
            this.round.active = true;
            io.in(this.roomID).emit('start-round');
            return new Promise(pass => {
                setTimeout(() => pass(), 10000);
            });
        }).then(() => {
            this.round.active = false;
            io.in(this.roomID).emit('end-round', this.round.answer);
        });

    }

    async init() {
        let rounds = this.settings.numRounds;
        while(rounds > 0) {
            await this.startRound();
            rounds --;
        }
    }
}

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connect', (socket) => {


    socket.on('disconnect', () => {
    });

    // socket.on('register', (player, callback) => {
        
    //     let roomID = player.room;
    //     let game = gameRooms.get(roomID);
    //     let host = false;

    //     if(!game) {
    //         roomID = crypto.randomBytes(8).toString('hex');
    //         game = new Game(roomID);
    //         gameRooms.set(roomID, game);
    //         host = true;
    //     }

    //     const newPlayer = new Player(socket.id, player.name, host, roomID);
    //     game.players.push(newPlayer);

    //     socket.join(roomID);
    //     socket.data.player = newPlayer;

    //     socket.to(roomID).emit('new-player', {
    //         username: newPlayer.username,
    //         host: newPlayer.host
    //     });


    // });

    socket.on('register-player', (player, callback) => {

        let roomID = player.room;
        let newPlayer = {
            id: socket.id,
            username: player.name,
            score: 0,
        };

        if(!roomID){        
            newPlayer.host = true;
            roomID = crypto.randomBytes(8).toString('hex');
        } else {
            newPlayer.host = false;
            players = gameRooms.get(player.room).players;
        }

        let game = new Game(roomID);

        newPlayer.room = roomID;

        game.players.push(newPlayer);
        gameRooms.set(roomID, game);

        socket.join(roomID);
        socket.data.player = newPlayer; 
        socket.to(roomID).emit('new-player', newPlayer);

        const sessionData = {
            roomID: roomID,
            players: game.players 
        }

        callback(sessionData);
        
    });

    socket.on('init-game', (settings) => {
        if(!socket.data.player.host) return;
        const roomID = socket.data.player.room;
        let game = gameRooms.get(roomID);
        game.settings = settings;


        gameRooms.set(roomID, game);

        game.init();
    });

    socket.on('send-chat', (chat) => {

        const game = gameRooms.get(socket.data.player.room);

        if(game.round.active)  game.checkGuess(socket.id, chat);




        io.in(socket.data.player.room).emit('new-chat', {
            sender: socket.data.player.username,
            message: chat
        });
    })

});

server.listen(port, () => {
    console.log(`listening on port ${port}`);
});