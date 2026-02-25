

class Round {
    constructor(game) {
        this.roundIndex = 1;
        this.game = game;
        this.when = '';
        this.status = game.status;
        this.cards = [];
        this.dealerCards = [{side:'B'},{side:'B'},{side:'B'},{side:'B'},{side:'B'}];
        this.currentPlayer = null;
        this.bigBindPlayer = null;
        this.smallBindPlayer = null;
        this.dealerPlayer = null;
        this.users = game.users;
        this.betAmount = 0;
        this.callAmount = 0;

    }
    initialize(game){
        this.roundIndex++;
        this.when = Date.now();
        this.status = game.status;
        this.cards = [];
        this.dealerCards = [{side:'B'},{side:'B'},{side:'B'},{side:'B'},{side:'B'}];
        this.currentPlayer = null;
        this.bigBindPlayer = null;
        this.smallBindPlayer = null;
        this.dealerPlayer = null;
        this.users = game.users;
        this.betAmount = 0;
        this.callAmount = 0;
    }
    updatedGame(game) {
        this.game = game;
    }
    start() {

    }
    next() {

    }
    stop() {

    }
    convertTransferObject() {
        return {
            roundIndex: this.roundIndex,
            when:this.when,
            betAmount:this.betAmount,
            callAmount:this.callAmount,
            dealerCards:this.dealerCards,
            currentPlayer:this.currentPlayer?.convertTransferObject()||null,
            bigBindPlayer:this.bigBindPlayer?.convertTransferObject()||null,
            smallBindPlayer:this.smallBindPlayer?.convertTransferObject()||null,
            dealerPlayer:this.dealerPlayer?.convertTransferObject()||null,
        }

    }

}

module.exports = {
    Round,
}