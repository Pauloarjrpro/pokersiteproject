
import { Icon } from "@iconify/react";
import { Box, Button, Container, Radio, Dialog, DialogContent, DialogTitle, IconButton, Stack, Typography, TextField, Tabs, Tab, Divider, List, ListItem, ListItemAvatar, ListItemText, Avatar } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import FormControlLabel from '@mui/material/FormControlLabel';

import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';

import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useWebSocket from 'react-use-websocket';
import GameTable from "../assets/GameTable";
// import ControlButtons from "../components/games/ControlButtons";
import DealerCards from "../components/games/DealerCards";
import GameControlTools from "../components/games/GameControlTools";
import GameReadyTools from "../components/games/GameReadyTools";
import GameResult from "../components/games/GameResult";
import Player from "../components/games/Player";
import Page from "../components/Page";
import { SERVER_HTTP_ADDR, SERVER_WSS_ADDR } from "../Config";
import useAuth from "../hooks/useAuth";
import { setCards } from "../redux/slice/game";
import { useDispatch } from "../redux/store";
import { fNumber } from "../utils/Formatter";
import EmojiPickerDrawer from "../components/games/EmojiPicker";

import axiosInstance, { API_GAME } from "../utils/axios";
import TournamentResult from "../components/games/TournamentResult";

import Confetti from 'react-confetti-boom';

const CMD_USER_JOINED = 'joined-game';
const CMD_GAME_CHECK = 'check';
const CMD_GAME_START = 'start';
const CMD_GAME_END = 'end';
const CMD_GAME_FOLD = 'fold';
const CMD_UPDATE_GAME = 'update-game';

const CMD_USER_QUIT = 'request-quit';
const CMD_HAND_CARDS = 'your-card';

const CMD_GAME_READY = 'ready';
const CMD_GROUP_CHAT = 'group-chat-message';

const layChipAudio = new Audio('/assets/audio/lay-chip.wav');


