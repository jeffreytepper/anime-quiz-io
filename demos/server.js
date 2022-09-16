const express = require('express');
const fs = require('fs');
const app = express();

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/audioSync', (req, res) => {

    const headers = {
        "Content-Type" : "audio/ogg",
        "Cache-Control" : "no-store",
        "Expires" : 0
    };

    res.set(headers);

    res.sendFile('/home/max/development/aniquiz-io/resources/openings/input.ogg');
});

app.get('/audio', (req, res) => {

    console.log('new audio req');

    const range = req.headers.range;
    if(!range) {
        res.status(400).send("Requires Range header");
    }

    const audioPath = '../resources/openings/input.ogg'
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
        "Cache-Control" : "no-cache",
        "Expires" : 0
    };

    res.writeHead(206, headers);

    const audioStream = fs.createReadStream(audioPath, { start, end });

    audioStream.pipe(res);

});

app.get('/test', (req, res) => {
    console.log('test recieved');
    res.sendStatus(200);
});

app.listen(3000, () => {
    console.log("Listening on Port 3000");
});