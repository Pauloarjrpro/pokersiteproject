const { validationResult } = require('express-validator');
const ResponseData = require('../utils/ResponseData');
const { Op, fn, col } = require('sequelize');
const Models = require('../models/Model');
const { convertTransferObjects, addGame, createEmptyPlayers } = require("../core/Game");
const { Round } = require("../core/Round");

const { GameRoom } = require("../core/GameRoom");
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
        return ResponseData.ok(res, 'got data', { pools: data, current: today });
    }
    catch (err) {
        // console.log(err)
        return ResponseData.error(res, 'Query Error', err);
    }
}

const createGame = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return ResponseData.warning(res, "Unauthorized");
        }
        const room = await rooms.create({
            name: req.body.name,
            dealer: "live dealer",
            profitPercent: 10,
            owner: user.id
        });

        const game = new GameRoom({...room, users:createEmptyPlayers(7), });
        game.setRound(new Round(game)); 

        await addGame(game);

        return ResponseData.ok(res, 'The game created successfully!', { room: (convertTransferObjects([game])) });
    } catch (err) {
        return ResponseData.error(res, "Server Fatal Error", err);
    }
}

const updateGame = async (req, res) => {
    const validResult = validationResult(req);
    const { updatedRoom } = require('./WebsocketController');
    if (!validResult.isEmpty()) {
        return ResponseData.warning(res, validResult.array()[0].msg);
    }
    try {
        const user = req.user;
        if (user == null) {
            return ResponseData.error(res, 'Not registered token & user',);
        }

        const room = await rooms.findByPk(req.body.roomId);
        if (!room) {
            return ResponseData.warning(res, "Game room not found");
        }
        // Only room owner or admin can modify game settings.
        const isOwner = Number(room.owner) === Number(user.id) || Number(user.role) === 1;
        if (!isOwner) {
            return ResponseData.warning(res, "You don't have permission to update this game");
        }

        room.bigBind = req.body.bigBind;
        room.smallBind = req.body.smallBind;
        room.minBalance = req.body.minBalance;
        room.level = req.body.level;
        if (req.body.owner != null && Number(user.role) === 1) {
            room.owner = req.body.owner;
        }

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
    try {
        const roomId = req.body.roomId;
        const targetUserId = req.body.kickUser;
        const user = req.user;

        if (!user) {
            return ResponseData.warning(res, "Unauthorized");
        }
        const room = await rooms.findByPk(roomId);
        if (!room) {
            return ResponseData.warning(res, "Game room not found");
        }
        const isOwner = Number(room.owner) === Number(user.id) || Number(user.role) === 1;
        if (!isOwner) {
            return ResponseData.warning(res, "You don't have permission to kick users from this game");
        }

        const { kickUser: kickUserFromSocket } = require('./WebsocketController');
        await kickUserFromSocket(targetUserId, roomId);
        ResponseData.ok(res, "Game was changed");
    } catch (err) {
        return ResponseData.error(res, "", err);
    }
}

module.exports = {
    getPool,
    createGame,
    updateGame,
    kickUser
}
