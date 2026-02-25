const { GAME_STATUS_WAIT, GAME_STATUS_READY, GAME_STATUS_ALLIN } = require("../utils/WebsocketConstant");
const Database = require('../models/Model');
const { results } = require("../models/Model");
const logs = Database.bets;
const wins = Database.results;

const users = Database.users;

const STRAIGHT_PATTENS = [[13, 12, 11, 10, 9], [12, 11, 10, 9, 8], [11, 10, 9, 8, 7], [10, 9, 8, 7, 6], [9, 8, 7, 6, 5], [8, 7, 6, 5, 4], [7, 6, 5, 4, 3], [6, 5, 4, 3, 2], [5, 4, 3, 2, 1]];

const FLUSH_PATTENS = [[0, 0, 0, 0, 0], [1, 1, 1, 1, 1], [2, 2, 2, 2, 2], [3, 3, 3, 3, 3]];


class User {
    constructor(data) {
        this.avatar = data?.avatar;
        this.fullName = data?.fullName;
        this.status = GAME_STATUS_WAIT;
        this.cards = [];
        this.balance = data?.balance;
        this.betAmount = 0;
        this.id = data?.id;
        this.level = data?.level;
        this.isQuit = false;
        this.bot = data?.bot || false;
        this.place = -1;
        this.ws = null;
        this.betted = false;
        this.profitAmount = 0;
        this.weightedCard = null;
        this.online = true;
        this.type = 0;

    }
    getCardHeavy() {
        if (this.weightedCard != null) {
            return this.weightedCard.heavy * Math.pow(10, 10) + this.weightedCard.subHeavy;
        }
        return 0;
    }
    changeStatus(status) {
        this.status = status;
        if (status === GAME_STATUS_READY) {

        }
    }
    pushCards(card) {
        this.cards.push(card)
    }
    clearCards() {
        this.cards = [];
    }

