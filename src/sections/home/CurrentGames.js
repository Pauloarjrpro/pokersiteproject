import { Button, Container, Grid, Stack, TextField, Typography, Dialog, DialogContent, DialogTitle } from "@mui/material";
import { useSnackbar } from "notistack";
import { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useWebSocket from 'react-use-websocket';

import GameCard from "../../components/GameCard";
import { SERVER_WSS_ADDR } from "../../Config";
import useAuth from "../../hooks/useAuth";
import { rooms as _mocks } from "../../mocks";
import axiosInstance, { API_GAME } from "../../utils/axios";


export default function CurrentGames() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [keyword, setKeyword] = useState('');
    const { enqueueSnackbar } = useSnackbar();

    const { sendMessage, readyState } = useWebSocket(SERVER_WSS_ADDR, {
        onOpen: () => {

            sendMessage(JSON.stringify({ command: 'get-game-list' }));
        },
        onMessage: (evt) => {

            try {
                const data = JSON.parse(evt.data);

                // console.log("command", data.command, data);

                if (data && data.list && data.command === 'get-game-list') {
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
    const handleJoin = (room) => {

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
                navigate(`/game-yard/${room.id}`, { replace: true });
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

                        if (!u.bot && u?.fullName?.toLowerCase().includes(keyword) && room.type == 0) {
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
                setFiltered(rooms.filter((t)=>t.type == 0))
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
    }

    const createGame = async () => {
        axiosInstance.post(`${API_GAME.create}?token=${localStorage.getItem('accessToken')}`,
            {
                name: name,
            }
        ).then((res) => {
            if(res.status === 200 && res.data.result){
                handleJoin(res.data.result.room[0]);
            } else {
                navigate('/auth', { replace: true });
            }
        }).catch(e=>{
            enqueueSnackbar('Please login first!', { variant: 'error' });
            navigate('/auth', { replace: true });
        })

        

        sendMessage(JSON.stringify({ command: 'get-game-list' }));
        
    }
    return (
        <Container>
            <div className="flex gap-1 justify-between items-center p-8">
                <TextField label="Search By Username" placeholder="ex:albert" onChange={(e)=>updateList(e.target.value)} value={keyword} />
                <Button variant={'outlined'} onClick = {()=>{openDialog()}}>Create Games</Button>
            </div>
            <Grid container sx={{ width: '100%' }}>
                {filtered?.map((room, index) => (
                    <Grid item xs={12} sm={6} md={4} sx={{ padding: 2 }} key={index}>
                        <GameCard gameObject={room} handleJoin={() => handleJoin(room)} />
                    </Grid>
                ))}

            </Grid>
            {filtered.length === 0 &&
                <div className="flex w-full justify-center p-4 gap-4 flex-col items-center">
                    <Typography>No Filtered Games</Typography>
                    <div>
                        <Button variant={'outlined'} onClick = {()=>{updateList('')}}>View All Games</Button>
                    </div>

                </div>
            }

            <Dialog onClose={handleClose} open={open}>
                <DialogTitle>Create Game</DialogTitle>
                <DialogContent>
                    <Stack direction="column" gap={2}>
                        <Typography>Room Name</Typography>
                        <TextField label="Room Name" placeholder="ex:albert" onChange={(e)=>setName(e.target.value)} value={name} />
                        <Button variant="outlined" onClick={() => createGame()}>Create Game</Button>
                    </Stack>
                </DialogContent>
            </Dialog>
        </Container>


    )
}