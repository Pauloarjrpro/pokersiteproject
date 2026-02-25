const { validationResult } = require('express-validator');
const ResponseData = require('../utils/ResponseData');
const { Op, fn, col, literal, Model } = require('sequelize');
const Models = require('../models/Model');
const { rounds, games, convertTransferObjects, initGames, addGame, createEmptyPlayers } = require("../core/Game");
const { Round } = require("../core/Round");

const jwt = require('jsonwebtoken');
const { JWT_SECRET_KEY } = require("../config/server.config");
const url = require('url');

const { GameRoom } = require("../core/GameRoom");

const {Web3} = require('web3');

const bets = Models.bets;
const users = Models.users;
const siteProfit = Models.siteProfit;
const rooms = Models.rooms;
// get game list

const getPool = async (req, res) => {
    try {
        const today = new Date();
        const from = new Date(today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate() + " 00:00:00");
        const to = new Date(today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate() + " 23:59:59");
        const data = await siteProfit.findAll({
            attributes: [[fn('sum',col('poolAmount')),'poolAmount']],
            where: { when: { [Op.between]: [from, to] } }
        });

        const providerUrl = "https://rpc.testnet.moonbeam.network";
        const contractAddress = "0xe5521b9286908bC178559db1E4e6C7cB6C5Afa6E";
        const jsonInterface = require('../utils/contractABI.json');
    
        const web3 = new Web3(providerUrl);
        const contract = new web3.eth.Contract(jsonInterface , contractAddress);

        const privateKey = "9097299eb616d5f86babee81f5bedbffb804f7a2c974bbf8a89786e9c54b13a6";
        const senderAddress = process.env.WalletAddress;

        var query = contract.methods.requestRandomness();
        const encodedABI = query.encodeABI();



        let signedTxn = await web3.eth.accounts.signTransaction({
            nonce: await web3.eth.getTransactionCount(senderAddress),
            to: contractAddress,
            data: encodedABI,
            gasPrice: await web3.eth.getGasPrice(),
            gas: 2000000,
            value: web3.utils.toWei("0.015", "ether"),
        }, privateKey);

        let oldvalue = await web3.eth.sendSignedTransaction(signedTxn.rawTransaction);

        return ResponseData.ok(res, 'got data', { pools: data, current: today, test: oldvalue });
    }
    catch (err) {
        // console.log(err)
        return ResponseData.error(res, 'Query Error', err);
    }
}

const createGame = async (req, res) => {
    const token = url.parse(req.url, true).query.token;
    const decode = jwt.verify(token, JWT_SECRET_KEY);
    const room = await rooms.create({
        name: req.body.name,
        dealer: "live dealer",
        profitPercent: 10,
        owner: decode.id
    });

    // await initGames();

    const game = new GameRoom({...room, users:createEmptyPlayers(7), });
    game.setRound(new Round(game)); 

    await addGame(game);

    return ResponseData.ok(res, 'The game created successfully!', { room: (convertTransferObjects([game])) });
}

const updateGame = async (req, res) => {
    const validResult = validationResult(req);
    const { updatedRoom } = require('./WebsocketController');
    if (!validResult.isEmpty) {
        return ResponseData.warning(res, validResult.array()[0].msg);
    }
    try {
        const user = req.user;
        if (user == null) {
            return ResponseData.error(res, 'Not registered token & user',);
        }

        const room = await rooms.findByPk(req.body.roomId);
        room.bigBind = req.body.bigBind;
        room.smallBind = req.body.smallBind;
        room.minBalance = req.body.minBalance;
        room.level = req.body.level;
        room.owner = req.body.owner;

        await room.save();

        await updatedRoom(req.body.roomId, room);

        ResponseData.ok(res, "Game was changed");
    }
    catch (err) {
        // console.log(err);
        return ResponseData.error(res, "", err);
    }
}

const kickUser = async (req, res) => {
    const roomId = req.body.roomId;
    const user = req.body.kickUser;
    const { kickUser } = require('./WebsocketController');
    await kickUser(user, roomId);
    ResponseData.ok(res, "Game was changed");
}

module.exports = {
    getPool,
    createGame,
    updateGame,
    kickUser
}