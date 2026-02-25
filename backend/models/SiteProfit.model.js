const DataTypes = require('sequelize').DataTypes;
module.exports = (sequelize)=>{
    const siteProfit = sequelize.define("site_profit",
    {
        roomId:{type:DataTypes.INTEGER,},
        roundId:{type:DataTypes.INTEGER,},
        when:{type:DataTypes.DATE,defaultValue:new Date()},
        
        betAmount:{type:DataTypes.INTEGER},
        profitAmount:{type:DataTypes.FLOAT(20,2)},
        poolAmount:{type:DataTypes.FLOAT(20,2)},
        
    });
    return siteProfit;
}