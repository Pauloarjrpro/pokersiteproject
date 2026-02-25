const DataTypes = require('sequelize').DataTypes;
module.exports = (sequelize)=>{
    const result = sequelize.define("game_win",
    {
        roomId:{type:DataTypes.INTEGER,},
        roundId:{type:DataTypes.INTEGER,},
        when:{type:DataTypes.DATE,defaultValue:new Date()},
        user:{type:DataTypes.INTEGER},
        
        betAmount:{type:DataTypes.INTEGER},
        heavy:{type:DataTypes.INTEGER},
        subHeavy:{type:DataTypes.INTEGER},
        cards:{type:DataTypes.TEXT},
        winAmount:{type:DataTypes.INTEGER},

        isAllin:{type:DataTypes.BOOLEAN},           // is All in
        winners:{type:DataTypes.INTEGER},          // the count of player
        kickCount:{type:DataTypes.INTEGER},        // the count of kills others
        
        
    });
    return result;
}