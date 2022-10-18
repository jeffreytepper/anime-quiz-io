const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');
const clipAudio = require('./services/clip-audio');
const { Anime } = require('./models/anime');
const { default: mongoose } = require('mongoose');
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
        this.ready = false;
    }
}

class Round {

    constructor(answers, title, filepath) {
        this.answers = answers;
        this.title = title;
        this.filepath = filepath;
        this.active = false;
        this.winners = [];
        this.startTime = Date.now();
        this.roundLength = 10;
    }

    check(guess) {
        return this.answers.some(title => {
            if(guess.length >= 8) return title.includes(guess);
            else return guess == title;
        });
    }

    addWinner(player) {
        player.roundPoints = Math.ceil((this.roundLength * 1000 - (Date.now() - this.startTime)) / 100);
        this.winners.push(player);
    }

    ready() {
        //clipAudio(this.filepath, 10, this.roundLength);
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

    playersReady() {
        if(this.players.every(player => player.ready)) {
            this.eventEmitter.emit('ready');
        }
    }

    async chooseOP(minPop, maxPop) {

        const animes = await Anime.find();

        const random = Math.floor(Math.random() * animes.length);
        const anime = animes[random];

        let answers = [];
        answers.push(anime.title.romaji);
        answers.push(anime.title.english);
        answers.push(anime.title.userPreferred);
        answers = answers
            .concat(anime.synonyms)
            .map((str) => {
                return str
                .replace(/[^a-zA-Z]/g, '')
                .toLowerCase();
            })
            .filter(str => str);

        return { 
            answer: answers,
            title: anime.title.userPreferred, 
            filepath: anime.songs.OP[0].localpath
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
        
        const readyCheck = () => {
            return new Promise(pass => {
                this.eventEmitter.once('ready', () => pass());
            })
        }

        const roundParams = await this.chooseOP();
        this.round = new Round(roundParams.answer, roundParams.title, roundParams.filepath);

        
        io.in(this.roomID).emit('ready-round');
        this.round.ready();
        await readyCheck();

        io.in(this.roomID).emit('start-round');
        this.round.start();
        await gameTimer(5);

        const endRound = {
            answer: this.round.title,
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
        io.in(this.roomID).emit('end-game');

    }
}

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/audio', (req, res) => {

    const roomID = req.query.room;
    const path = gameRooms.get(roomID).round.filepath;

    const headers = {
        "Content-Type" : "audio/ogg",
        "Cache-Control" : "no-store",
        "Expires" : 0
    };

    res.set(headers);

    res.sendFile(path, { root: __dirname +  '/../' });

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

    socket.on('ready-up', () => {

        const game = gameRooms.get(socket.data.player.room);
        const player = game.players.find(e => e.id == socket.id);
        player.ready = true;
        game.playersReady();

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

        if(game.round.active)  game.checkGuess(
            socket.id, 
            chat
            .replace(/[^a-zA-Z]/g, '')
            .toLowerCase()
        );

        io.in(socket.data.player.room).emit('new-chat', {
            sender: socket.data.player.username,
            message: chat
        });

    });

});

const start = async() => {
    try {
        await mongoose.connect('mongodb://localhost:27017/anime');
        server.listen(port, () => {
            console.log(`listening on port ${port}`);
        });
    } catch(err) {
        console.error(err);
    }
}

start();

