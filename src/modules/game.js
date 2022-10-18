const EventEmitter = require('events');
const Round = require('./round');

class Game {

    constructor(roomID, socketio) {

        this.roomID = roomID;
        this.settings = {};
        this.players = [];
        this.round = null;
        this.public = false;
        this.eventEmitter = new EventEmitter();
        this.io = socketio;

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

    

    async startRound() {

        const waitTimer = (time) => new Promise(pass => setTimeout(() => pass(), time * 1000));

        const gameTimer = (time) => {
            return new Promise(pass => {
                this.eventEmitter.once('end', () => pass());
                setTimeout(() => pass(), time * 1000);
            });
        } 

        this.round = new Round();

        this.io.in(this.roomID).emit('ready-round');
        this.round.ready();
        await waitTimer(3);

        this.io.in(this.roomID).emit('start-round');
        this.round.start();
        await gameTimer(10);

        const endRound = {
            answer: this.round.answer,
            players: this.getPlayersFrontend()
        }

        this.io.in(this.roomID).emit('end-round', endRound);
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

module.exports = Game;