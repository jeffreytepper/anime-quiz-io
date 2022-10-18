const mongoose = require('mongoose');
const axios = require('axios');
const { getLinks, download, downloadAll } = require('./song-dl');

const params = (page) => {
    return {
        url: 'https://graphql.anilist.co',
        method: 'post',
        data : {
            query:
            `query ($page: Int, $perPage: Int) {
                Page(page: $page, perPage: $perPage) {
                    media(sort: POPULARITY_DESC) {
                        idMal
                        title {
                            romaji
                            english
                            userPreferred
                        }
                        synonyms
                        popularity
                    }
                }
            }`,
            variables: {
                'page': page,
                'perPage': 50,
            }
        }
    }
}

const callAPI = async (page) => {

    let response = await axios(params(page));
    let data = response.data.data.Page.media;

    return data;

}

async function main() {

    try {

        await mongoose.connect('mongodb://localhost:27017/anime');

        const animeSchema = new mongoose.Schema({
            idMal: Number,
            title: {
                romaji: String,
                english: String,
                userPreferred: String
            },
            synonyms: [{ nickname: String }],
            popularity: Number,
            songs: {
                OP: [{ filepath: String }],
                ED: [{ filepath: String }]
            }
        });

        const Anime = mongoose.model('Anime', animeSchema);

        for(let i = 1; i <= 1; i++){
            let data = await callAPI(i);
            
            data.forEach(async anime => {

                let links = getLinks(anime.idMal);
                await downloadAll(links.OP, anime.idMal, true);
                await downloadAll(links.ED, anime.idMal, false);



            });


            await new Promise(pass => {
                setTimeout(pass(), 667)
            });
        }

        console.log(data);

    } catch(err) {

        console.error(err);

    } finally {

        await mongoose.connection.close();

    }
}

main();