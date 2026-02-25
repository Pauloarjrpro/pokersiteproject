import { Avatar, Container, Divider, Typography } from "@mui/material";
import { wagers, winners } from "../../mocks";
import { fNumber } from "../../utils/Formatter";

export default function WinnersAndInvestors() {

    return (
        <Container>
            <div className="flex flex-col md:flex-row w-full gap-8 md:gap-12">
                <div>

                </div>
                {/* wagers */}
                <div className='flex flex-col md:flex-row gap-2 flex-1'>
                    <div className="flex flex-col gap-4 flex-1 ">
                        <div className="flex items-center gap-4  justify-center">
                            <img src='/assets/i1.png' alt='' className="h-16"></img>
                            <Typography variant={'h3'} className={'text-yellow-400'}> Top Wagers</Typography>
                        </div>
                        <div className="flex flex-col gap-4 flex-1 w-full border py-4 px-2 rounded-lg border-pink-400/50 ">
                            {wagers.map((user, index) => (
                                <div key={index}>
                                    <div className='flex gap-4 justify-between ' >

                                        <div className="flex gap-2 flex-1 items-center ">
                                            <img src={`/assets/sa${index + 1}.png`} alt='' className={'h-12'} />
                                            <Typography>{user.name}</Typography>

                                        </div>
                                        <div className="items-center  flex">
                                            <Avatar src={user.avatar} />
                                        </div>

                                        <div className="flex gap-2 flex-1 items-center ">
                                            {fNumber(user.balance)}
                                            <img src='/assets/btc.png' alt='' />
                                        </div>
                                    </div>
                                    <Divider />
                                </div>

                            ))}

                        </div>
                    </div>

                </div>
                {/* winners */}
                <div className='flex flex-col md:flex-row gap-2 flex-1'>
                    <div className="flex flex-col gap-4 flex-1 ">
                        <div className="flex items-center gap-4 justify-center">
                            <img src='/assets/i2.png' alt='' className="h-16"></img>
                            <Typography variant={'h3'} className={'text-yellow-400'}> Today Winners</Typography>
                        </div>
                        <div className="flex flex-col gap-4 flex-1 w-full border py-4 px-2 rounded-lg border-pink-400/50 ">
                            {winners.map((user, index) => (
                                <div key={index}>
                                    <div className='flex gap-4 justify-between ' >

                                        <div className="flex gap-2 flex-1 items-center ">
                                            <img src={`/assets/ra${index + 1}.png`} alt='' className={'h-12'} />
                                            <Typography>{user.name}</Typography>

                                        </div>
                                        <div className="items-center  flex">
                                            <Avatar src={user.avatar} />
                                        </div>

                                        <div className="flex gap-2 flex-1 items-center ">
                                            {fNumber(user.balance)}
                                            <img src='/assets/btc.png' alt='' />
                                        </div>
                                    </div>
                                    <Divider />
                                </div>

                            ))}

                        </div>
                    </div>

                </div>
            </div>
        </Container>

    )
}