const Sequelize = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite'
});

// const Anime = sequelize.define('Anime', {
//     title: Sequelize.DataTypes.STRING,
//     rank: Sequelize.DataTypes.INTEGER,
//     filepath: Sequelize.DataTypes.STRING,
// });

sequelize.
    authenticate()
    .then(() => {
        console.log('Connection has been established successfully');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });









