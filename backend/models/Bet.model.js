const DataTypes = require('sequelize').DataTypes;
module.exports = (sequelize)=>{
    const log = sequelize.define("bet_log",
    {
        roomId:{type:DataTypes.INTEGER,},
        roundId:{type:DataTypes.INTEGER,},
        when:{type:DataTypes.DATE,defaultValue:new Date()},
        user:{type:DataTypes.INTEGER},
        
        beforeBalance:{type:DataTypes.INTEGER},
        betAmount:{type:DataTypes.INTEGER},
        
        currentBalance:{type:DataTypes.INTEGER},

        isLast:{type:DataTypes.BOOLEAN, defaultValue:false},    // final bet?
    });
    return log;
}