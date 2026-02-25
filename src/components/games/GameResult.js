import { Icon } from "@iconify/react";
import { Avatar, Button, Dialog, DialogContent, Typography } from "@mui/material";
import { SERVER_HTTP_ADDR } from "../../Config";
import { fNumber } from "../../utils/Formatter";
import SmallCard from "./SmallCard";

const UserRender = ({ player, winners }) => {
    const isWin = (winners.filter((winner) => winner.id === player.id).length === 1);
    return (
        <div className='flex gap-1 w-full'>
            <div className='w-1/6 flex items-center '>
                {isWin && <Typography color="yellow" className = {'text-sm md:text-md '}>Win</Typography>}
                {!isWin && <Typography color="red" className = {'text-sm md:text-md '}>Lose</Typography>}
            </div>
            <div className="flex flex-col w-1/4 overflow-hidden justify-center items-center">
                <Avatar src={`${SERVER_HTTP_ADDR}/${player?.avatar}`}></Avatar>

                <Typography className = {'text-2xs md:text-small '}>{player?.fullName}</Typography>


            </div>
            <div className='flex gap-1 scale-90 items-center'>
                {player?.cards?.map((card, index) => (
                    <SmallCard shape={card.shape} value={card.value} key={index} side={'F'} highlight={
                        (winners[0]?.cards?.cards?.filter((wc) => (wc.shape === card.shape && wc.value === card.value)).length === 1) ? 2 : 0} />
                ))}
            </div>
            <div className="flex flex-col justify-center">
                <Typography color = {`${isWin?'yellow':'red'}`}>{fNumber(player?.betAmount)}$</Typography>
                <Typography className = {'text-small md:text-xs uppercase'}>{player?.status}</Typography>
            </div>
        </div>
    )
}

export default function GameResult({ winners, players, round, yourId, onQuit  }) {
    
    const isWin = (winners.filter((winner) => winner.id === yourId).length === 1);
    const profitAmount = isWin?(winners.filter((winner) => winner.id === yourId))[0].profitAmount : 0;
    const you = ((players).filter((player) => player.id === yourId)[0]);

    return (
        <Dialog open={true} sx ={{maxWidth:'100%'}}>
            <DialogContent >
                {isWin && <Typography color='yellow' className = 'font-bold'>You Won! +{fNumber(Math.max(0,profitAmount - you?.betAmount))}</Typography>}
                {!isWin && <Typography color='red'  className = 'font-bold'>You Lose! &nbsp;-{fNumber(you?.betAmount)}$</Typography>}
                <div className='flex gap-4 w-full justify-center mt-2'>
                    <div className='flex gap-1 mb-2 '>

                        {round?.dealerCards?.map((card, index) => (
                            <SmallCard clss="" shape={card.shape} value={card.value} key={index} side={'F'} highlight={
                                (winners[0]?.cards?.cards?.filter((wc) => (wc.shape === card.shape && wc.value === card.value)).length === 1) ? 2 : 0} />
                        ))}



                    </div>
                    <div className='flex gap-1 justify-center '>

                        {you?.cards?.map((card, index) => (
                            <SmallCard shape={card.shape} value={card.value} key={index} side={'F'} highlight={
                                (winners[0]?.cards?.cards?.filter((wc) => (wc.shape === card.shape && wc.value === card.value)).length === 1) ? 2 : 0} />
                        ))}

                    </div>
                </div>
                <div className='flex flex-col gap-1 items-center justify-center mb-4'>
                    <Typography color="yellow" className='text-xs md:text-sm'>
                        Round Bet Amount: {fNumber(round?.betAmount)}
                    </Typography>
                    <Typography color="yellow" className='text-2xs md:text-xs'>
                        Your Bet Amount: {fNumber(you?.betAmount)}
                    </Typography>
                </div>
                <div className="flex flex-col w-full gap-2 mb-4">
                    {players?.filter((p)=>p.id!==yourId).map((player, index) => (
                        <UserRender player={player} key={index} winners={winners} />
                    ))}
                </div>
                <div className="flex gap-2 justify-center mb-2 items-center">
                    <Typography  className='text-2xs md:text-xs'>Wait for next round </Typography>
                    <Icon icon='eos-icons:three-dots-loading' width={30}></Icon>
                    <Button variant = {'outlined'} onClick = {onQuit}>Quit Game</Button>

                </div>
            </DialogContent>
        </Dialog>
    )
}