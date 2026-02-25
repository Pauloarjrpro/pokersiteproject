const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const ResponseData = require('../utils/ResponseData');
const Models = require('../models/Model');

const UserModel = Models.users;

// mock
const { JWT_SECRET_KEY } = require('../config/server.config');


const ResponseUserModel = async (user) => {
    return {
        email: user.email,
        id: user.id,
        balance: user.balance,
        fullName:user.fullName,
        level:user.level,
        wagered:user.wagered,
        deposit:user.deposit,
        withdrawed:user.withdrawed,
        created:user.created_at,
        avatar:user.avatar,
        lastGameId:user.lastGameId,
        role: user.role
    }
}
const jwtsign = (payload) => {
    // Sign token
    return jwt.sign(
        payload,
        JWT_SECRET_KEY,
        {
            expiresIn: 24 * 60 * 60 // 24 hrs
        }
    );
}
const encryptPassword = (password) => {
    return new Promise(async (resolve, reject) => {
        bcrypt.hash(password, 10, (err, data) => {
            if (err) reject(err);
            resolve(data);
        });
    });
}
const checkPassword = (password, hashPassword) => {
    return new Promise(async (resolve, reject) => {
        bcrypt.compare(
            password.toString(),
            hashPassword.toString(),
            (err, data) => {
                if (err) reject(err);
                resolve(data);
            }
        );
    });
};
const login = async (req, res) => {
    const { JOINED_USERS } = require('./WebsocketController');

    const validResult = validationResult(req);
    if (!validResult.isEmpty) {
        return ResponseData.warning(res, validResult.array()[0].msg);
    }
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({
            where: { email }
        });

        if (user == null || !user) {
            return ResponseData.warning(res, "Can't find user by email");
        }
        else {

            if (!await checkPassword(password, user.password)) {
                return ResponseData.warning(res, "Wrong password, check again");
            }
            if(JOINED_USERS[email]!=null && JOINED_USERS[email].fullName && JOINED_USERS[email].online){
                return ResponseData.warning(res, "Alreay logined and playing with this email");
            }
            const payload = { id: user.id, email: user.email };
            const token = jwtsign(payload);
            await user.update({ token }, { where: { email} });
            return ResponseData.ok(res, "Login successfully, welcome to your visit.", { token, user: await ResponseUserModel(user) });

        }
    }
    catch (err) {
        // console.log(err);
        return ResponseData.error(res, "", err);
    }
}
const logout = async (req, res) => {
    const validResult = validationResult(req);
    if (!validResult.isEmpty) {
        return ResponseData.warning(res, validResult.array()[0].msg);
    }
    try {
        const token = req.header('token');
        const user = await UserModel.findOne({
            where: { token }
        });

        if (user != null) {

            const { logout,  JOINED_USERS } = require('./WebsocketController');

            await logout(user.email);
            await user.update({ token: '' });

        }
        return ResponseData.ok(res, "logouted.",);

    }
    catch (err) {
        // console.log(err);
        return ResponseData.error(res, "", err);
    }
}

const register = async (req, res) => {
    const validResult = validationResult(req);
    if (!validResult.isEmpty) {
        if(req.file){
            fs.unlink(path.resolve(req.file.path), (err) => { });
        }
        return ResponseData.warning(res, validResult.array()[0].msg);
    }
    try {
        const { email, password,fullName } = req.body;

        if ((await UserModel.findOne({ where: { email } })) != null) {
            return ResponseData.warning(res, "Already use this email , try login");
        }
        else {
            const user = await UserModel.create({
                email,
                fullName,
                avatar:req.file.path,
                password: await encryptPassword(password),
            });

            const payload = { id: user.id, email };
            const token = jwtsign(payload);
            // update token
            user.token = token;
            await user.save();
            return ResponseData.ok(res, 'Please login with your infomation', { token, user: (await ResponseUserModel(user)) });
        }
    }
    catch (err) {
        // console.log(err)
        return ResponseData.error(res, "Server Fatal Error", err);
    }
}
const account = async (req, res) => {   
    const { logout,  JOINED_USERS } = require('./WebsocketController');

    try {
        if(JOINED_USERS[req.user.email] && JOINED_USERS[req.user.email].online){
            return ResponseData.warning(res, "Alreay logined with this email",{});
        }
        else{
            return ResponseData.ok(res, "get account information", { user: await ResponseUserModel(req.user) });
        }
        
    }
    catch (err) {
        // console.log(err)
        return ResponseData.error(res, "Server Fatal Error", err);
    }
}
module.exports = {
    register,
    login,
    account,
    jwtsign,
    logout,
    checkPassword,
    encryptPassword,
    ResponseUserModel,
}