    saveBet(betAmount, roundId, roomId, isLast = false) {
        this.balance -= betAmount;
        this.betAmount += betAmount;
        logs.create({
            roomId, roundId, user: this.id, beforeBalance: (this.balance + betAmount), betAmount, currentBalance: this.balance, isLast
        }).then(res => {

        }).catch(err => {
            console.log(err)
        })

        if( this.type == 0 ) {
            users.findOne({ where: { id: this.id } }).then((user) => user.update({ wagered: (user.wagered + betAmount), balance: this.balance })).catch(err => { console.log(err) });
        }

    }
    saveWin({ winners, kickCount, roomId, roundId, winAmount }) {
        results.create({
            winners, kickCount, roomId, roundId,winAmount,
            user: this.id, heavy: this.weightedCard.heavy, subHeavy: this.weightedCard.subHeavy, cards: JSON.stringify(this.cards), betAmount: this.betAmount,isAllin:(this.status==GAME_STATUS_ALLIN),
        })

        if( this.type == 0 ) {
            users.findOne({ where: { id: this.id } }).then((user) => user.update({ balance: this.balance })).catch(err => { console.log(err) });
        }
        
    }
    hideCards() {
        if (this.cards.length == 2) {
            return [{ shape: 0, value: 'A' }, { shape: 0, value: 'A' }]
        }
        return [{ shape: -1, value: 'A' }, { shape: -1, value: 'A' }]
    }
    getCardWeight(dealerCards) {
        // check straight cards         

        const cards = dealerCards.concat(this.cards).sort((a, b) => (b.weight - a.weight));
        const patterns = Array.from(new Set(cards.map((c) => c.weight)));
        const flowers = cards.map((c) => c.shape)
        const weights = cards.map((c) => c.weight);
        flowers.sort();
        // check flush
        let flush = [];
        const f1 = flowers.slice(0, 5);
        const f2 = flowers.slice(1, 6);
        const f3 = flowers.slice(2, 7);
        for (const pattern of FLUSH_PATTENS) {
            if (f1.every(p => pattern.includes(p))) {
                flush = f1;
                break;
            }
            else if (f2.every(p => pattern.includes(p))) {
                flush = f2;
                break;
            }
            else if (f3.every(p => pattern.includes(p))) {
                flush = f3;
                break;
            }
        }


        // check straight
        let straight = [];
        let p1, p2, p3;
        if (patterns.length === 5) {
            p1 = patterns.slice(0, 5);
        }
        if (patterns.length === 6) {
            p1 = patterns.slice(0, 5);
            p2 = patterns.slice(1, 6);
        }
        if (patterns.length === 7) {
            p1 = patterns.slice(0, 5);
            p2 = patterns.slice(1, 6);
            p3 = patterns.slice(2, 7);
        }
        for (const pattern of STRAIGHT_PATTENS) {
            if (p1 && p1.every(p => pattern.includes(p))) {
                straight.push(p1);

            }
            else if (p2 && p2.every(p => pattern.includes(p))) {
                straight.push(p2);

            }
            else if (p3 && p3.every(p => pattern.includes(p))) {
                straight.push(p3);

            }
        }


        // check full house
        let fourKind = null;
        let threeKind = null;
        let twoPair = [];
        let onePair = null;

        let fullHouse = [];
        const threeKinds = [];
        const twoPairs = [];
        const cardKinds = this.checkKind(weights);

        for (const kind of cardKinds) {
            if (kind.number === 4) {
                fourKind = kind;
            }
            if (kind.number === 3) {
                if (threeKinds.length > 0) {
                    if (kind.weight > threeKinds[0].weight) {
                        threeKinds[0] = kind;
                    }
                }
                else
                    threeKinds.push(kind);
            }
            if (kind.number === 2) {

                twoPairs.push(kind);
            }
            twoPairs.sort((a, b) => (b.weight - a.weight))
        }
        // full house
        if (threeKinds.length > 0 && twoPairs.length > 0) {
            fullHouse = [threeKinds[0].weight, twoPairs[0].weight];
        }
        // three kind
        if (threeKinds.length > 0 && twoPairs.length == 0) {
            threeKind = threeKinds[0];
        }
        //two pair
        if (twoPairs.length == 2) {
            twoPair = [twoPairs[0].weight, twoPairs[1].weight];
        }
        // one pair
        if (twoPairs.length == 1) {
            onePair = twoPairs[0];

        }
        // console.log(dealerCards, this.cards, this.fullName);

        // check royal cards
        let royalFlushes = [];
        if (flush.length > 0 && straight.length > 0) {
            const f = flush[0];
            let isRoyal = false;
            for (const scard of straight) {
                let royalFlush = [];
                for (const s of scard) {

                    for (const card of cards) {

                        if (card.weight == s && card.shape == f) {
                            royalFlush.push((card));
                        }
                    }

                }
                royalFlushes.push(royalFlush);
            }
        }

        // console.log('royalFlush', royalFlushes.length > 0 ? royalFlushes[0] : null);
        // console.log(fourKind, "is four kind");
        // console.log(fullHouse, "is full house");
        // console.log('flush', flush);
        // console.log('straight', straight);
        // console.log(threeKind, "is three kind");
        // console.log(twoPair, "is two pairs");
        // console.log(onePair, "is one pairs");

        if (royalFlushes.length > 0 && royalFlushes[0].length === 5) {
            return { heavy: 9, subHeavy: royalFlushes[0].weight, cards: royalFlushes[0] }
        }
        else if (fourKind != null) {
            let fourCards = [];
            let lastCard = null;
            for (const card of cards) {
                if (card.weight == fourKind.weight) {
                    fourCards.push(card);
                }
                else {
                    if (lastCard === null)
                        lastCard = card;
                }
            }
            return { heavy: 8, subHeavy: fourKind.weight * 100 + lastCard.weight, cards: fourCards.concat([lastCard]) }
        }
        else if (fullHouse.length == 2) {
            let fullHouseCards = [];
            for (const card of cards) {
                if (card.weight == fullHouse[0] || card.weight == fullHouse[1]) {
                    fullHouseCards.push(card);
                }
            }
            return { heavy: 7, subHeavy: fullHouse[0] * 100 + fullHouse[1], cards: fullHouseCards }
        }
        else if (flush.length > 0) {
            let flushCards = [];

            for (const card of cards) {
                if (card.shape == flush[0]) {
                    flushCards.push(card);
                }
            }
            return { heavy: 6, subHeavy: (flushCards[0].weight * Math.pow(10, 8) + flushCards[1].weight * Math.pow(10, 6) + flushCards[2].weight * Math.pow(10, 4) + flushCards[3].weight * Math.pow(10, 2) + flushCards[4].weight), cards: flushCards }
        }
        else if (straight.length > 0) {
            const highStraight = straight[0];
            let straightCards = [];
            for (const card of cards) {
                if (highStraight.includes(card.weight)) {
                    straightCards.push(card);
                }
            }
            return { heavy: 5, subHeavy: (highStraight[0] * Math.pow(10, 8) + highStraight[1] * Math.pow(10, 6) + highStraight[2] * Math.pow(10, 4) + highStraight[3] * Math.pow(10, 2) + highStraight[4]), cards: straightCards }
        }
        else if (threeKind != null) {
            let threeKindCards = [];
            for (const card of cards) {
                if (card.weight == threeKind.weight) {
                    threeKindCards.push(card);
                }
            }
            const removed = [];

            for (const card of cards.slice(0, cards.length)) {
                if (card.weight != threeKind.weight) {
                    removed.push(card);
                }
            }
            removed.sort((a, b) => b.weight - a.weight);

            return { heavy: 4, subHeavy: (threeKind.weight * 10000 + removed[0].weight * 100 + removed[1].weight), cards: threeKindCards.concat([removed[0], removed[1]]) }

        }
        else if (twoPair.length == 2) {
            let twoPairCards = [];
            let lastCard = null;
            for (const card of cards) {
                if (twoPair.includes(card.weight)) {
                    twoPairCards.push(card);
                }
                else {
                    if (lastCard == null)
                        lastCard = card;
                }
            }
            return { heavy: 3, subHeavy: (twoPair[0] * 10000 + twoPair[1] * 100 + lastCard.weight), cards: twoPairCards.concat([lastCard]) }
        }
        else if (onePair != null) {
            let onePairCards = [];
            let subHeavy = 0;
            for (const card of cards) {
                if (card.weight == onePair.weight) {
                    onePairCards.push(card);
                    subHeavy = card.weight;
                }
            }

            const removed = [];

            for (const card of cards.slice(0, cards.length)) {
                if (card.weight != onePair.weight) {
                    removed.push(card);
                }
            }
            removed.sort((a, b) => b.weight - a.weight);

            return { heavy: 2, subHeavy: (subHeavy * Math.pow(10, 6) + removed[0].weight * Math.pow(10, 4) + removed[1].weight * Math.pow(10, 2) + removed[2].weight), cards: onePairCards.concat([removed[0], removed[1], removed[2]]) }
        }
        else {
            const sorted = cards.slice(0, 5);
            return {
                heavy: 1, subHeavy: (sorted[0].weight * Math.pow(10, 8) + sorted[1].weight * Math.pow(10, 6) + sorted[2].weight * Math.pow(10, 4) + sorted[3].weight * Math.pow(10, 2) + sorted[4].weight), cards: sorted
            }
        }
    }
    checkKind(cards) {
        const sames = [];
        const patterns = [];
        for (const w of cards) {
            if (!patterns.includes(w)) {
                let number = 0;
                for (const ws of cards) {
                    if (w === ws) {
                        number++;
                    }
                }
                if (number >= 2)
                    sames.push({ weight: w, number });
                patterns.push(w);
            }

        }

        sames.sort((a, b) => {
            if (a.number > b.number) {
                return a
            }
            else {
                return b;
            }
        })
        return sames;
    }

    convertTransferObject() {
        return {
            avatar: this.avatar,
            fullName: this.fullName,
            id: this.id,
            balance: this.balance,
            level: this.level,
            betAmount: this.betAmount,
            status: this.status,
            isQuit: this.isQuit,
            bot: this.bot,
            online:this.online,
            profitAmount:this.profitAmount,
            cards: this.hideCards()
        }
    }
}
module.exports = {
    User
}