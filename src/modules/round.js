class Round {
    constructor() {
        this.answer = 42//Math.ceil(Math.random() * 10);
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
        return
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

module.exports = Round;