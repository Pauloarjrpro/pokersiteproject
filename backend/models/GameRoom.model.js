const DataTypes = require('sequelize').DataTypes;

module.exports = (sequelize)=>{
    const room = sequelize.define("room",
    {
        owner: {type:DataTypes.INTEGER, defaultValue: 0},
        name: { type: DataTypes.STRING, defaultValue: '' },
        dealer: { type: DataTypes.STRING, defaultValue: '/assets/dealer1.png' },

        bigBind:{type:DataTypes.INTEGER, defaultValue:128},                  //  big amount for starting 
        smallBind:{type:DataTypes.INTEGER, defaultValue:2},                // small  amount for starting
        minBalance:{type:DataTypes.INTEGER, defaultValue:300},               
        profitPercent:{type:DataTypes.FLOAT(5,2),defaultValue:15},                         // game room fee
        limitCapacity:{type:DataTypes.INTEGER, defaultValue:7},               
        level:{type:DataTypes.INTEGER, defaultValue:0},               
        status:{type:DataTypes.STRING, defaultValue:"wait"},                          // room is wait
        active:{type:DataTypes.INTEGER, defaultValue:1},                           // room is active
        type:{type:DataTypes.INTEGER, defaultValue: 0}
    });
    return room;
}
