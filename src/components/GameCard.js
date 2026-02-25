import { Avatar, AvatarGroup, Button, Typography } from "@mui/material";
import { SERVER_HTTP_ADDR } from "../Config";
import { fNumber, fShortenNumber } from "../utils/Formatter";
import useAuth from "../hooks/useAuth";

export default function GameCard({ gameObject, handleJoin }) {

    const { user } = useAuth();
    
    return (
        <Button variant="outlined" onClick={handleJoin} disabled={gameObject?.availableSeats?.length === 0}>
            <div className="flex flex-col gap-2 p-2 lg:p-4 rounded-lg" >
                <div className={`flex items-center justify-center min-h-[200px]`}>
                    {/* <img src={gameObject.dealer} className={'w-1/2 md:w-1/3'} alt="" /> */}
                    <img src={'/assets/dealers/room-1.png'} className={'w-full'} alt="" />
                </div>
                <div className="flex justify-center flex-wrap -mt-20">
                    <AvatarGroup  max = {3}>
                        {gameObject?.users?.filter((u) => !u.bot)?.map((user, index) => (
                            <Avatar src={`${SERVER_HTTP_ADDR}/${user.avatar}`} key={index} />
                        ))}
                    </AvatarGroup>
                    <AvatarGroup max = {2}>
                        {gameObject?.users?.filter((u) => u.bot)?.map((user, index) => (
                            <Avatar src={``} key={index} />
                        ))}
                    </AvatarGroup>
                </div>
                <div className="flex justify-center items-center">
                    <Typography>
                        Blind: ${fNumber(gameObject?.smallBind)} - {fNumber(gameObject?.bigBind)}
                    </Typography>

                </div>
                <div className="flex justify-center items-center">
                    <Typography color='yellow'>
                        {/* Profit: {fShortenNumber(100 - gameObject?.profitPercent)}% */}
                        {gameObject.owner == user?.id ? "Your game" : 'Other User Game'}
                    </Typography>

                </div>
            </div>
        </Button>

    )
}