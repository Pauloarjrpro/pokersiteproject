import { Button, Container, Grid, Stack, TextField, Typography, Dialog, DialogContent, DialogTitle, Divider, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { useSnackbar } from "notistack";
import { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useWebSocket from 'react-use-websocket';

import TournamentCard from "../../components/TournamentCard";
import { SERVER_WSS_ADDR } from "../../Config";
import useAuth from "../../hooks/useAuth";
import { rooms as _mocks } from "../../mocks";
import axiosInstance, { API_GAME } from "../../utils/axios";


export default function CurrentTournaments() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [keyword, setKeyword] = useState('');
    const { enqueueSnackbar } = useSnackbar();

    const { sendMessage, readyState } = useWebSocket(SERVER_WSS_ADDR, {
        onOpen: () => {

            sendMessage(JSON.stringify({ command: 'get-tournament-list' }));
        },
        onMessage: (evt) => {

            try {
                const data = JSON.parse(evt.data);

                // console.log("command", data.command, data);

                if (data && data.list && data.command === 'get-tournament-list') {
                    setRooms(data.list);
                }
            }
            catch (err) {
            }
        },
        shouldReconnect: (closeEvent) => true,

    })
    const [rooms, setRooms] = useState(
        []
    );
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [filtered, setFiltered] = useState(rooms);

    const [smallBind, setSB] = useState(0);
    const [bigBind, setBB] = useState(0);
    const [minBalance, setMinBalance] = useState(0);
    const [type, setType] = useState(0);
    const [first, setFirst] = useState(0);
    const [second, setSecond] = useState(0);
    const [third, setThird] = useState(0);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [show, setShow] = useState(false);

    const joinTournament = async (room) => {

        if (user) {
            // console.log(room, user)
            const balance = user?.balance;
            if (balance < room.minBalance) {
                enqueueSnackbar('Low balance, please deposit', { variant: 'error' });
                navigate('/wallet', { replace: true });
            }
            else if (user?.level < room.level) {
                enqueueSnackbar('You can not play here with your level', { variant: 'error' });
            }
            else {
                const res = await axiosInstance.post(`${API_GAME.joinTournament}?token=${localStorage.getItem('accessToken')}`,
                    {
                        tournamentId: room.id,
                        player_id: user.id
                    }
                );

                if(res.data.message == "success"){
                    enqueueSnackbar(res.data.response, { variant: 'success' });
                    setOpen(false);
                }

                sendMessage(JSON.stringify({ command: 'get-tournamnet-list' }));
                navigate(`/tournament-details/${room.id}`, { replace: true });
            }
        }
        else {
            navigate('/auth', { replace: true });
        }

    }
    useEffect(() => {
        const getFiltered = () => {

            if (keyword.length > 0) {
                const arr = (rooms.filter((room) => {

                    if (room.users?.filter((u) => {

                        if (!u.bot && u?.fullName?.toLowerCase().includes(keyword)) {
                            return true;
                        }
                        else {
                            return false;
                        }
                    }).length > 0) {

                        return true;
                    }
                    else {
                        return false;
                    }
                }));

                setFiltered(arr)
            }
            else {
                setFiltered(rooms)
            }
        }
        getFiltered();

    }, [rooms, keyword]);
    
    const updateList = (key) => {
        setKeyword(key);
    }

    const openDialog = () => {
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
        setShow(false);
    }

    const handleChangeType = (e) => {
        setType(e.target.value);
    }

    const createTournament = async () => {
        const res = await axiosInstance.post(`${API_GAME.createTournament}?token=${localStorage.getItem('accessToken')}`,
            {
                name: name,
                initial_stack: minBalance,
                smallBind: smallBind,
                bigBind:bigBind,
                type: type,
                first: first,
                second: second,
                third: third,
                class: 0
            }
        );

        if(res.data.message == "success"){
            enqueueSnackbar(res.data.response, { variant: 'success' });
            setOpen(false);
        }

        sendMessage(JSON.stringify({ command: 'get-tournament-list' }));
    }

    const showDetails = (room) => {

        const joined_check = room.tournament_users.find((t) => t.user_id == user.id);
        if (joined_check) {
            navigate('/tournament-details/' + room.id);
        } 

        if(user.id == room.owner){
            navigate('/tournament-details/' + room.id);
        } else {
            setSelectedRoom(room);
            setShow(true);
        }
    }

    return (
        <Container>
            <div className="flex gap-1 justify-end items-center p-8">
                {/* <TextField label="Search By Username" placeholder="ex:albert" onChange={(e)=>updateList(e.target.value)} value={keyword} /> */}
                <Button variant={'outlined'} onClick = {()=>{openDialog()}}>Create Tournaments</Button>
            </div>
            <Grid container sx={{ width: '100%' }}>
                {rooms?.map((room, index) => (
                    <Grid item xs={12} sm={6} md={4} sx={{ padding: 2 }} key={index}>
                        <TournamentCard gameObject={room} handleJoin={() => showDetails(room)} />
                    </Grid>
                ))}

            </Grid>
            {rooms.length === 0 &&
                <div className="flex w-full justify-center p-4 gap-4 flex-col items-center">
                    <Typography>No Tournaments</Typography>
                </div>
            }

            <Dialog onClose={handleClose} open={open}>
                <DialogTitle>Create Tournaments</DialogTitle>
                <DialogContent>
                    <Stack direction="row" gap={2} justifyContent={'between'} alignItems="center" sx={{ marginBottom: "20px" }}>
                        <TextField label="Room Name" placeholder="Room Name" className="mt-2 w-[50%]" onChange={(e)=>setName(e.target.value)} value={name} />
                        <TextField label="Initial Stack" placeholder="" name="minBalance" className="mt-2 w-[50%]" onChange={(e)=>setMinBalance(e.target.value)} value={minBalance} />
                    </Stack>
                    <Stack direction="row" gap={2} justifyContent={'between'} alignItems="center" sx={{ marginBottom: "20px" }}>
                        <TextField label="Small Bind" placeholder="" name="smallBind" className="mt-2 w-[50%]" onChange={(e)=>setSB(e.target.value)} value={smallBind}/>
                        <TextField label="Big Bind" placeholder="" name="bigBind" className="mt-2 w-[50%]" onChange={(e)=>setBB(e.target.value)} value={bigBind} />
                    </Stack>
                    <Stack direction="row" gap={2} justifyContent={'between'} alignItems="center" sx={{ marginBottom: "20px" }}>
                        <FormControl fullWidth>
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
                        <TextField label="First Player" placeholder="" name="firstplayer" className="mt-2" onChange={(e)=>setFirst(e.target.value)} value={first}/>
                        <TextField label="Second Player" placeholder="" name="secondplayer" className="mt-2" onChange={(e)=>setSecond(e.target.value)} value={second} />
                        <TextField label="Third Player" placeholder="" name="thirdplayer" className="mt-2" onChange={(e)=>setThird(e.target.value)} value={third} />
                    </Stack>
                    <Divider />
                    <Stack direction="row" gap={2} justifyContent={'start'} sx={{ marginTop: "20px" }}>
                        <Button variant={'outlined'} onClick={() => createTournament()}>
                            Confirm
                        </Button>
                        <Button variant={'outlined'} onClick={handleClose}>
                            Cancel
                        </Button>
                    </Stack>
                </DialogContent>
            </Dialog>

            <Dialog onClose={handleClose} open={show}>
                <DialogTitle>Tournament - {selectedRoom?.name}</DialogTitle>
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
                    <Stack direction="row" gap={2} justifyContent={'between'} alignItems="center" sx={{ marginBottom: "20px" }}>
                        <TextField label="Initial Stack" placeholder="" name="minBalance" className="mt-2 w-[50%]" value={selectedRoom?.initial_stack} />
                    </Stack>
                    <Stack direction="row" gap={2} justifyContent={'between'} alignItems="center" sx={{ marginBottom: "20px" }}>
                        <TextField label="Small Bind" placeholder="" name="smallBind" className="mt-2 w-[50%]" value={selectedRoom?.smallBind}/>
                        <TextField label="Big Bind" placeholder="" name="bigBind" className="mt-2 w-[50%]" value={selectedRoom?.bigBind} />
                    </Stack>
                    <Stack direction="row" gap={2} justifyContent={'between'} alignItems="center" sx={{ marginBottom: "20px" }}>
                        <FormControl fullWidth>
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
                        <TextField label="First Player" placeholder="" name="firstplayer" className="mt-2" value={selectedRoom?.first}/>
                        <TextField label="Second Player" placeholder="" name="secondplayer" className="mt-2" value={selectedRoom?.second} />
                        <TextField label="Third Player" placeholder="" name="thirdplayer" className="mt-2" value={selectedRoom?.third} />
                    </Stack>
                    <Divider />
                    <Stack direction="row" gap={2} justifyContent={'start'} sx={{ marginTop: "20px" }}>
                        <Button variant={'outlined'} onClick={() => joinTournament(selectedRoom)}>
                            Join
                        </Button>
                        <Button variant={'outlined'} onClick={handleClose}>
                            Cancel
                        </Button>
                    </Stack>
                </DialogContent>
            </Dialog>
        </Container>
    )
}