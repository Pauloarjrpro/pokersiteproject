import { Divider, Typography } from "@mui/material";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Page from "../components/Page";
import useAuth from "../hooks/useAuth";
import CurrentGames from "../sections/home/CurrentGames";
import HomeBanner from "../sections/home/HomeBanner";
import HowToPlay from "../sections/home/HowToPlay";
import WinnersAndInvestors from "../sections/home/WinnersAndInvestors";

export default function Home() {
    const {isAuthenticated, user, initialize} = useAuth();
    const navigate = useNavigate();
    useEffect(()=>{
        initialize();
        
        if(isAuthenticated &&  user && user.lastGameId> 0){
            navigate(`/game-yard/${user.lastGameId}`,{replace:true});
        }
    },[isAuthenticated])
    return (
        <Page title="Poker Home">

            <HomeBanner />

            <div className="w-full flex-col gap-8 justify-center items-center z-10 p-4 md:p-8 lg:p-12 ">
                <div className="w-full justify-center items-center flex flex-col gap-4  md:gap-8 mb-4 md:mb-4">
                    <Typography variant="h3">Available Poker Rooms</Typography>
                    <Typography variant="h5">A casino is a facility for certain types of gambling. Casinos are often built combined with hotels, resorts</Typography>
                </div>
                <CurrentGames />
            </div>
            <Divider />
            {/* how to play */}
            <div className="flex w-full justify-center items-center z-10 p-4 md:p-8 lg:p-12 ">
                <HowToPlay />
            </div>
            <Divider />
            {/* winners  */}
            <div className="flex w-full justify-center items-center z-10 p-4 md:p-8 lg:p-12 ">
                <WinnersAndInvestors />
            </div>
            <Divider />

        </Page>
    )
}