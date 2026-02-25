const WebSocket = require("ws");
const url = require('url');

const { JWT_SECRET_KEY } = require("../config/server.config");

const { WebSocketServer } = require("ws");

const { GameRoom } = require("../core/GameRoom");

const jwt = require('jsonwebtoken');

const { uploadBet } = require("./GameController");
const { rounds, games, convertTransferObjects, initGames, createEmptyPlayers } = require("../core/Game");
const { 
    CMD_JOIN_ROOM, 
    CMD_UPDATE_ROOM, 
    CMD_GET_ROOM_LIST, 
    CMD_GET_TOURNAMENT_LIST, 
    CMD_GET_TOURNAMENT_USERS, 
    CMD_QUIT_ROOM, 
    GAME_STATUS_WAIT, 
    GAME_STATUS_READY, 
    GAME_STATUS_START, 
    GAME_HAND_CARD, 
    GAME_STATUS_CHECK, 
    GAME_STATUS_FOLD, 
    GAME_STATUS_RAISE, 
    GAME_STATUS_CALL, 
    GAME_STATUS_ALLIN, 
    GAME_STATUS_RAISEX, 
    GAME_STATUS_END, 
    DEFAULT_SETTING,
    CMD_QUIT_ROOM_REQUEST, 
    GAME_GROUP_CHAT,
    CMD_GET_SCOOP_LIST,
    CMD_GET_WCOOP_LIST 
} = require("../utils/WebsocketConstant");
const { users, tournaments, tournament_users,rooms } = require("../models/Model");
const { User } = require("../core/User");

const { distributePlayers } = require("../utils/distributePlayer");

let GAME_SERVER_SOCKET, CLIENT_SOCKETS = [], JOINED_USERS = [], LAST_USER_COMMAND = [];

const userQuitRequest = async (user, roomId, ws, email) => {
    if (user == null)
        return;
    let currentGame = null;
    for (let game of games) {
        if (game.id == roomId) {
            if (!game.quitRequests.includes(user.id)) {
                // game is not run yet or finished or user is not ready
                if (game.status == GAME_STATUS_WAIT || game.status == GAME_STATUS_END || user.status == GAME_STATUS_WAIT) {
                    const userModel = await users.findOne({ where: { id: user.id } });
                    await userModel.update({ lastGameId: 0 });
                    game.users[user.place] = new User({ avatar: '', bot: true });
                    if (!game.availableSeats.includes(user.place))
                        game.availableSeats.push(user.place);
                    JOINED_USERS[userModel.email] = null;
                }
                // game is running
                else {
                    user.status = GAME_STATUS_FOLD;
                    game.Fold(user);
                    game.quitRequests.push(user.id);

                }
            }
            else{

            }
            currentGame = game;

        }
    }

    if (currentGame && currentGame != null) {
        const message = `${currentGame.status===GAME_STATUS_START ?'Quit request success accepted. You will quit when this round finish':`You just quit from  ${currentGame.name} table`} `;
        // not registered on user list of current game 
        ws.send(JSON.stringify({ command: CMD_QUIT_ROOM, success: (currentGame.status===GAME_STATUS_START), game: currentGame.convertTransferObject(), target: user.id,message }))
        broadcastToRoom({ command: CMD_QUIT_ROOM, success: true, game: currentGame.convertTransferObject(), target: user.id, message, variant: 'success' }, currentGame);

        broadcastToClients({ command: CMD_GET_ROOM_LIST, list: (convertTransferObjects(games)) }, GAME_SERVER_SOCKET);

    }
    else {
        ws.send(JSON.stringify({ command: CMD_QUIT_ROOM, success: true, game: currentGame.convertTransferObject(), target: user.id, message: `Already requested, don't repeat`, variant: 'error' }))
    }
    return currentGame;
}
const userReady = (user, roomId, ws) => {
    let currentGame = null;

    for (let game of games) {
        if (game.id == roomId && user != null) {
            user.status = GAME_STATUS_READY;
            currentGame = game;
        }
    }
    if (currentGame != null) {
        // send game info
        broadcastToRoom({ command: GAME_STATUS_READY, success: true, game: currentGame.convertTransferObject() }, currentGame);

    }

}

