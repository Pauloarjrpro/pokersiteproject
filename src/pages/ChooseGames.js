import { Box, Button, Container, Divider, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import Page from "../components/Page";
import CurrentGames from "../sections/home/CurrentGames";
import axiosInstance, { API_GAME } from "../utils/axios";
import { fNumber } from "../utils/Formatter";

let interval = 0;
let countInterval = 0;
let remains = 3600 * 24;

export default function ChooseGameRooms() {
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
    useEffect(()=>{
        const feach = async()=>{
            const res = await axiosInstance.get(API_GAME.pool);
            if(res.status === 200 && res.data.result){
                setPrizePool(res.data.result.pools.reduce((a,b)=>(a+b.poolAmount),0));
                const time = new Date(res.data.result.current);
                remains = 86400 - time.getHours()*3600 - time.getMinutes()*60 - time.getSeconds();
                
            }
            
        }
        // interval = setInterval(()=>{
        //     feach();
        // }, 10000)
        feach();
        // return ()=>{
        //     clearInterval(interval);
        // }
    },[]);
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
            <Container className="mt-28">
                <div className="flex gap-2 justify-between flex-col md:flex-row w-full px-4 sm:px-8 md:px-12 mb-4">
                    <div className="flex flex-col gap-4 ">
                        <Typography variant="h2">Prize Pool</Typography>
                        <Typography variant='h2' color="yellow">${fNumber(prizePool)}</Typography>
                        <div>
                            <Button>View Details</Button>
                        </div>

                    </div>
                    <div className="flex justify-center items-center">
                        <CounterDown time={remainPoolTime} />
                    </div>

                </div>
                <Divider />
                <div className="flex flex-col items-center py-10">
                    <Typography variant="h3">Choose Available Games</Typography>
                </div>
                <CurrentGames />
                <Divider />

            </Container>
        </Page>
    )
}