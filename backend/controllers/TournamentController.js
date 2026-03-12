const { validationResult } = require('express-validator');
const ResponseData = require('../utils/ResponseData');
const { Op, fn, col } = require('sequelize');
const Models = require('../models/Model');
const { convertTransferObjects, addGame, createEmptyPlayers } = require("../core/Game");
const { Round } = require("../core/Round");

const { GameRoom } = require("../core/GameRoom");

const users = Models.users;
const tournament_users = Models.tournament_users;
const siteProfit = Models.siteProfit;
const rooms = Models.rooms;
const tournaments = Models.tournaments;
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
        const room = await tournaments.create({
            name: req.body.name,
            dealer: "live dealer",
            profitPercent: 10,
            owner: user.id,
            initial_stack: req.body.initial_stack,
            smallBind: req.body.smallBind,
            bigBind: req.body.bigBind,
            type: req.body.type,
            first: req.body.first,
            second: req.body.second,
            third: req.body.third,
            class:req.body.class
        });

        const game = new GameRoom({...room, users:createEmptyPlayers(7), minBalance: room.initial_stack });
        game.setRound(new Round(game)); 

        return ResponseData.ok(res, 'The game created successfully!', { room: (convertTransferObjects([game])) });
    } catch (err) {
        return ResponseData.error(res, "Server Fatal Error", err);
    }
}

const updateGame = async (req, res) => {
    const validResult = validationResult(req);
    const { updatedTournaments } = require('./WebsocketController');
    if (!validResult.isEmpty()) {
        return ResponseData.warning(res, validResult.array()[0].msg);
    }
    try {
        const user = req.user;
        if (user == null) {
            return ResponseData.error(res, 'Not registered token & user',);
        }

        const room = await tournaments.findByPk(req.body.tournamentId);
        if (!room) {
            return ResponseData.warning(res, "Tournament not found");
        }
        const isOwner = Number(room.owner) === Number(user.id) || Number(user.role) === 1;
        if (!isOwner) {
            return ResponseData.warning(res, "You don't have permission to update this tournament");
        }

        room.bigBind = req.body.bigBind;
        room.smallBind = req.body.smallBind;
        room.initial_stack = req.body.minBalance;
        room.name = req.body.name;
        room.type = req.body.type;
        room.first = req.body.first;
        room.second = req.body.second;
        room.third = req.body.third;
        
        await room.save();

        await updatedTournaments();

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

const joinGame = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return ResponseData.warning(res, "Unauthorized");
        }
        const tournamentId = req.body.tournamentId;
        const currentTournament = await tournaments.findByPk(tournamentId);
        if (!currentTournament) {
            return ResponseData.warning(res, "Tournament not found");
        }
        const joined = await tournament_users.findOne({
            where: {
                tournament_id: tournamentId,
                user_id: user.id,
            }
        });
        if (joined) {
            return ResponseData.warning(res, "You already joined this tournament");
        }
        await tournament_users.create({
            tournament_id: tournamentId,
            // Trust the authenticated user identity, not client-provided IDs.
            user_id: user.id,
        });

        return ResponseData.ok(res, 'sent the request to owner!', { });
    } catch (err) {
        return ResponseData.error(res, "", err);
    }
}

const updateMember = async (req, res) => {
    const validResult = validationResult(req);
    if (!validResult.isEmpty()) {
        return ResponseData.warning(res, validResult.array()[0].msg);
    }
    try {
        const member = await tournament_users.findByPk(req.body.playerId);
        if (!member) {
            return ResponseData.warning(res, "Tournament member not found");
        }
        const tournament = await tournaments.findByPk(member.tournament_id);
        if (!tournament) {
            return ResponseData.warning(res, "Tournament not found");
        }
        const user = req.user;
        if (!user || (Number(tournament.owner) !== Number(user.id) && Number(user.role) !== 1)) {
            return ResponseData.warning(res, "You don't have permission to update players");
        }
        member.status = req.body.status;

        await member.save();

        ResponseData.ok(res, "Member was changed");
    }
    catch (err) {
        // console.log(err);
        return ResponseData.error(res, "", err);
    }
}

const startGame = async (req, res) => {
    const { balancePlayersWithMaxSeats } = require('../utils/tableBalancer');

    const tournamentId = req.body.tournamentId;
    const user = req.user;
    const current_tournament = await tournaments.findOne({ where: { id: tournamentId } });
    if (!current_tournament) {
        return ResponseData.warning(res, "Tournament not found");
    }
    if (!user || (Number(current_tournament.owner) !== Number(user.id) && Number(user.role) !== 1)) {
        return ResponseData.warning(res, "You don't have permission to start this tournament");
    }

    const tournament_players = await tournament_users.findAll({where: {tournament_id: tournamentId, status: 1}, include: [users]});
    if (tournament_players.length < 2) {
        return ResponseData.warning(res, "Not enough accepted players to start");
    }

    const tables = await balancePlayersWithMaxSeats(tournament_players, 7);

    // console.log('table', tables.length);

    for(const table of tables){

        const room = await rooms.create({
            name: current_tournament.name,
            dealer: "live dealer",
            profitPercent: 0,
            owner: current_tournament.owner,
            smallBind: current_tournament.smallBind,
            bigBind: current_tournament.bigBind,
            minBalance: current_tournament.initial_stack,
            type: tournamentId
        });

        const game = new GameRoom({...room, users:createEmptyPlayers(7), });
        game.setRound(new Round(game));   

        await addGame(game);
        const { sendStartTournament, gameStart } = require('./WebsocketController');
        
        for(const member of table){

            await sendStartTournament({command: 'start-tournament', user_id: member.user_id, roomId: room.id});
        } 

        setTimeout(async () => {
            await gameStart(room.id);
        }, 2000);

    }

    ResponseData.ok(res, "Game was started", tables);
}

module.exports = {
    getPool,
    createGame,
    updateGame,
    kickUser,
    joinGame,
    updateMember,
    startGame
}