const gameStart = async (roomId) => {
    // console.log(roomId);
    let currentGame = null;

    for (let game of games) {
        if (game.id == roomId) {
            for (let user of game.users){
                user.status = GAME_STATUS_READY;
            }
            
            currentGame = game;
            // console.log(currentGame);
        }
    }
    if (currentGame != null) {
        // send game info
        broadcastToRoom({ command: GAME_STATUS_READY, success: true, game: currentGame.convertTransferObject() }, currentGame);

    }
}

const kickUser = async (user_id, roomId) => {
    let currentGame = null;

    let oldGame = null;

    const userModel = await users.findOne({ where: { id: user_id } });

    const user = JOINED_USERS[userModel.email]; 
    //console.log('user', user);

    for (let game of games) {
        if (!game.quitRequests.includes(user.id)) {
            oldGame = game;
            // game is not run yet or finished or user is not ready
            if (game.status == GAME_STATUS_WAIT || game.status == GAME_STATUS_END || user.status == GAME_STATUS_WAIT) {
                const userModel = await users.findOne({ where: { id: user.id } });
                await userModel.update({ lastGameId: 0 });
                game.users[user.place] = new User({ avatar: '', bot: true });
                if (!game.availableSeats.includes(user.place))
                    game.availableSeats.push(user.place);
                JOINED_USERS[userModel.email] = null;
            }
            // game is running
            else {
                user.status = GAME_STATUS_FOLD;
                game.Fold(user);
                game.quitRequests.push(user.id);

            }

            currentGame = game;
        }
    }
    if (currentGame != null) {
        // send game info
        const message = `${currentGame.status===GAME_STATUS_START ?'Quit request success accepted. You will quit when this round finish':`You just quit from  ${currentGame.name} table`} `;
        user.ws.send(JSON.stringify({ command: CMD_QUIT_ROOM, success: (currentGame.status===GAME_STATUS_START), game: currentGame.convertTransferObject(), target: user.id,message }))
        // not registered on user list of current game 
        broadcastToRoom({ command: CMD_QUIT_ROOM, success: true, game: currentGame.convertTransferObject(), target: user.id, message, variant: 'success' }, currentGame);

    }
}

const userJoined = (user, roomId, isNew, ws) => {
    let currentGame = null;
    for (let game of games) {
        if (game.id == roomId && game.availableSeats.length > 0) {
            if (isNew) {
                // console.log('is new user', user)
                if (game.availableSeats.length > 0) {

                    const index = Math.random() * (game.availableSeats.length - 1);
                    const seat = game.availableSeats[Math.floor(index)];

                    user.place = seat;
                    user.ws = ws;
                    if(game.type != 0){
                        user.status = GAME_STATUS_READY;
                        user.balance = user.balance ? user.balance : game.minBalance;
                        user.type = 1;
                    }
                    game.users[seat] = user;
                    game.availableSeats.splice(game.availableSeats.indexOf(seat), 1);

                }
            }
            else {
                // console.log('is old user', user)
                game.users[user.place] = user;
                if (user.status != GAME_STATUS_WAIT) {
                }
                // game.availableSeats.splice(game.availableSeats.indexOf(user.place), 1);
                user.ws = ws;
            }
            currentGame = game;
        }
    }
    if (currentGame && currentGame != null) {
        if (isNew)
            broadcastToRoom({ command: CMD_JOIN_ROOM, success: true, game: currentGame.convertTransferObject() }, currentGame);
        else {
            if (user.status != GAME_STATUS_WAIT) {
                broadcastToRoom({ command: user.status, success: true, game: currentGame.convertTransferObject() }, currentGame);
                sendHandCards(user);
            }
            else {
                broadcastToRoom({ command: CMD_JOIN_ROOM, success: true, game: currentGame.convertTransferObject() }, currentGame);
            }
        }

        broadcastToClients({ command: CMD_GET_ROOM_LIST, list: (convertTransferObjects(games)) }, GAME_SERVER_SOCKET);
    }

    return currentGame;
}

