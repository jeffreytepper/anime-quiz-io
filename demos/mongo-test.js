
const mongoose = require('mongoose');
const axios = require('axios').default;

const params = (popMax) => {
    return {
        url: 'https://graphql.anilist.co',
        method: 'post',
        data: {
            query: 
            `query($perPage: Int, $popMax: Int) {
                Page(popularity_lesser: $popMax, perPage: $perPage) {
                    media(popularity_lesser: $popMax, sort: POPULARITY_DESC) {
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
                'perPage' : 50,
                'popMax' : popMax
            }
        }
    };
}

// const download = async (id) => {
//     let url = 'https://animethemes-api.herokuapp.com/api/v1/anime/' + id;
//     let res = await axios.get(url);

//     let themes = res.data.themes;
//     themes.forEach(theme => {
//         let sourceURL = theme.mirrors[0].mirror;

//     })

// }

const callAPI = async (popMax) => {

    let response = await axios(params(popMax));
    let data = response.data.data.Page.media;

    return data;

}

async function main() {
    await mongoose.connect('mongodb://localhost:27017/anime');

    let popMax = 613954;
    const data = await callAPI(popMax);

    console.log(data);

    // const animeSchema = new mongoose.Schema({
    //     idMal: Number,
    //     title: {
    //         romaji: String,
    //         english: String,
    //         userPreferred: String
    //     },
    //     synonyms: [{ nickname: String }],
    //     popularity: Number
    // });

    // const Anime = mongoose.model('Anime', animeSchema);

    // let popMax = 613954;
    // let data;

    // data = await callAPI(popMax);

    // data.forEach(e => {
    //     let anime = new Anime({
    //         idMal: e.idMal,
    //         title: {
    //             romaji: e.title.romaji,
    //             english: e.title.english,
    //             userPreferred: e.title.userPreferred
    //         },
    //         synonyms: e.synonyms,
    //         popularity: e.popularity
    //     });
    //     anime.save();
    // });

    // for(let i = 0; i < 10000; i += 50){
    //     data = await callAPI(popMax);
    //     popMax = data[49].popularity + 1;

    //     data.forEach(e => {
    //         let anime = new Anime({
    //             idMal: e.idMal,
    //             title: {
    //                 romaji: e.title.romaji,
    //                 english: e.title.english,
    //                 userPreferred: e.title.userPreferred
    //             },
    //             synonyms:,
    //             popularity: e.popularity
    //         });
    //         anime.save();
    //     });

    // }

    // const animeSchema = new mongoose.Schema({
    //     name: String
    // });

    // const Kitten = mongoose.model('Kitten', kittySchema);

    // // const silence = new Kitten({ name: 'Silence' });
    // // silence.save();

    // const kittens = await Kitten.find();
    // console.log(kittens);



    await mongoose.connection.close();
}

main().catch(err => console.log(err));