
const mongoose = require('mongoose');

const animeSchema = new mongoose.Schema({
    idMal: Number,
    title: {
        romaji: String,
        english: String,
        userPreferred: String
    },
    synonyms: [String],
    episodeCount: Number,
    popularity: Number,
    songs: {
        OP: [{
            sequence: Number, 
            episodes: [{
                start: Number,
                end: Number
            }], 
            episodeCount: Number, 
            linkpath: String, 
            localpath: String
        }],
        ED: [{
            sequence: Number, 
            episodes: [{
                start: Number,
                end: Number
            }], 
            episodeCount: Number, 
            linkpath: String, 
            localpath: String
        }],
    }
});

let Anime = mongoose.model('Anime', animeSchema);

module.exports = { Anime };