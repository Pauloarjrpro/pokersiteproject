const express = require('express');
const router = express.Router();
const GameController = require('../../controllers/GameController');
const TournamentController = require('../../controllers/TournamentController');
const CacheMiddleware = require('../../middleware/CacheMiddleware');
const auth = require('../../middleware/AuthMiddleware');

router.post(
    "/create",
    auth,
    TournamentController.createGame
)

router.post(
    "/join",
    auth,
    TournamentController.joinGame
)

router.post(
    "/kickUser",
    auth,
    GameController.kickUser
)

router.post(
    "/updateMember",
    auth,
    TournamentController.updateMember
)

router.post(
    "/update",
    auth,
    TournamentController.updateGame
)

router.post(
    '/start',
    auth,
    TournamentController.startGame
)

module.exports = router;    