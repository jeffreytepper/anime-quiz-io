const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const fs = require('fs');
const EventEmitter = require('events');
const clipAudio = require('./services/clip-audio');
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
        this.roundPoints = 0;
        this.host = host;
        this.room = room;
        this.avatar = {};
    }

}

class Round {

    constructor(answer, filepath) {
        this.answer = answer;//Math.ceil(Math.random() * 10);
        this.filepath = filepath;
        this.active = false;
        this.winners = [];
        this.startTime = Date.now();
        this.roundLength = 10;
    }

    check(guess) {
        return guess == this.answer;
    }

    addWinner(player) {
        player.roundPoints = Math.ceil((this.roundLength * 1000 - (Date.now() - this.startTime)) / 100);
        this.winners.push(player);
    }

    ready() {
        clipAudio(this.filepath, 10, this.roundLength);
    }

    start() {
        this.active = true;
    }

    end() {
        this.active = false;

        this.winners.forEach((winner) => {
            winner.score += winner.roundPoints;
            winner.roundPoints = 0;
        });
    }
}

class Game {

    constructor(roomID) {
        this.roomID = roomID;
        this.settings = {};
        this.players = [];
        this.round = new Round();
        this.public = false;
        this.eventEmitter = new EventEmitter();

    }

    getPlayersFrontend() {

        return this.players.map(player => {
            return {
                username: player.username,
                score: player.score,
                host: player.host,
                avatar: player.avatar
            }
        });

    }

    checkGuess(playerID, guess) {

        if(!this.round.check(guess)) {
            console.log(guess, 'is not the answer.');
            return
        }

        const winner = this.players.find((player) => player.id === playerID);
        this.round.addWinner(winner);

        const losers = this.players.length - this.round.winners.length;

        if(losers == 0) {
            this.eventEmitter.emit('end');
        }

    }

    chooseOP() {

        const filepath = '../resources/openings/input.ogg';

        return { 
            answer: 42, 
            filepath
        };
    }

    

    async startRound() {

        const waitTimer = (time) => new Promise(pass => setTimeout(() => pass(), time * 1000));

        const gameTimer = (time) => {
            return new Promise(pass => {
                this.eventEmitter.once('end', () => pass());
                setTimeout(() => pass(), time * 1000);
            });
        } 

        const roundParams = this.chooseOP();
        this.round = new Round(roundParams.answer, roundParams.filepath);

        io.in(this.roomID).emit('ready-round');
        this.round.ready();
        await waitTimer(3);

        io.in(this.roomID).emit('start-round');
        this.round.start();
        await gameTimer(10);

        const endRound = {
            answer: this.round.answer,
            players: this.getPlayersFrontend()
        }

        io.in(this.roomID).emit('end-round', endRound);
        this.round.end();
        await waitTimer(3);

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

app.get('/audio', (req, res) => {

    const range = req.headers.range;
    if(!range) {
        res.status(400).send("Requires Range header");
    }

    console.log('new audio req');

    const audioPath = '../resources/clipped/output.ogg'
    const audioSize = fs.statSync(audioPath).size;

    const CHUNCK_SIZE = 10 ** 6;
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNCK_SIZE, audioSize - 1);

    const contentLength = end - start + 1;
    const headers = {
        "Content-Range" : `bytes ${start}-${end}/${audioSize}`,
        "Accept-Ranges" : "bytes",
        "Content-Length" : contentLength,
        "Content-Type" : "audio/ogg",
    };

    res.writeHead(206, headers);

    const audioStream = fs.createReadStream(audioPath, { start, end });

    audioStream.pipe(res);

});

io.on('connect', (socket) => {


    socket.on('disconnect', () => {
    });

    socket.on('register', (player, callback) => {
        
        let roomID = player.room;
        let game = gameRooms.get(roomID);
        let host = false;

        if(!game) {
            roomID = crypto.randomBytes(8).toString('hex');
            game = new Game(roomID);
            gameRooms.set(roomID, game);
            host = true;
        }

        const newPlayer = new Player(socket.id, player.name, host, roomID);
        game.players.push(newPlayer);

        socket.join(roomID);
        socket.data.player = newPlayer;

        socket.to(roomID).emit('new-player', {
            username: newPlayer.username,
            host: newPlayer.host
        });
        
        callback({
            roomID: roomID,
            players: game.getPlayersFrontend()
        });


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

    });

});

server.listen(port, () => {
    console.log(`listening on port ${port}`);
});