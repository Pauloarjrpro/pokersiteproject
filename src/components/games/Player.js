import PropTypes from 'prop-types';
import { Icon } from "@iconify/react";
import RadarLoader from './RadarLoader';
import { fNumber } from '../../utils/Formatter';
import MySeat from './MySeat';
import Card from './Card';
import { SERVER_HTTP_ADDR } from '../../Config';

import ChatTip from '../ChatTip';
import { useEffect, useMemo, useState } from 'react';
import { Emoji } from 'emoji-picker-react';

Player.protTypes = {
    user: PropTypes.object,
    isCurrent: PropTypes.bool
}
const isLeft = (sitPlace) => {
    return (sitPlace === 2 || sitPlace === 3 || sitPlace === 4);
}
function EmojiRender({ emoji, message }) {

    const [visible, setVisible] = useState((emoji && emoji !== '') || (message && message !== ''));

    useEffect(() => {
        setVisible((emoji && emoji !== '') || (message && message !== ''));

        const timeout = setTimeout(() => {
            setVisible(false)
        }, 10000)
        return () => {
            clearTimeout(timeout);
        }
    }, [emoji, message])
    return (
        <>
            {visible &&
                <>
                    <div className={'xs:h-8 sm:h-10 md:h-12 lg:h-16 '} >
                        <Emoji unified={emoji ? emoji : '1f642'} >

                        </Emoji>
                    </div>
                    <ChatTip visible={visible} text={message?.includes("/") ? message.split("/")[0] : message} position={'bottom'} />
                </>

            }


        </>

    )
}
export default function Player({ emoji, place, user, isCurrent = false, isSmallBlinder, isBigBlinder, isDealerBlinder, tipText = '', visibleTip = false }) {
    const emojObj = useMemo(() => (emoji.length > 0 ? emoji[0] : {}), [emoji])
    return (
        <>
            {/* it's me */}
            {place === 1 &&
                <MySeat user={user} isCurrentPlayer={isCurrent} isSmallBlinder={isSmallBlinder} isBigBlinder={isBigBlinder} isDealerBlinder={isDealerBlinder} tipText={tipText} visibleTip={visibleTip} emoji={emojObj} />
            }

            {place !== 1 &&
                <div className={`absolute z-50 user-position user-position-${place}`}>

                    <div className={`flex h-full relative ${isLeft(place) ? 'flex-row-reverse' : ''}`} >
                        <div className={`user-avatar-wrapper w-3/5 flex flex-col h-full items-center p-2`}>
                            {/* user avatar */}
                            <div className='rounded-full relative w-full'>
                                <div className="z-50 absolute top-0 -right-2 ">
                                    {!user?.bot &&
                                        <label className='text-yellow-400 text-xs lg:text-sm font-black'>Lv{user?.level}</label>
                                    }

                                </div>
                                <div className="z-50 absolute -top-4 right-2 ">
                                    {!user?.bot &&
                                        <label className='text-yellow-400 text-xs lg:text-sm font-black'>{user?.fullName}</label>
                                    }

                                </div>
                                <div className="z-50 absolute top-6 -right-6 ">
                                    <EmojiRender emoji={emojObj.emoji} message={emojObj.message} />
                                </div>
                                {isDealerBlinder &&
                                    <div className={`absolute top-0 md:top-4 ${isLeft(place) ? '-right-4 md:-right-8' : '-left-4 md:-left-8'} rounded-full h-6 w-6 lg:w-10 lg:h-10 md:h-8 md:w-8 border-white border-2 md:border-4 bg-gradient-to-br  from-green-400 to-green-600 text-center text-white flex items-center justify-center`}>
                                        D
                                    </div>
                                }
                                {isBigBlinder &&
                                    <div className={`absolute top-4 md:top-8 ${isLeft(place) ? '-right-6 md:-right-10' : '-left-6 md:-left-10'} rounded-full h-6 w-6 lg:w-10 lg:h-10 md:h-8 md:w-8 border-white border-2 md:border-4 bg-gradient-to-br  from-red-400/80 to-red-600/80 text-center text-white flex items-center justify-center`}>
                                        B
                                    </div>
                                }
                                {isSmallBlinder &&
                                    <div className={`absolute top-4 md:top-8 ${isLeft(place) ? '-right-6 md:-right-10' : '-left-6 md:-left-10'} rounded-full h-6 w-6 md:h-8 md:w-8 lg:w-10 lg:h-10 border-white border-2 md:border-4 bg-gradient-to-br  from-yellow-400 to-yellow-600 text-center text-white flex items-center justify-center`}>
                                        S
                                    </div>
                                }
                                {
                                    <ChatTip visible={visibleTip} text={tipText} />
                                }
                                <RadarLoader seconds={30} start={isCurrent}>
                                    {!user.bot &&

                                        <img src={`${SERVER_HTTP_ADDR}/${user.avatar}`} className={'h-full rounded-full aspect-square'} alt="">
                                        </img>

                                    }
                                    {user.bot &&

                                        <img src={`/assets/bot.png`} className={'h-full rounded-full aspect-square'} alt="">
                                        </img>
                                    }

                                </RadarLoader>
                            </div>
                            {/* name & balance  */}
                            {!user.bot &&
                                <div className='flex items-center  flex-col -my-2 lg:-my-4 pt-2 lg:pt-4 bg-gradient-to-b  rounded-b-md bg-yellow-400 '>

                                    <div className='flex flex-col  px-1  max-w-[80px]'>
                                        <small className=' text-2xs lg:text-sm text-black '><b>${fNumber(user.balance)}</b></small>
                                    </div>
                                </div>
                            }
                        </div>
                        {/* cards && bet amount */}
                        {!user.bot &&
                            <div className={`flex flex-col justify-end text-2xs lg:text-sm   ${isLeft(place) ? '-mr-2' : '-ml-2 '}`}>
                                <div className={`flex-1 scale-[40%] lg:scale-[50%]  lg:p-4 p-2 mb-4 ${user?.status === 'fold' ? 'opacity-20' : 'opacity-100'}`}>
                                    {user?.cards?.length === 2 && user?.cards[0]?.shape !== -1 &&
                                        <>
                                            <Card side={'B'} clss={'-rotate-6 absolute'} />
                                            <Card side={'B'} clss={'rotate-12  mt-1  aspect-square absolute'} />
                                        </>
                                    }

                                </div>
                                <div className='pb-2  text-center'>
                                    <div className={'rounded-full bg-white/10 flex justify-center items-center pr-2 lg:w-[80px]  w-[50px]'}>
                                        {user?.betAmount > 0 &&
                                            <>
                                                <Icon icon='mdi:casino-chip' color='red'></Icon>
                                                <label>
                                                    {fNumber(user?.betAmount)}
                                                </label>
                                            </>
                                        }

                                    </div>

                                    <label className={'text-white uppercase'}>
                                        {user?.status}
                                    </label>
                                </div>

                            </div>
                        }
                    </div>
                </div >
            }
        </>

    )
}