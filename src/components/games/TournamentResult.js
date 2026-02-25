import { Icon } from "@iconify/react";
import { Avatar, Button, Dialog, DialogContent, Typography } from "@mui/material";
import { SERVER_HTTP_ADDR } from "../../Config";
import { fNumber } from "../../utils/Formatter";
import SmallCard from "./SmallCard";

const UserRender = ({ player, rank, winners }) => {
    return (
        <div className='flex gap-1 w-full justify-between'>
            <div className='flex items-center '>
                { 
                    rank == 0 ? <Icon icon='emojione:crown' width={30}></Icon> :
                    rank == 1 ? <Icon icon='emojione:crown' color="silver" width={30}></Icon> :
                    <Icon icon='emojione:crown' width={30}></Icon> 
                }
                <Avatar className="mx-2" src={`${SERVER_HTTP_ADDR}/${player?.avatar}`}></Avatar>

                <Typography className = {'text-small md:text-xs uppercase'}>{player?.fullName}</Typography>


            </div>
            <div className="flex flex-col justify-center">
                <Typography color = 'yellow'>{fNumber(player?.amount)}$</Typography>
                <Typography className = {'text-small md:text-xs uppercase'}>{player?.amount}</Typography>
            </div>
        </div>
    )
}

export default function TournamentResult({ game, winners, players, round, yourId, onQuit  }) {
    
    const isWin = (winners.filter((winner) => winner.id === yourId).length === 1);
    const profitAmount = isWin?(winners.filter((winner) => winner.id === yourId))[0].profitAmount : 0;
    const you = ((players).filter((player) => player.id === yourId)[0]);

    return (
        <Dialog open={true} maxWidth="sm" fullWidth={true}>
            <DialogContent >
            
                <Typography color='yellow' className = 'font-bold'>Tournament {game.name}</Typography>

                <div className="flex flex-col w-full gap-2 mb-4">
                    {players?.map((player, index) => (
                        <UserRender player={player} rank={index} key={index} winners={winners} />
                    ))}
                </div>
                <div className="flex gap-2 justify-center mb-2 items-center">
                    <Button variant = {'outlined'} onClick = {onQuit}>Quit Game</Button>

                </div>
            </DialogContent>
        </Dialog>
    )
}