const initEventListener = () => {
    for (const game of games) {
        game.on('startEvent', () => {
            // console.log('start game');
            if (LAST_USER_COMMAND[game.id]) {
                LAST_USER_COMMAND[game.id].id = 0;
                LAST_USER_COMMAND[game.id].command = '';
            }
            else {
                LAST_USER_COMMAND[game.id] = {}
            }
        })

        game.on('clearCommand', () => {
            // console.log('clear command');
            if (LAST_USER_COMMAND[game.id]) {
                LAST_USER_COMMAND[game.id].id = 0;
                LAST_USER_COMMAND[game.id].command = '';
            }
            else {
                LAST_USER_COMMAND[game.id] = {}
            }
        })
        game.on('finishEvent', () => {
            // console.log('received finish event')
            broadcastToClients({ command: CMD_GET_ROOM_LIST, list: (convertTransferObjects(games)) }, GAME_SERVER_SOCKET);
        })

        game.on('reSeatTable', async ()=>{

            // console.log('reseat');

            let temp = [];

            const target_players = game.users.filter((t)=>!t.bot).length;
            const siblingGames = games.filter(t => t.type == game.type);

            let available_players = 0;
            for (const siblingGame of siblingGames){
                let count = 7 - siblingGame.users.filter(t => !t.bot).length;
                available_players += count;
            }

            siblingGames.sort((a, b)=> b.users.filter((t)=>!t.bot).length - a.users.filter((t)=>!t.bot).length);

            // console.log('----------------game',siblingGames);

            if(available_players >= target_players){
                for (const siblingGame of siblingGames){
                    let count = 7 - siblingGame.users.filter(t => !t.bot).length;
                    if( count > 0 ){
                        for (let i = 0; i < count-1; i++) {

                            if( game.users.filter((t)=>!t.bot).length == 0 ) {
                                const index = games.findIndex(object => {
                                    return object.id === game.id;
                                });

                                games.splice(index, 1);

                                await rooms.destroy({where: { id: 2 }});
                            }

                            const user = game.users.filter((t)=>!t.bot)[0]; console.log('final================================', user);

                            if( !user ) {
                                continue;
                            }

                            game.users[user.place] = new User({ avatar: '', bot: true });

                            await sendStartTournament({command: 'start-tournament', user_id: user.id, roomId: siblingGame.id});               
                        }
                    } else {
                        continue;
                    }
                }
            } else {
                let check = target_players;
                for (const siblingGame of siblingGames){

                    const count = siblingGame.users.filter(t=> !t.bot).length;
                    for (let index = 0; index < count; index++) {
                        if( siblingGame.users.filter(t=>!t.bot).length < 5) {
                            break;
                        }
                        const user = siblingGame.users.filter(t=>!t.bot)[0];
                        siblingGame.users[user.place] = new User({ avatar: '', bot: true });

                        await sendStartTournament({command: 'start-tournament', user_id: user.id, roomId: game.id});   

                        check++;

                        if( check > 4 ){
                            return;
                        }
                    }
                }
            }         

        })

        game.on('finishTournamentEvent', async ()=>{

            // console.log("finishTournamentEvent");
            
        })

        game.on('current_players', async ()=>{
            // console.log('current players ===================================');
            const siblingGames = games.filter(t => t.type == game.type);

            let current_players = [];
            for (const siblingGame of siblingGames){
                let players = [];

                siblingGame.users.filter(t => !t.bot).map(t=>{
                    players.push({ id: t.id, fullName: t.fullName, avatar: t.avatar, status: t.status, balance: t.balance });
                });

                current_players = current_players.concat(players);
            }

            current_players.sort((a, b)=>b.balance - a.balance);

            broadcastToClients({ command: 'current-tournament-players', users: current_players, tournament_id: game.type }, GAME_SERVER_SOCKET);
        })
    }
}
const intervalUpdateGameList = () => {

    setTimeout(async () => {
        for (const game of games) {
            let changed = false;
            if (game.status == GAME_STATUS_WAIT || game.status == GAME_STATUS_END) {
                for (const player of game.users.filter(user => !user.bot)) {
                    if ((player.ws && player.ws.readyState != WebSocket.OPEN) || !player.ws) {
                        const user = await users.findOne({ where: { id: player.id } });
                        await user.update({ lastGameId: 0 });

                        JOINED_USERS[user.email] = null;

                        // await userModel.update({ lastGameId: 0 });
                        game.users[player.place] = new User({ avatar: '', bot: true });
                        if (!game.availableSeats.includes(player.place))
                            game.availableSeats.push(player.place);

                        changed = true;
                    }
                }
                if (changed) {
                    // console.log('closed client socket and remove this---------------')
                    broadcastToClients({ command: CMD_GET_ROOM_LIST, list: (convertTransferObjects(games)) }, GAME_SERVER_SOCKET);
                }

            }

        }

        intervalUpdateGameList();

    }, 2000);
}

