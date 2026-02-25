const DataTypes = require('sequelize').DataTypes;
module.exports = (sequelize)=>{
    const round = sequelize.define("round",
    {
        roomId:{type:DataTypes.INTEGER,},
        
        when:{type:DataTypes.DATE,defaultValue:new Date()},
        
        status:{type:DataTypes.STRING,defaultValue:'wait'},
        cards:{type:DataTypes.TEXT,defaultValue:JSON.stringify([])},     // [{userid:1, shape:0, value:K}]
        binds:{type:DataTypes.TEXT,defaultValue:JSON.stringify([])},     // [{userid:1, bind:1200}]
        dealerCards:{type:DataTypes.STRING,defaultValue:JSON.stringify([])},        //[{shape:0, value:A},]   
        
        currentPlayer:{type:DataTypes.INTEGER},
        bigBindPlayer:{type:DataTypes.INTEGER},
        smallBindPlayer:{type:DataTypes.INTEGER},

        bigBind:{type:DataTypes.INTEGER},
        smallBind:{type:DataTypes.INTEGER},

        winner:{type:DataTypes.INTEGER},
        bindAmount:{type:DataTypes.INTEGER},

        profitAmount:{type:DataTypes.INTEGER},

    });
    return round;
}