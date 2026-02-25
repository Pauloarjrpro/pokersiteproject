

const DataTypes = require('sequelize').DataTypes;

module.exports = (sequelize) => {
    const user = sequelize.define("user",
        {
            email: { type: DataTypes.STRING, defaultValue: '' },
            password: { type: DataTypes.STRING, defaultValue: '' },
            role: { type: DataTypes.INTEGER, defaultValue: 0 },
            token: { type: DataTypes.STRING, defaultValue: '' },
            regIp: { type: DataTypes.STRING, defaultValue: '' },
            currentIp: { type: DataTypes.STRING, defaultValue: '' },
            balance: { type: DataTypes.FLOAT(10, 2), defaultValue: 0 },
            status: { type: DataTypes.INTEGER, defaultValue: 0 },

            fullName: { type: DataTypes.STRING, defaultValue: '' },
            avatar: { type: DataTypes.STRING, defaultValue: `/assets/avatars/avatar-${Math.floor(Math.random() * 10)}.png` },
            level: { type: DataTypes.INTEGER, defaultValue: 0 },

            wagered: { type: DataTypes.FLOAT(10, 2), defaultValue: 0 },
            deposit: { type: DataTypes.FLOAT(10, 2), defaultValue: 0 },
            withdrawed: { type: DataTypes.FLOAT(10, 2), defaultValue: 0 },

            created_at: { type: DataTypes.DATE, defaultValue: new Date(Date.now()) },
            updated_at: { type: DataTypes.DATE, defaultValue: new Date(Date.now()) },

            lastGameId:{type:DataTypes.INTEGER, defaultValue:0},
        }, {
        timestamps: false,
    });
    return user;
}