const initializeServerSocket = async (server) => {
    try {
        // create round server
        const rss = new WebSocketServer({
            server,
            path: '/rss',
        });
        // create home server
        // console.log("initialize websocket server...")

        GAME_SERVER_SOCKET = rss;

        const initGame = new GameRoom({dataValues: DEFAULT_SETTING, users:createEmptyPlayers(7) });

        rss.on('connection', async (ws, req) => {
            const token = url.parse(req.url, true).query.token;
            // console.log(token, "connected new client", initGame);

            if (token)
                try {
                    const decode = jwt.verify(token, JWT_SECRET_KEY);

                    if (decode && decode.email) {

                        CLIENT_SOCKETS[decode.email] = ws;

                        ws.on('message', async (_data) => {
                            const data = JSON.parse(_data);
                            const { command, roomId } = data;
                            const user = await users.findOne({ where: { email: decode.email } });

                            // group chat
                            if(command == GAME_GROUP_CHAT){
                                // const nUser = JOINED_USERS[decode.email];
                                for(const game of games){
                                    if(game.id == parseInt(roomId)){
                                        
                                        broadcastToRoom(data, game);
                                    }
                                }
                                
                            }

                            // when user joined
                            if (command == CMD_JOIN_ROOM) {
                                if (user != null) {
                                    let nUser = new User(user.dataValues);
                                    let isNew = true;
                                    // logined new 
                                    if (!JOINED_USERS[decode.email]) {
                                        JOINED_USERS[decode.email] = nUser;
                                        user.lastGameId = parseInt(roomId);
                                        await user.save();
                                    }
                                    else {
                                        isNew = false;
                                        nUser = JOINED_USERS[decode.email];
                                        if ((nUser.ws && nUser.ws.readyState === WebSocket.OPEN && nUser.online)) {
                                            ws.send(JSON.stringify({ command: CMD_QUIT_ROOM, success: false, message: 'Already Playing with this email' }));
                                            return;
                                        }
                                    }
                                    const game = userJoined(nUser, parseInt(roomId), isNew, ws);

                                }
                                else {
                                    ws.send(JSON.stringify({ command, success: false }))
                                }
                            }

                            // when user request quit
                            if (command == CMD_QUIT_ROOM) {
                                const nUser = JOINED_USERS[decode.email];
                                const game = userQuitRequest(nUser, parseInt(roomId), ws, decode.email);
                                if (nUser == null || !nUser || game == null) {
                                    ws.send(JSON.stringify({ command: CMD_QUIT_ROOM, success: false, }))
                                }
                                user.lastGameId = 0;
                                await user.save();
                            }
                            // when user is ready
                            if (command == GAME_STATUS_READY) {
                                const nUser = JOINED_USERS[decode.email];
                                const game = userReady(nUser, parseInt(roomId), ws);
                            }
                            if (command == GAME_STATUS_CHECK) {
                                try {

                                    const nUser = JOINED_USERS[decode.email];
                                    if (LAST_USER_COMMAND[parseInt(roomId)] && LAST_USER_COMMAND[parseInt(roomId)]?.id === nUser.id && LAST_USER_COMMAND[parseInt(roomId)]?.cmd === command) {
                                        ws.send(JSON.stringify({ command: 'repeat', message: `can not repeat same command ${command}` }));
                                    }
                                    else {
                                        const game = games.filter((game) => game.id == parseInt(roomId))[0];
                                        nUser.status = command;
                                        game.Check(nUser);
                                        if (!LAST_USER_COMMAND[parseInt(roomId)]) {
                                            LAST_USER_COMMAND[parseInt(roomId)] = {}
                                        }
                                        LAST_USER_COMMAND[parseInt(roomId)].id = nUser.id;
                                        LAST_USER_COMMAND[parseInt(roomId)].cmd = command;

                                    }

                                }
                                catch (err) {
                                    console.log(err)
                                }


                            }
                            if (command == GAME_STATUS_FOLD) {
                                try {
                                    const nUser = JOINED_USERS[decode.email];
                                    if (LAST_USER_COMMAND[parseInt(roomId)] && LAST_USER_COMMAND[parseInt(roomId)]?.id === nUser.id && LAST_USER_COMMAND[parseInt(roomId)]?.cmd === command) {
                                        ws.send(JSON.stringify({ command: 'repeat', message: `can not repeat same command ${command}` }));
                                    }
                                    else {
                                        nUser.status = command;
                                        const game = games.filter((game) => game.id == parseInt(roomId))[0];
                                        game.Fold(nUser);
                                        if (!LAST_USER_COMMAND[parseInt(roomId)]) {
                                            LAST_USER_COMMAND[parseInt(roomId)] = {}
                                        }
                                        LAST_USER_COMMAND[parseInt(roomId)].id = nUser.id;
                                        LAST_USER_COMMAND[parseInt(roomId)].cmd = command;
                                    }
                                }
                                catch (err) {
                                    console.log(err)
                                }

                            }

                            if (command == GAME_STATUS_CALL || command == GAME_STATUS_RAISE || command == GAME_STATUS_ALLIN || command == GAME_STATUS_RAISEX) {
                                try {
                                    const nUser = JOINED_USERS[decode.email];
                                    if (LAST_USER_COMMAND[parseInt(roomId)] && LAST_USER_COMMAND[parseInt(roomId)]?.id === nUser.id && LAST_USER_COMMAND[parseInt(roomId)]?.cmd === command) {
                                        ws.send(JSON.stringify({ command: 'repeat', message: `can not repeat same command ${command}` }));
                                    }
                                    else {
                                        const { amount } = data;
                                        nUser.status = command;
                                        if(nUser.balance === amount)
                                            nUser.status = GAME_STATUS_ALLIN;

                                        const game = games.filter((game) => game.id == parseInt(roomId))[0];
                                        game.Bet(nUser, amount);
                                        if (!LAST_USER_COMMAND[parseInt(roomId)]) {
                                            LAST_USER_COMMAND[parseInt(roomId)] = {}
                                        }
                                        LAST_USER_COMMAND[parseInt(roomId)].id = nUser.id;
                                        LAST_USER_COMMAND[parseInt(roomId)].cmd = command;
                                    }
                                }
                                catch (err) {
                                    console.log(err)
                                }
                            }

                            if (data.command == CMD_GET_ROOM_LIST) {
                                console.log('list');
                                broadcastToClients({ command: CMD_GET_ROOM_LIST, list: (convertTransferObjects(games)) }, GAME_SERVER_SOCKET);
                            }

                            if (data.command == CMD_GET_TOURNAMENT_USERS) {
                                const tournament_players = await tournament_users.findAll({where: {tournament_id: data.id}, include: [users]});
                                const current_tournament = await tournaments.findOne({id: data.id});
                                // console.log(tournament_players);
                                broadcastToClients({ command: CMD_GET_TOURNAMENT_USERS, tournament: current_tournament, users: tournament_players, tournament_id: data.id }, GAME_SERVER_SOCKET);
                            }

                            // console.log('received from ws', data);

                        });

                        ws.on('close', (err) => {
                            const player = JOINED_USERS[decode.email];
                            // console.log(player);
                            if (player != null && player.isQuit) {
                                JOINED_USERS[decode.email] = null;
                                // broadcastToClients({ command: CMD_GET_ROOM_LIST, list: (convertTransferObjects(games)) }, GAME_SERVER_SOCKET);
                            }
                            if (player != null) {
                                player.online = false;
                            }
                            console.log('client socket is closed', err)
                        });
                    }
                    else {
                        ws.send(JSON.stringify({ success: false, message: 'TOKEN mismatched, close your connection' }));
                        ws.close();
                    }
                }
                catch (err) {
                    ws.close();
                }
            else {
                ws.on('message', async (_data) => {
                    const data = JSON.parse(_data);
                    // console.log(data, " received from client", games)
                    if (data.command == CMD_GET_ROOM_LIST) {
                        // initGames();
                        ws.send(JSON.stringify({ command: data.command, list: convertTransferObjects(games) }));
                    } else if (data.command == CMD_GET_TOURNAMENT_LIST) {
                        const allTournaments = await tournaments.findAll({where: { class: 0 }, include: [tournament_users]});
                        ws.send(JSON.stringify({ command: data.command, list: allTournaments }));
                    } else if (data.command == CMD_GET_SCOOP_LIST) {
                        const allTournaments = await tournaments.findAll({where: { class: 1 }, include: [tournament_users]});
                        ws.send(JSON.stringify({ command: data.command, list: allTournaments }));
                    } else if (data.command == CMD_GET_WCOOP_LIST) {
                        const allTournaments = await tournaments.findAll({where: { class: 2 }, include: [tournament_users]});
                        ws.send(JSON.stringify({ command: data.command, list: allTournaments }));
                    }
                })
                ws.on('close', () => {
                    console.log('disconnected');
                })
            }
        })


    }
    catch (err) {
    }
}

