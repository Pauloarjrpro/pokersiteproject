import { Box, Button, Container, Divider, Typography, Tab, List, ListItem, FormControlLabel, Radio, IconButton, ListItemAvatar, Avatar, ListItemText, Stack, TextField, Dialog, DialogContent, DialogTitle, FormControl, InputLabel, Select, MenuItem } from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";

import { useEffect, useState } from "react";
import Page from "../../components/Page";
import CurrentTournaments from "./currentTournaments";
import axiosInstance, { API_GAME, API_TOURNAMENT } from "../../utils/axios";
import { fNumber } from "../../utils/Formatter";
import { SERVER_HTTP_ADDR, SERVER_WSS_ADDR } from "../../Config";
import useWebSocket from 'react-use-websocket';

import useAuth from "../../hooks/useAuth";

let interval = 0;
let countInterval = 0;
let remains = 3600 * 24;

export default function ChooseGameRooms(props) {
    const tournamentId = props.roomId;
    const { user } = useAuth();
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    const [prizePool, setPrizePool] = useState(0);
    const [tabNumber, setTabNumber] = useState("1");
    const [users, setUsers] = useState([]);
    const [game, setGame] = useState(null);
    const [statusModal, setStatusModal] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [tournament, setTournament] = useState(null);

    const [currentPlayers, setCurrentPlayers] = useState([]);

    const [name, setName] = useState("");

    const [smallBind, setSB] = useState(0);
    const [bigBind, setBB] = useState(0);
    const [minBalance, setMinBalance] = useState(0);
    const [type, setType] = useState(0);
    const [first, setFirst] = useState(0);
    const [second, setSecond] = useState(0);
    const [third, setThird] = useState(0);

    const CounterDown = ({ time }) => {
        const h = Math.floor(time / 3600);
        const m = Math.floor(time % 3600 / 60);
        const s = time - h * 3600 - m * 60;

        return (
            <Box sx={{ display: 'flex', border: '1px solid gray', borderRadius: 2, borderColor: 'divider', gap: 2, padding: 2 }}>
                <div className="flex flex-col gap-2 justify-center items-center flex-1">
                    <Typography variant="h3" color="yellow">{h < 10 ? `0${h}` : h}</Typography>
                    <Typography variant="h4">&nbsp;Hours&nbsp;</Typography>
                </div>
                <div className="flex flex-col gap-2 justify-center items-center  flex-1">
                    <Typography variant="h3" color="yellow">{m < 10 ? `0${m}` : m}</Typography>
                    <Typography variant="h4">Minutes</Typography>
                </div>
                <div className="flex flex-col gap-2 justify-center items-center  flex-1">
                    <Typography variant="h3" color="yellow">{s < 10 ? `0${s}` : s}</Typography>
                    <Typography variant="h4">Seconds</Typography>
                </div>
            </Box>
        )
    }
    const [remainPoolTime, setRemainPoolTime] = useState(remains);
    // useEffect(() => {
    //     const feach = async () => {
    //         const res = await axiosInstance.get(API_GAME.pool);
    //         if (res.status === 200 && res.data.result) {
    //             setPrizePool(res.data.result.pools.reduce((a, b) => (a + b.poolAmount), 0));
    //             const time = new Date(res.data.result.current);
    //             remains = 86400 - time.getHours() * 3600 - time.getMinutes() * 60 - time.getSeconds();

    //         }

    //     }
    //     interval = setInterval(() => {
    //         feach();
    //     }, 10000)
    //     feach();
    //     return () => {
    //         clearInterval(interval);
    //     }
    // }, []);
    useEffect(() => {
        countInterval = setInterval(() => {
            setRemainPoolTime(remains);
            remains--;
        }, 1000);

        return () => {
            clearInterval(countInterval);
        }
    }, []);

    const handleChangeTab = (event, newValue) => {
        setTabNumber(newValue);
    };

    const { sendMessage, readyState } = useWebSocket(`${SERVER_WSS_ADDR}?token=${localStorage.getItem('accessToken')}`, {
        onOpen: () => {

            sendMessage(JSON.stringify({ command: 'get-tournament-users', id: tournamentId }));
        },
        onMessage: (evt) => {

            try {
                const data = JSON.parse(evt.data);

                console.log("command", data.command, data);

                if (data && data.users && data.command === 'get-tournament-users' && data.tournament_id == tournamentId) {
                    setUsers(data.users);
                    setTournament(data.tournament);
                    setName(data.tournament.name);
                    setSB(data.tournament.smallBind);
                    setBB(data.tournament.bigBind);
                    setType(data.tournament.type);
                    setFirst(data.tournament.first);
                    setSecond(data.tournament.second);
                    setThird(data.tournament.third);
                    setMinBalance(data.tournament.initial_stack);
                } else if(data && data.command == "get-tournament-list"){
                    const current_tournament = data.list.find((t) => t.id == tournamentId);
                    setName(current_tournament.name);
                    setSB(current_tournament.smallBind);
                    setBB(current_tournament.bigBind);
                    setType(current_tournament.type);
                    setFirst(current_tournament.first);
                    setSecond(current_tournament.second);
                    setThird(current_tournament.third);
                    setMinBalance(current_tournament.initial_stack);
                } else if(data && data.command == "start-tournament" && data.user_id == user.id){
                    navigate(`/game-yard/${data.roomId}`, { replace: true });
                } else if(data && data.command == "current-tournament-players" && data.tournament_id == tournamentId){
                    console.log('current players', data.users);
                    setCurrentPlayers(data.users);
                }
            }
            catch (err) {
            }
        },
        shouldReconnect: (closeEvent) => true,

    })

    const handleStatus = (player) => {
        if (user.id != tournament.owner) {
            return;
        }
        setSelectedPlayer(player)
        setStatusModal(true);
    }

    const handleClose = () => {
        setStatusModal(false);
    }

    const changeStatus = async (playerId, status) => {
        const res = await axiosInstance.post(`${API_TOURNAMENT.updateMember}?token=${localStorage.getItem('accessToken')}`, {
            playerId: playerId,
            status: status
        });
        if (res.status === 200) {
            enqueueSnackbar(res.data.response, { variant: 'success' });
            setStatusModal(false);
        }

        sendMessage(JSON.stringify({ command: 'get-tournament-users', id: tournamentId }));

    }

    const handleChangeType = (e) => {
        setType(e.target.value);
    }

    const handleUpdate = async () => {
        const res = await axiosInstance.post(`${API_TOURNAMENT.updateTournament}?token=${localStorage.getItem('accessToken')}`,
            {
                tournamentId: tournamentId,
                name: name,
                initial_stack: minBalance,
                smallBind: smallBind,
                bigBind:bigBind,
                type: type,
                first: first,
                second: second,
                third: third
            }
        );

        if(res.data.message == "success"){
            enqueueSnackbar(res.data.response, { variant: 'success' });
        }

        sendMessage(JSON.stringify({ command: 'get-tournament-list' }));
    }

    const startTournament = async() => {
        const res = await axiosInstance.post(`${API_TOURNAMENT.startTournament}?token=${localStorage.getItem('accessToken')}`,
            {
                tournamentId: tournamentId,
            }
        );

        if(res.data.message == "success"){
            enqueueSnackbar(res.data.response, { variant: 'success' });
        }

        sendMessage(JSON.stringify({ command: 'get-tournament-list' }));
    }

    return (
        <Page title={'Available Rooms'}>
            <Container className="mt-28">
                <div className="flex gap-2 justify-between flex-col md:flex-row w-full px-4 sm:px-8 md:px-12 mb-4">
                    <div className="flex gap-4 justify-start items-center">
                        {user?.id == tournament?.owner &&
                        <Typography variant="h3" color="yellow" className="cursor-pointer" onClick={()=>startTournament()}>Start</Typography>
                        }
                    </div>
                    <div className="flex justify-center items-center">
                        <CounterDown time={remainPoolTime} />
                    </div>

                </div>
                <Box sx={{ width: '100%', typography: 'body1' }}>
                    <TabContext value={tabNumber}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <TabList onChange={handleChangeTab} aria-label="Game Details">
                                <Tab label="Players" value="1" />
                                <Tab label="Game Setting" value="2" />
                                <Tab label="Game Result" value="3" />
                            </TabList>
                        </Box>
                        <TabPanel value="1">
                            <List dense={false}>
                                {users.map((player, index) => {
                                    if (true) {
                                        return (
                                            <ListItem
                                                key={index}
                                                secondaryAction={
                                                    <Button
                                                        color={player.status == 0 ? "primary" : player.status == 1 ? "success" : "warning"}
                                                        onClick={() => handleStatus(player)}
                                                    >
                                                        {player.status == 0 ? "pending" : player.status == 1 ? "accepted" : "Rejected"}
                                                    </Button>
                                                }

                                            >
                                                <ListItemAvatar>
                                                    <Avatar src={`${SERVER_HTTP_ADDR}/${player.user.avatar}`} />
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={player.user.fullName}
                                                    secondary={user.id == player.user.id ? "YOU" : null}
                                                />
                                            </ListItem>
                                        )
                                    }
                                })}
                            </List>
                        </TabPanel>
                        <TabPanel value="2">
                            <Stack direction="row" gap={2} justifyContent={'between'} alignItems="center" sx={{ marginBottom: "20px" }}>
                                <TextField InputLabelProps={{ shrink: true }} label="Tournament Name" placeholder="" name="name" className="mt-2" value={name} onChange={(ev) => setName(ev.target.value)} />
                                <TextField InputLabelProps={{ shrink: true }} label="Small Bind" placeholder="" name="smallBind" className="mt-2" value={smallBind} onChange={(ev)=>setSB(ev.target.value)} />
                                <TextField InputLabelProps={{ shrink: true }} label="Big Bind" placeholder="" name="bigBind" className="mt-2" value={bigBind} onChange={(ev)=>setBB(ev.target.value)} />
                                <TextField InputLabelProps={{ shrink: true }} label="Initial Stack" placeholder="" name="minBalance" className="mt-2" value={minBalance} onChange={(ev)=>setMinBalance(ev.target.value)} />
                            </Stack>
                            <Stack direction="row" gap={2} justifyContent={'between'} alignItems="center" sx={{ marginBottom: "20px" }}>
                                <FormControl size="small">
                                    <InputLabel id="demo-simple-select-label">Type</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        value={type}
                                        label="Type"
                                        onChange={handleChangeType}
                                    >
                                        <MenuItem value={0}>Public</MenuItem>
                                        <MenuItem value={1}>Private</MenuItem>
                                        <MenuItem value={2}>Code</MenuItem>
                                    </Select>
                                </FormControl>
                            </Stack>
                            <Stack direction="row" gap={2} justifyContent={'between'} alignItems="center" sx={{ marginBottom: "20px" }}>
                                <TextField InputLabelProps={{ shrink: true }} label="First" placeholder="" name="first" className="mt-2" value={first} onChange={(ev)=>setFirst(ev.target.value)} />
                                <TextField InputLabelProps={{ shrink: true }} label="Second" placeholder="" name="second" className="mt-2" value={second} onChange={(ev)=>setSecond(ev.target.value)} />
                                <TextField InputLabelProps={{ shrink: true }} label="third" placeholder="" name="third" className="mt-2" value={third} onChange={(ev)=>setThird(ev.target.value)} />
                            </Stack>
                            <Divider />
                            {user?.id == tournament?.owner &&
                                <Stack direction="row" gap={2} justifyContent={'start'} sx={{ marginTop: "20px" }}>
                                    <Button variant={'outlined'} onClick={()=>handleUpdate()}>
                                        Update
                                    </Button>
                                    <Button variant={'outlined'}>
                                        Cancel
                                    </Button>
                                </Stack>
                            }
                        </TabPanel>
                        <TabPanel value="3">
                            <Typography className="blink" color={"green"}>Game in progress</Typography>
                            <List dense={false}>
                                {currentPlayers?.map((player, index) => {
                                    if (true) {
                                        return (
                                            <ListItem
                                                key={index}
                                                secondaryAction={
                                                    <Typography>{ player.balance }</Typography>
                                                }

                                            >
                                                <ListItemAvatar>
                                                    <Avatar src={`${SERVER_HTTP_ADDR}/${player.avatar}`} />
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={player.fullName}
                                                    secondary={user.id == player.id ? "YOU" : null}
                                                />
                                            </ListItem>
                                        )
                                    }
                                })}
                            </List>
                        </TabPanel>
                    </TabContext>
                </Box>
                <Dialog onClose={handleClose} open={statusModal}>
                    <DialogTitle>Change Status</DialogTitle>
                    <IconButton
                        aria-label="close"
                        onClick={handleClose}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                    <DialogContent>
                        <Typography>
                            Really, will change the status?
                        </Typography>
                        <Divider />
                        <Stack direction="row" gap={2} justifyContent={'start'} sx={{ marginTop: "20px" }}>
                            <Button variant={'outlined'} color="success" onClick={() => changeStatus(selectedPlayer?.id, 1)}>
                                Accept
                            </Button>
                            <Button variant={'outlined'} color="warning" onClick={() => changeStatus(selectedPlayer?.id, 2)}>
                                Reject
                            </Button>
                            <Button variant={'outlined'} color="primary" onClick={handleClose}>
                                Cancel
                            </Button>
                        </Stack>
                    </DialogContent>
                </Dialog>
            </Container>
        </Page>
    )
}