const express = require('express');
const http = require('http');
const util  = require('audio-buffer-utils');
const decode = require('audio-decode');
const fs = require('fs');
require('ogg.js');

const app = express();
const server = http.createServer(app);

const loadAudio = () => {

    const filePath = './resources/openings/Bakemonogatari-OP1.ogg'
    const file = fs.readFile(filePath, (err, buf) => {
        decode(buf, (err, audioBuffer) => {
            util
        });
    });

}

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

server.listen(3000, () => {
    console.log('listening on port 3000');
});