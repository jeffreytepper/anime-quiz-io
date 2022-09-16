const ffmpeg = require('fluent-ffmpeg');
const tmp = require('tmp');

module.exports = (filepath, start, end) => {

    ffmpeg(filepath)
    .seekInput(start)
    .outputOption(`-t ${end}`)
    .save('../resources/clipped/output.ogg');
    
}

