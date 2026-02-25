import { Box, Button, Container, Divider, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Page from "../components/Page";
import CurrentTournaments from "../sections/tournament/currentTournaments";
import MyTournament from "../sections/tournament/MyTournament";
import axiosInstance, { API_GAME } from "../utils/axios";
import { fNumber } from "../utils/Formatter";

let interval = 0;
let countInterval = 0;
let remains = 3600 * 24;

export default function ChooseGameRooms() {
    const { roomId } = useParams();
    const [prizePool,setPrizePool] = useState(0);
    const CounterDown = ({ time }) => {
        const h = Math.floor(time / 3600);
        const m = Math.floor(time % 3600 / 60);
        const s = time - h * 3600 - m * 60;

        return (
            <Box sx={{ display: 'flex', border: '1px solid gray', borderRadius: 2, borderColor: 'divider', gap: 2, padding: 2 }}>
                <div className="flex flex-col gap-2 justify-center items-center flex-1">
                    <Typography variant="h3" color="yellow">{h<10?`0${h}`:h}</Typography>
                    <Typography variant="h4">&nbsp;Hours&nbsp;</Typography>
                </div>
                <div className="flex flex-col gap-2 justify-center items-center  flex-1">
                    <Typography variant="h3" color="yellow">{m<10?`0${m}`:m}</Typography>
                    <Typography variant="h4">Minutes</Typography>
                </div>
                <div className="flex flex-col gap-2 justify-center items-center  flex-1">
                    <Typography variant="h3" color="yellow">{s<10?`0${s}`:s}</Typography>
                    <Typography variant="h4">Seconds</Typography>
                </div>
            </Box>
        )
    }
    const [remainPoolTime, setRemainPoolTime] = useState(remains);
    // useEffect(()=>{
    //     const feach = async()=>{
    //         const res = await axiosInstance.get(API_GAME.pool);
    //         if(res.status === 200 && res.data.result){
    //             setPrizePool(res.data.result.pools.reduce((a,b)=>(a+b.poolAmount),0));
    //             const time = new Date(res.data.result.current);
    //             remains = 86400 - time.getHours()*3600 - time.getMinutes()*60 - time.getSeconds();
                
    //         }
            
    //     }
    //     interval = setInterval(()=>{
    //         feach();
    //     }, 10000)
    //     feach();
    //     return ()=>{
    //         clearInterval(interval);
    //     }
    // },[]);
    useEffect(() => {
        countInterval = setInterval(() => {
            setRemainPoolTime(remains);
            remains--;
        }, 1000);

        return ()=>{
            clearInterval(countInterval);
        }
    }, []);
    return (
        <Page title={'Available Rooms'}> 
            <MyTournament roomId={roomId} />
        </Page>
    )
}