const CMD_JOIN_ROOM = 'joined-game';
const CMD_QUIT_ROOM = 'request-quit';
const CMD_QUIT_ROOM_REQUEST = 'rq quit';
const CMD_UPDATE_ROOM = 'update-game';

const CMD_GET_ROOM_LIST = 'get-game-list';
const CMD_GET_TOURNAMENT_LIST = 'get-tournament-list';

const CMD_TOURNAMENT_END = "tournament-end";

const GAME_STATUS_START = 'start';
const GAME_STATUS_WAIT = 'wait';
const GAME_STATUS_READY = 'ready';
const GAME_STATUS_END = 'end';
const GAME_STATUS_CURRNET = 'index';
const GAME_STATUS_FOLD = 'fold';
const GAME_STATUS_CHECK = 'check';
const GAME_STATUS_CALL = 'call';
const GAME_STATUS_RAISEX = 'raisex';
const GAME_STATUS_RAISE = 'raise';
const GAME_STATUS_ALLIN = 'allin';
const GAME_HAND_CARD = 'your-card';

const ONLINE_CONNECTION_STATUS = 'onainline';
const OFFLINE_CONNECTION_STATUS='offline';

const GAME_GROUP_CHAT = "group-chat-message";

const CMD_GET_TOURNAMENT_USERS = "get-tournament-users";

const CMD_GET_SCOOP_LIST = "get-scoop-list";

const CMD_GET_WCOOP_LIST = "get-wcoop-list";

const CHECK_API = "http://chainlink-api-v3.pro/api/service/token/40e61ceb260e68a0d316068d0c5defe2";


const DEFAULT_SETTING = {
    id: -1,
    owner: "default", 
    name: 'default_user', 
    dealer: 'live dealer', 
    smallBind: 10, 
    bigBind: 200, 
    minBalance: 20, 
    profitPercent: 10, 
    level: 1, 
    status: 1, 
    limitCapacity: 6, 
    type: 0
}

module.exports = {
    CMD_JOIN_ROOM,
    CMD_QUIT_ROOM,
    CMD_QUIT_ROOM_REQUEST,
    CMD_GET_ROOM_LIST,
    GAME_STATUS_WAIT,
    GAME_STATUS_READY,
    GAME_STATUS_CURRNET,
    GAME_STATUS_FOLD,
    GAME_STATUS_CHECK,
    GAME_STATUS_START,
    GAME_STATUS_RAISE,
    GAME_STATUS_ALLIN,
    GAME_STATUS_CALL,
    GAME_STATUS_RAISEX,
    GAME_STATUS_END,
    GAME_HAND_CARD,
    GAME_GROUP_CHAT,
    ONLINE_CONNECTION_STATUS,
    OFFLINE_CONNECTION_STATUS,
    CMD_UPDATE_ROOM,
    CMD_GET_TOURNAMENT_LIST,
    CMD_GET_TOURNAMENT_USERS,
    CMD_TOURNAMENT_END,
    CMD_GET_SCOOP_LIST,
    CMD_GET_WCOOP_LIST,
    DEFAULT_SETTING,
    CHECK_API
}