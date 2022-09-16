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

module.exports = Player;