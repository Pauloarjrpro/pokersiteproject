const DataTypes = require('sequelize').DataTypes;
module.exports = (sequelize)=>{
    const transaction = sequelize.define("transaction",
    {
        user_id:{type:DataTypes.INTEGER,},
        type:{type:DataTypes.INTEGER,},
        // NUMBER maps poorly for MySQL; use a concrete numeric type.
        amount:{type:DataTypes.FLOAT(10,2)},
        balance: { type: DataTypes.FLOAT(10, 2), defaultValue: 0 },
        created_at: { type: DataTypes.DATE, defaultValue: new Date(Date.now()) },
        updated_at: { type: DataTypes.DATE, defaultValue: new Date(Date.now()) },
    },{
        timestamps: false,
    });
    return transaction;
}
