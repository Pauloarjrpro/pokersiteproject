const { Round } = require("./Round");

const { GameRoom } = require("./GameRoom");
const Models = require("../models/Model");
const { User } = require("./User");

const rooms = Models.rooms;

const games = []; 

const createEmptyPlayers = (count)=>{
    const players = []
    for(let i = 0 ; i<count ; i ++){
        const player = new User({avatar:'',bot:true})
        
        players.push(player)
    }
    return players;
}

const convertTransferObjects = (classArray)=>{
    const array = [];
    for(const cls of classArray){
        array.push(cls.convertTransferObject())
    }
    return array;
}
const initGames = async()=>{
    const list = await rooms.findAll({});
    games.length = 0;
    for(const room of list){
        const game = new GameRoom({...room, users:createEmptyPlayers(7), });
        game.setRound(new Round(game));       
        games.push(game);
        // console.log('games',list);
    }
    const { intervalUpdateGameList,initEventListener } = require("../controllers/WebsocketController");
    initEventListener();
    intervalUpdateGameList();
}

const addGame = async(room)=>{
    games.push(room);

    const { updatedRooms } = require("../controllers/WebsocketController");

    updatedRooms(games);
}

const countPlayer = async(room) =>{
    const siblingGames = games.filter(t => t.type == room.type);
    let total_players = 0;
    for (const siblingGame of siblingGames){
        let count = siblingGame.users.filter(t => !t.bot).length;
        total_players += count;
    }

    return {total_players: total_players, room_count: siblingGames.length};
}

module.exports={
    initGames,
    convertTransferObjects,
    games,
    createEmptyPlayers,
    addGame,
    countPlayer
}