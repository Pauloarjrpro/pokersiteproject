import { Icon } from "@iconify/react";
import { Typography } from "@mui/material";


export default function HowToPlay() {

    const PlayTitle = ({ icon, title, link }) => {
        return (
            <div className="flex flex-col justify-center items-center hover:text-yellow-400 gap-2">
                <div className='flex bg-gradient-to-br from-yellow-300 to-yellow-500 hover:shadow-md hover:shadow-yellow-300 p-4 lg:p-8 rounded-full'>
                    <Icon icon={icon} width={40} color={'white'}/>
                </div>
                <Typography variant = {'h6'}>
                    {title}
                </Typography>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4 md:gap-10 justify-center items-center">
            <Typography variant={'h3'}>How To Play Game</Typography>
            <Typography variant={'h5'}>A casino is a facility for certain types of gambling. Casinos are often built combined with hotels, resorts.</Typography>
            <div className='flex flex-col md:flex-row gap-12 w-full justify-between p-4 md:p-10 '>
                <PlayTitle icon = {'mdi:user-add-outline'} title = {'Register & Login'} />
                <PlayTitle icon = {'material-symbols:finance-chip-outline'} title = {'Buy Chips with Crypto'} />
                <PlayTitle icon = {'mdi:family-room-outline'} title = {'Choose a Room & Play'} />
            </div>

        </div>
    )
}