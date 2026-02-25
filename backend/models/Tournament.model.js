const DataTypes = require('sequelize').DataTypes;

module.exports = (sequelize)=>{
    const tournament = sequelize.define("tournaments",
    {
        owner: {type:DataTypes.INTEGER, defaultValue: 0},
        name: { type: DataTypes.STRING, defaultValue: '' },
        dealer: { type: DataTypes.STRING, defaultValue: '/assets/dealer1.png' },

        bigBind:{type:DataTypes.INTEGER, defaultValue:128},                  //  big amount for starting 
        smallBind:{type:DataTypes.INTEGER, defaultValue:2},                // small  amount for starting
        initial_stack:{type:DataTypes.INTEGER, defaultValue:300},               
        // limitCapacity:{type:DataTypes.INTEGER, defaultValue:7},               
        status:{type:DataTypes.STRING, defaultValue:"wait"},      
        open_time:{type:DataTypes.DATE,defaultValue:new Date()},       
        type:{type:DataTypes.INTEGER, defaultValue:0},   
        class:{type:DataTypes.INTEGER, defaultValue: 0 },
        first:{type:DataTypes.INTEGER, defaultValue:0},     
        second:{type:DataTypes.INTEGER, defaultValue:0},    
        third:{type:DataTypes.INTEGER, defaultValue:0},    
        profitPercent:{type:DataTypes.FLOAT(5,2),defaultValue:15},                         // game room fee
    });
    return tournament;
}