export default function GameYard() {
    const [currentPlayer, setCurrentPlayer] = useState(null);
    const [online, setOnline] = useState(false);
    const { user } = useAuth();
    const [game, setGame] = useState(null)
    const [you, setYou] = useState(null);
    const { roomId } = useParams();
    const [users, setUsers] = useState([]);
    const [tipTarget, setTipTarget] = useState(-1);
    const [tipAmount, setTipAmount] = useState(0);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();
    const [waitMessage, setWaitMessage] = useState('');
    const [visibleWait, setVisibleWait] = useState(false);
    const [resultDlg, setResultDlg] = useState(false);
    const [tournamentDlg, setTournamentDlg] = useState(false);
    const [gameResult, setGameResult] = useState();
    const [dealerCards, setDealerCards] = useState([]);
    const [stopBet, setStopBet] = useState(false);
    const [emoji, setEmoji] = useState([]);
    const [openChat, setOpenChat] = useState(false);
    const [quitRequest, setQuitRequest] = useState(false);
    const [openSetting, setOpenSettings] = useState(false);

    const [smallBind, setSB] = useState(0);
    const [bigBind, setBB] = useState(0);
    const [minBalance, setMinBalance] = useState(0);
    const [level, setLevel] = useState(0);

    const [tabNumber, setTabNumber] = useState("1");

    const handleCloseQuit = () => {
        setQuitRequest(!quitRequest);
    }
    const onMessageSend = (emoji, message) => {
        sendMessage(JSON.stringify({ command: CMD_GROUP_CHAT, roomId, emoji, message: `${message}/${Date.now()}`, src: user?.id }))
    }
    const onQuitRequest = () => {
        sendMessage(JSON.stringify({ command: CMD_USER_QUIT, roomId }));
        handleCloseQuit();
    }
    const onReady = () => {
        sendMessage(JSON.stringify({ command: CMD_GAME_READY, roomId }));

    }
    const onFold = () => {
        sendMessage(JSON.stringify({ command: CMD_GAME_FOLD, roomId }));
    }
    const onCheck = () => {
        sendMessage(JSON.stringify({ command: CMD_GAME_CHECK, roomId }));
    }
    const updatedGameInfomation = (game) => {
        let i = 0;
        let yourPosition = -1;
        let your = null;
        const serverPlayers = game.users;
        for (const player of serverPlayers) {
            if (player?.id === user.id && !player.bot) {
                // keep card 
                // if (you && you.cards.length === 2 && you.cards[0].shape != -1) {
                //     player.cards = you.cards;
                // }
                // else {
                setYou(player);
                // console.log(player, " is you");
                your = player;
                user.balance = player.balance;
                // }
                yourPosition = i;
            }
            i++;
        }

        if (yourPosition === -1) {
            console.log('No name on list');
            user.lastGameId = 0;
            navigate('/', { replace: true });
        }
        else {
            setUsers(serverPlayers.slice(yourPosition, serverPlayers.length).concat(serverPlayers.slice(0, yourPosition)));
            setGame(game);
            console.log(game);

            setCurrentPlayer(game.round.currentPlayer);

            setSB(game.smallBind);
            setBB(game.bigBind);
            setMinBalance(game.minBalance);
            setLevel(game.level);

        }
        if (game.status === CMD_GAME_START) {
            setVisibleWait(false);
        }

        if (game.round) {
            setDealerCards(game?.round?.dealerCards);
        }
        if (game.status === 'wait' && your?.status === CMD_GAME_READY) {
            setVisibleWait(true);
            setWaitMessage('Other Players & Start Game ');
        }

    }
    const onBet = (command, amount) => {
        const callAmount = game?.round?.callAmount;
        if (callAmount >= 0) {
            if (command === 'raiseX' && amount === 0) {
                onCheck();
            }
            else if (command === 'raiseX' && amount > 0) {
                command = 'raise';
            }
            sendMessage(JSON.stringify({ command, roomId, amount }));

        }

    }
    const openChatHandler = () => {
        setOpenChat(!openChat);
    }

    const openSettings = () => {
        setOpenSettings(true);
    }

    const handleCloseSettings = () => {
        setOpenSettings(false)
    }
    
    // socket function
    const { sendMessage } = useWebSocket(`${SERVER_WSS_ADDR}?token=${localStorage.getItem('accessToken')}`, {
        onOpen: () => {
            console.log("connected")
            setOnline(true);
            sendMessage(JSON.stringify({ command: CMD_USER_JOINED, roomId }));
        },
        onMessage: (evt) => {
            const data = JSON.parse(evt.data);
            const { command, success } = data;
            console.log(data, ' from server');
            if (command === CMD_GAME_READY) {
                if (success) {
                    updatedGameInfomation(data.game)
                }
            }
            if (command === CMD_UPDATE_GAME) {
                if (success) {
                    updatedGameInfomation(data.game)
                }
            }
            if (command === CMD_USER_JOINED) {
                if (success) {

                    updatedGameInfomation(data.game)
                }
            }
            if (command === CMD_USER_QUIT) {

                if (success) {
                    updatedGameInfomation(data.game)
                    if (data?.target === user?.id) {

                        enqueueSnackbar(data?.message || 'Success Accepted', { variant: data?.variant || 'success' });
                    }
                }
                else {
                    if (data.message) {
                        enqueueSnackbar(data.message, { variant: 'error' });
                    }
                    user.lastGameId = 0;
                    navigate('/', { replace: true });
                }
            }
            if (command === CMD_GAME_END) {
                dispatch(setCards([]));
                setEmoji([]);
                if (you?.status !== CMD_GAME_READY && you?.status !== 'wait')
                    showGameResult(data);
                setTimeout(() => {
                    updatedGameInfomation(data.game)
                }, 5000)

            }
            if (command === CMD_HAND_CARDS) {
                const target = data.target;

                if (target === user.id && you != null) {
                    dispatch(setCards(data.cards));
                    // you.cards = data.cards;
                    // setYou(you);
                }
            }
            if (command === CMD_GAME_FOLD) {
                const { target, game } = data;
                updatedGameInfomation(game);
                showTip(target, 0)

            }
            if (command === CMD_GAME_CHECK) {
                const { target, game } = data;
                showTip(target, 0)
                updatedGameInfomation(game);

            }
            if (command === CMD_GAME_START) {
                setStopBet(false)
                const { game } = data;
                setResultDlg(false);
                setTipTarget(-1);
                updatedGameInfomation(game);


            }
            if (command === CMD_GROUP_CHAT) {

                let emojies = emoji.slice(0, emoji.length);
                let find = false;
                for (const emo of emojies) {
                    if (emo.src === data.src) {
                        emo.emoji = data.emoji;
                        emo.message = data.message;
                        find = true;
                    }

                }
                if (!find) {
                    emojies.push({ ...data });
                }
                setEmoji(emojies);
            }
            if (command === 'call' || command === 'raise' || command === 'allin') {
                const { game, target, amount } = data;

                showTip(target, amount)
                updatedGameInfomation(game);
            }
            if (command === 'quit') {

                if (`${data.target}` === `${user.id}`) {
                    user.lastGameId = 0;
                    navigate('/', { replace: true });
                }
            }
            if (command === 'repeat') {
                const { message } = data;
                enqueueSnackbar(message, { variant: 'error' })
            }
            if (command === 'stop-betting') {
                setStopBet(true);
            }
            if (command === 'dealer-cards') {

                setDealerCards(data.cards);
            }

            if(command === 'tournament-end'){
                if (you?.status !== CMD_GAME_READY && you?.status !== 'wait'){
                    showTournamentResult(data);
                    console.log(data)
                }
            }

            if(command == "start-tournament" && data.user_id == user.id){
                navigate(`/game-yard/${data.roomId}`, { replace: true });
            }
        },
        onClose: (closeEvent) => {


        },
        onError: (event) => {


        },
        shouldReconnect: (closeEvent) => true,

    })

    const showTip = (target, amount) => {
        setTipTarget(target);
        setTipAmount(amount);

        if (amount > 0) {
            layChipAudio.play().then(_ => {

            }).catch(err => {

            });
        }

    }
    const handleClose = () => {

    }
    const showGameResult = (data) => {
        setGameResult(data);
        setResultDlg(true);
    }

    const showTournamentResult = (data) => {
        setGameResult(data);
        setTournamentDlg(true);
    }
    useEffect(() => {
        if (user.lastGameId > 0 && `${user.lastGameId}` !== `${roomId}`) {
            navigate(`/game-yard/${user.lastGameId}`, { replace: true })
        }
        else {
            layChipAudio.load();
        }

    }, [navigate, roomId, user])

    const handleChangeTab = (event, newValue) => {
        setTabNumber(newValue);
    };

    const onUpdateSettings = async () => {
        const res = await axiosInstance.post(`${API_GAME.update}?token=${localStorage.getItem('accessToken')}`,
            {
                roomId: game.id,
                smallBind: smallBind,
                bigBind: bigBind,
                minBalance: minBalance,
                level: level,
                owner: game.owner
            }
        );

        console.log(res);

        if(res.data.message == "success"){
            enqueueSnackbar(res.data.response, { variant: 'success' });
            setOpenSettings(false);
        }

        sendMessage(JSON.stringify({ command: 'get-game-list' }));
    }

    const handleChangeOwner = async (event) => {
        if(user.id != game?.owner){
            return;
        }
        const res = await axiosInstance.post(`${API_GAME.update}?token=${localStorage.getItem('accessToken')}`,
            {
                roomId: game.id,
                smallBind: smallBind,
                bigBind: bigBind,
                minBalance: minBalance,
                level: level,
                owner: event.target.value
            }
        );

        console.log(res);

        if(res.data.message == "success"){
            enqueueSnackbar(res.data.response, { variant: 'success' });
            setOpenSettings(false);
        }

        sendMessage(JSON.stringify({ command: 'get-game-list' }));
    };

    const kickUser = async (id) => {
        const res = await axiosInstance.post(`${API_GAME.kickUser}?token=${localStorage.getItem('accessToken')}`,
            {
                roomId: game.id,
                kickUser: id 
            }
        );

        console.log(res);

        if(res.data.message == "success"){
            enqueueSnackbar(res.data.response, { variant: 'success' });
            setOpenSettings(false);
        }

        sendMessage(JSON.stringify({ command: 'get-game-list' }));
    }
    
    return (
        <Page title="Multiplayer Poker game">
            {/*<DeviceOrientation lockOrientation={'landscape'}>
                {/*<Orientation orientation='landscape' alwaysRender={false}> */}
                    <div className="container w-full min-h-screen flex flex-col overflow-hidden items-center justify-end  mx-auto pb-1 relative ">
                        <div className="flex flex-col gap-2 w-full justify-start ">
                            {/* Avatar & balance */}
                            <div className="flex gap-1 absolute left-0 top-2  items-center justify-center">

                                <div className="h-[6vw] w-[6vw] rounded-full p-1  bg-gradient-to-tr from-red-900 to-white overflow-hidden z-10">
                                    <img src={`${SERVER_HTTP_ADDR}/${user.avatar}`} className={'h-full rounded-full aspect-square'} alt="">

                                    </img>


                                </div>
                                <div className="flex gap-1 text-black text-xs lg:text-lg font-bold  py-1 -ml-6 from-yellow-200 to-yellow-500 rounded-full z-0 pl-6 pr-2 bg-gradient-to-br">
                                    ${fNumber(you?.balance || user?.balance)}
                                </div>
                            </div>
                            {/* chat button */}
                            <div className="flex flex-col absolute left-0 top-[20vh] gap-2 ">
                                <IconButton onClick={handleCloseQuit}>
                                    <Icon icon='ic:round-keyboard-double-arrow-left' color='white' className={'w-8 lg:w-12 h-8 lg:h-12'} ></Icon>
                                </IconButton>

                                <IconButton onClick={openChatHandler}>
                                    <Icon icon='ph:chat-circle-text' color={'white'} className={'w-8 lg:w-12 h-8 lg:h-12'} />
                                </IconButton>


                            </div>
                            {/* setting button */}
                            <div className="flex flex-col absolute right-0 top-[20vh] gap-2 ">

                                <IconButton onClick={openSettings}>
                                    <Icon icon='ep:setting' color={'white'} className={'w-8 lg:w-12 h-8 lg:h-12'} />
                                </IconButton>
                                <IconButton>
                                    <Icon icon='carbon:help' color={'white'} className={'w-8 lg:w-12 h-8 lg:h-12'} />
                                </IconButton>

                            </div>
                        </div>
                        {/* VIP */}
                        <Box className={`absolute top-2 lg:top-5 -right-3 flex justify-center items-center scale-75 lg:scale-100 `} sx={{ mt: -4, width: 76, height: 94, background: `url(/assets/icons/vip_type_${Math.floor(user.level / 10)}.svg)` }} >
                            VIP{user?.level}
                        </Box>

                        {/* game table ui */}

                        <div className="w-2/3 relative mb-1 flex-1 items-center flex">
                            <div className="w-full h-full relative">
                                <GameTable />

                                <DealerCards game={game} player={users[0]} dealerCards={dealerCards} />
                                {users.map((user, index) => (

                                    <Player
                                        place={index + 1}
                                        user={user}
                                        key={index}
                                        isCurrent={game.round?.currentPlayer && (user?.id === game.round?.currentPlayer?.id) && !stopBet} isBigBlinder={(game.round?.bigBindPlayer && game.round?.bigBindPlayer?.id === user.id)} isDealerBlinder={(game.round?.dealerPlayer && game.round?.dealerPlayer?.id === user.id)}
                                        isSmallBlinder={game.round?.smallBindPlayer && (game.round?.smallBindPlayer?.id === user.id)}
                                        visibleTip={tipTarget > 0 && (user.id === tipTarget)}
                                        tipText={`${tipAmount > 0 ? (fNumber(tipAmount) + ',') : ''}${user.status}`}
                                        emoji={emoji.filter((e) => (user && e.src === user?.id))}

                                    />
                                ))}
                            </div>
                        </div>
                        {/* control ui */}
                        <div className="w-full h-12 mt-2 justify-center ">

                            {game?.status === CMD_GAME_START && currentPlayer != null && you?.id === currentPlayer?.id && !stopBet &&

                                <GameControlTools user={users[0]} onCheck={onCheck} onFold={onFold} onBet={onBet} callAmount={game?.round?.callAmount} bigBlind={(game?.smallBind || 0) * 2} />

                            }

                            {/* <ControlButtons title={'Quit'} icon={'arcticons:quicklyquit'} clss='from-red-600/60 to-red-900/60' id="quit" onClick={onQuitRequest} />
                       */}

                            {you?.status === 'wait' &&
                                <div className="flex w-full justify-center h-full">
                                    <GameReadyTools user={users[0]} onReady={onReady} onCancel={onQuitRequest} />
                                </div>
                            }
                        </div>
                    </div>
                {/*</Orientation> */}

                {/*<Orientation orientation='portrait' alwaysRender={false}> */}
                    <div className="w-full h-screen p-4 justify-center items-center flex ">
                        <div className='w-2/3'>
                            <img src='/assets/mobile-rotate-icon.png' alt=''>
                            </img>
                        </div>

                    </div>

                {/*</Orientation> */}
            {/*</DeviceOrientation> */}


            <Dialog onClose={handleClose} open={!online}>
                <DialogTitle>Socket Closed</DialogTitle>
                <DialogContent>
                    <Stack direction="column" gap={2}>
                        <Typography>Connection is closed, now trying to connect server..</Typography>
                        <Button variant="outlined" onClick={() => {
                            user.lastGameId = -1;
                            navigate('/', { replace: true });

                        }
                        }>Quit Game</Button>
                    </Stack>
                </DialogContent>
            </Dialog>
            <Dialog onClose={handleClose} open={visibleWait}>
                <DialogContent>
                    <div className="flex w-full gap-2 justify-center mb-2 items-center ">

                        <Typography sx={{ mb: 2 }} className={'text-xs md:text-sm text-center leading-none'}>
                            Waiting {waitMessage}
                        </Typography>
                        <Icon icon='eos-icons:three-dots-loading' width={30}></Icon>

                    </div>
                    <p className="text-2xs md:text-xs mb-2">
                        It will takes around 20 seconds.
                    </p>
                    <Stack sx={{ alignItems: 'end' }} >
                        <Button variant='outlined' onClick={onQuitRequest}>
                            Cancel
                        </Button>
                    </Stack>


                </DialogContent>

            </Dialog>
            <Dialog onClose={handleCloseQuit} open={quitRequest}>
                <DialogContent>
                    <Stack gap={2}>
                        <Stack direction="row" gap={2} alignItems={'center'} justifyContent={'center'}>
                            <Icon icon="ic:sharp-help-outline" width={24}></Icon>
                            <Typography>Are you sure want to quit?</Typography>
                        </Stack>

                        <Stack direction="row" gap={2} justifyContent={'end'}>
                            <Button variant={'outlined'} onClick={onQuitRequest}>
                                Confirm
                            </Button>
                            <Button variant={'outlined'} onClick={handleCloseQuit}>
                                Cancel
                            </Button>
                        </Stack>
                    </Stack>
                </DialogContent>
            </Dialog>
            <Dialog onClose={handleCloseSettings} open={openSetting} fullWidth={true} maxWidth={"xl"}>
                <DialogTitle>Game Settings</DialogTitle>
                <DialogContent>
                    <Box sx={{ width: '100%', typography: 'body1' }}>
                        <TabContext value={tabNumber}>
                            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                <TabList onChange={handleChangeTab} aria-label="lab API tabs example">
                                    <Tab label="Players" value="1" />
                                    <Tab label="Games" value="2" />
                                </TabList>
                            </Box>
                            <TabPanel value="1">
                            <List dense={false}>
                            {users.map((player, index) =>{
                                if(!player.bot){
                                    return (
                                        <ListItem
                                            secondaryAction={
                                                <>
                                                <FormControlLabel 
                                                    control={
                                                    <Radio
                                                        checked={player.id == game?.owner}
                                                        onChange={handleChangeOwner}
                                                        value={player.id}
                                                        name="radio-buttons"
                                                        inputProps={{ 'aria-label': 'A' }}
                                                    />
                                                    } 
                                                    label="Owner" 
                                                />
                                                
                                                <IconButton edge="end" aria-label="delete" disabled={player.id == game?.owner || user.id != game?.owner} onClick={()=>kickUser(player.id)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                                </>
                                            }
                                            key={index}
                                        >
                                            <ListItemAvatar>
                                                <Avatar src={`${SERVER_HTTP_ADDR}/${player.avatar}`} />
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={player.fullName}
                                                secondary={false ? 'Secondary text' : null}
                                            />
                                        </ListItem>
                                        )
                                }
                            })}
                                </List>
                            </TabPanel>
                            <TabPanel value="2">
                                <Stack direction="row" gap={2} justifyContent={'between'} alignItems="center" sx={{ marginBottom: "20px" }}>
                                    <TextField label="Small Bind" placeholder="" name="smallBind" className="mt-2" onChange={(e)=>setSB(e.target.value)} value={smallBind}/>
                                    <TextField label="Big Bind" placeholder="" name="bigBind" className="mt-2" onChange={(e)=>setBB(e.target.value)} value={bigBind} />
                                    <TextField label="Min Balance" placeholder="" name="minBalance" className="mt-2" onChange={(e)=>setMinBalance(e.target.value)} value={minBalance} />
                                    <TextField label="Level" placeholder="" name="level" className="mt-2" onChange={(e)=>setLevel(e.target.value)} value={level} />
                                </Stack>
                                <Divider />
                                {user.id == game?.owner &&
                                <Stack direction="row" gap={2} justifyContent={'start'} sx={{ marginTop: "20px" }}>
                                    <Button variant={'outlined'} onClick={onUpdateSettings}>
                                        Confirm
                                    </Button>
                                    <Button variant={'outlined'} onClick={handleCloseSettings}>
                                        Cancel
                                    </Button>
                                </Stack>
                                }
                            </TabPanel>
                        </TabContext>
                    </Box>
    
                </DialogContent>
            </Dialog>
            
            {resultDlg &&
                <GameResult winners={gameResult.winners} players={gameResult.players} round={gameResult?.game.round} yourId={user?.id} onQuit={onQuitRequest} />
            }

            {tournamentDlg &&
                <TournamentResult game={gameResult.game} winners={gameResult.players} players={gameResult.players} round={gameResult?.game.round} yourId={user?.id} onQuit={onQuitRequest} />
            }

            {tournamentDlg &&
                <Confetti />
            }
            <EmojiPickerDrawer open={openChat} onClose={openChatHandler} onSelected={onMessageSend} />

        </Page>
    )
}