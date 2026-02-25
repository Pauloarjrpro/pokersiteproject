const express = require('express');
const router = express.Router();
const GameController = require('../../controllers/GameController');
const CacheMiddleware = require('../../middleware/CacheMiddleware');
const auth = require('../../middleware/AuthMiddleware');

router.get(
    "/get-pool",
    GameController.getPool
)

router.post(
    "/create",
    auth,
    GameController.createGame
)

router.post(
    "/update",
    auth,
    GameController.updateGame
)

router.post(
    "/kickUser",
    auth,
    GameController.kickUser
)

module.exports = router;    