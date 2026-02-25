const config = require('../config/db.config');
const Sequelize = require('sequelize');

const sequelize = new Sequelize(config.DB,config.USER,config.PASSWORD,{
    host:config.HOST,
    dialect:config.dialect,
    operatorAliases:false,
    pool:{
        max:config.pool.max,
        min:config.pool.min,
        acquire:config.pool.acquire,
        idle:config.pool.idle
    }
});

const db ={};

db.sequelize = sequelize;

db.users = require('./User.model')(sequelize);
db.bets = require('./Bet.model')(sequelize);
db.rooms = require('./GameRoom.model')(sequelize);
db.rounds = require('./GameRound.model')(sequelize);
db.results = require('./GameResult.model')(sequelize);
db.siteProfit = require('./SiteProfit.model')(sequelize);
db.tournaments = require('./Tournament.model')(sequelize);
db.tournament_users = require('./TournamentUser.model')(sequelize);
db.transactions = require('./Transaction.model')(sequelize);

// User.hasMany(Post, {foreignKey: 'user_id'});
db.tournament_users.belongsTo(db.users, {foreignKey: 'user_id'});

db.tournaments.hasMany(db.tournament_users, {foreignKey: 'tournament_id'});

module.exports = db;