const updatedRooms = async (games) => {
    broadcastToClients({ command: CMD_GET_ROOM_LIST, list: (convertTransferObjects(games)) }, GAME_SERVER_SOCKET);
}

const updatedTournaments = async() => {
    const allTournaments = await tournaments.findAll({status: 'wait', include: [tournament_users]});
    broadcastToClients({ command: CMD_GET_TOURNAMENT_LIST, list: allTournaments }, GAME_SERVER_SOCKET);
}

const updatedRoom = async (roomId, room) => {

    let currentGame = null;
    for (let game of games) {
        if (game.id == roomId) {

            game.bigBind = room.bigBind;
            game.smallBind = room.smallBind;
            game.level = room.level;
            game.minBalance = room.minBalance;
            game.owner = room.owner;
           
            currentGame = game;

        }
    }

    // console.log('update ---------------------------',room, currentGame);
    broadcastToRoom({ command: CMD_UPDATE_ROOM, success: true, game: currentGame.convertTransferObject(), variant: 'success' }, currentGame);
}

const logout = async (email) => {
    if (CLIENT_SOCKETS[email]) {
        const ws = CLIENT_SOCKETS[email];
        if (ws.readyState == WebSocket.OPEN) {
            ws.close();
            CLIENT_SOCKETS[email] = null;

        }

    }
}

