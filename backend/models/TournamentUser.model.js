

const DataTypes = require('sequelize').DataTypes;

module.exports = (sequelize) => {
    const tournament_user = sequelize.define("tournament_user",
        {
            tournament_id: { type: DataTypes.INTEGER, defaultValue: '' },
            user_id: { type: DataTypes.INTEGER, defaultValue: '' },
            status: { type: DataTypes.INTEGER, defaultValue: 0 },

            createdAt: { type: DataTypes.DATE, defaultValue: new Date(Date.now()) },
            updatedAt: { type: DataTypes.DATE, defaultValue: new Date(Date.now()) },
        }, {
        timestamps: false,
    });
    return tournament_user;
}

