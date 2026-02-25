import { Icon } from "@iconify/react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useResponsive from "../../hooks/useResponsive";

export default function HomeBanner() {
    const {user, isAuthenticated} = useAuth();
    const isMobile = useResponsive('down', 'md');
    const navigate = useNavigate();
    return (
        <Stack sx={{
            width: '100%', height: { xs: '60vh', sm: '100vh' },
            maxHeight: { lg: '760px', sm: '600px' }
        }} alignItems={'center'} justifyContent = {'center'}>
            <Box sx={{position:'absolute', 
                filter:'blur(1px)',
                width: '100%', height: { xs: '60vh', sm: '100vh' },
                backgroundImage: `url(/assets/03.jpg)`, backgroundPositionX: 'center', backgroundRepeat: 'no-repeat', backgroundSize: 'cover', maxHeight: { lg: '760px', sm: '600px' }
            }} alignItems={'center'}>

            </Box>

            <div className='flex p-12 md:p-24   flex-col gap-2 z-10 items-center mt-16 break-all'  >
                <Typography variant={'h2'} sx={{ color: 'yellow' }} className='animate-pulse'>PLAY & WIN </Typography>
                <Typography  className='xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl'>SUPPORT CRYPTO, UNLIMITED WITHDRAW</Typography>
                <div className='flex justify-center items-center  mb-4'>
                    <img src='/assets/i4.png' alt='' className='animate-pulse h-16' />
                    {!isAuthenticated && <Link to = "/auth/register"><Typography variant={'h3'} color={'yellow'}>Get 300 Free Chips </Typography></Link>}
                    {isAuthenticated &&  <Link to = "/auth/register"><Typography variant={'h3'} color={'yellow'}>Get bounus </Typography></Link>}
                    
                </div>

                <Button variant='outlined' size="large" sx={{ padding: { xs: 1, sm: 2 }, paddingX: { xs: 2, sm: 4 }, }} className="bg-yellow-400/70 " color="warning" onClick={() => navigate('wallet')}>
                    <Typography variant={'h4'}  color={'white'}>PLAYING NOW </Typography>
                </Button>
            </div>

            {/* left images */}

            {/* <div className='absolute left-4 w-1/4 mt-28 md:mt-36'>
                <img src='/assets/coin-1.png' alt='' className="mb-4 md:mb-10  animate-bounce "></img>
                <img src='/assets/coin-2.png' alt='' className="-rotate-12  animate-bounce"></img>
            </div> */}
            {/* right images */}
            {/* <div className='absolute right-4 w-1/4 mt-28 md:mt-36 flex flex-col items-end '>
                <img src='/assets/coin-3.png' alt='' className="mb-4 md:mb-10 animate-bounce"></img>
                <img src='/assets/coin-4.png' alt='' className="rotate-12 animate-bounce"></img>
            </div> */}
            {/* description */}
            {/* <div className="w-full lg:absolute lg:bottom-10 justify-center px-4 hidden md:flex">
                <div className='flex flex-col md:flex-row gap-2 w-1/2 justify-between p-4 rounded-lg bg-purple-400/40' >
                    <div className='flex gap-2 '>
                        <div className="w-20">
                            <img src='/assets/banner-bottom-1.png' alt='' />
                        </div>

                        <div className='flex flex-col gap-2 justify-center'>
                            <Typography variant={'h4'}>Play Poker</Typography>
                          
                        </div>
                    </div>

                    <div className='flex gap-2'>
                        <div className="w-20">
                            <img src='/assets/banner-bottom-2.png' alt='' />
                        </div>
                        <div className='flex flex-col gap-2 justify-center'>
                            <Typography variant={'h4'}>Get Win</Typography>
                          
                        </div>
                    </div>

                    <div className='flex gap-2'>
                        <div className="w-20">
                            <img src='/assets/banner-bottom-3.png' alt='' />
                        </div>
                        <div className='flex flex-col gap-2 justify-center'>
                            <Typography variant={'h4'}>Earnning</Typography>
                          
                        </div>
                    </div>
                </div>
            </div> */}

        </Stack>
    )
}