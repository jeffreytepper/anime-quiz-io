class Player {
    
    constructor (username, host = false, avatar) {

        this.username = username;
        this.host = host;
        this.avatar = avatar;
        this.score = 0;
        
    }

    lobbyNametag() {
        return `
            <div> 
                <span>${this.username}</span>
            </div>
        `
    }

    gameNametag() {
        return `
            <div class="row border">
                <div class="col-3 d-flex align-items-center">
                    <p class="h3 mb-0">#1</p>
                </div>
                <div class="col">
                    <p class="m-0 text-center">${this.username}</p>
                    <p class="m-0 text-center" id="player-${this.username}-score">Score: ${this.score}</p>
                </div>
            </div>
        `
    }

    trophyNametag() {
        return `
            <div>
                <div>${this.username}</div>
                <div>${this.score}</div>
            </div>
        `
    }


}