const broadcastToRoom = async (data, room) => {
    const players = room.users;
    try {
        for (const player of players) {

            if (!player.bot && player.ws && player.ws != null && (player.ws.readyState == WebSocket.OPEN)) {

                player.ws.send(JSON.stringify(data));
            }


        }
    }

    catch (err) {
        console.log(err);
    }
}

const broadcastToClients = async (data, wss) => {

    try {
        for (const ws of wss.clients) {
            if (ws.readyState == WebSocket.OPEN) {
                ws.send(JSON.stringify(data));
            }
        }
    }
    catch (err) {
        console.log(err);
    }
}

const sendStartTournament = async (data) => {
    try {
        for (const ws of GAME_SERVER_SOCKET.clients) {
            if (ws.readyState == WebSocket.OPEN) {
                ws.send(JSON.stringify(data));
            }
        }
    }
    catch (err) {
        console.log(err);
    }
}

const sendHandCards = async (player) => {

    if (player.ws && player.ws.readyState == WebSocket.OPEN) {
        player.ws.send(JSON.stringify({ command: GAME_HAND_CARD, cards: player.cards, target: player.id }));
    }

}

module.exports = {
    initializeServerSocket,
    updatedRooms,
    updatedRoom,
    logout,
    sendHandCards,
    broadcastToRoom,
    JOINED_USERS,
    intervalUpdateGameList,
    initEventListener,
    kickUser,
    updatedTournaments,
    sendStartTournament,
    gameStart
}