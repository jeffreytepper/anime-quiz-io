const axios = require('axios');
const fs = require('fs');

const handleError = (err) => {
    if (err) throw err
};

async function getLinks(id) {

    const url = 'https://animethemes-api.herokuapp.com/api/v1/anime/' + id;
    const res = await axios.get(url);

    if(res.data === "Anime not found")  throw 'Anime not found';

    const links = res.data.themes
        .map(theme => theme.mirrors[0].mirror
            .replace("animethemes.moe/video", "a.animethemes.moe")
            .replace(".webm", ".ogg")
        );

    let masterLinks = {};

    masterLinks.OP = links.filter(link => link.search(/OP\d+\.ogg/) != -1);
    masterLinks.ED = links.filter(link => link.search(/ED\d+\.ogg/) != -1);
 
    return masterLinks;
 
}
 
async function download(link, path) {

    const res = await axios({
        url: link,
        method: 'GET',
        responseType: 'stream'
    });

    res.data.pipe(fs.createWriteStream(path));
}

async function downloadAll(links, id, isOP) {

    const OP = isOP ? 'OPs' : 'EDs';
    const path = '../../resources/songs/' + id + '/' + OP;
    const dlLinks = isOP ? links.OP : links.ED;
    fs.mkdir(path, { recursive: true }, handleError);
    let i = 0;
    console.group(id, isOP ? 'OP' : 'ED');
    while(i < dlLinks.length) {
        try {
            await download(dlLinks[i], path + '/' + String(i+1));
            await new Promise(pass => 
                setTimeout(() => pass(), 667)
            );
            console.log(`${dlLinks[i].slice(-7, -4)} successfully downloaded`);
            i++;
        } catch(err) {

            console.log(`${dlLinks[i]} failed:`, err.response.status);
            if(err.response.status == 404) {
                i++;
            } else {
                await new Promise(pass => 
                    setTimeout(() => pass(), 1000)
                );
            }
        }
    }
    console.groupEnd();

}


async function start(id) {

    try {
        const links = await getLinks(id);
        await downloadAll(links, id, true);
        await downloadAll(links, id, false);
    } catch(err) {
        console.error(err);
    }
} 

module.exports = {
    getLinks,
    download,
    downloadAll
}

getLinks(13601).then(console.log).catch(console.log);
