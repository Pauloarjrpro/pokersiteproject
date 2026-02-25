import PropTypes from 'prop-types';
import { Emoji } from "emoji-picker-react";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "../../redux/store";
import { fNumber } from "../../utils/Formatter";
import ChatTip from "../ChatTip";
import Card from "./Card";
import RadarLoader from "./RadarLoader";
import { SERVER_HTTP_ADDR } from '../../Config';

MySeat.propTypes = {
    emoji: PropTypes.object
}
function EmojiRender({ emoji, user, message }) {
    const [visible, setVisible] = useState((emoji && emoji!=='') || (message && message!==''));

    useEffect(() => {
        setVisible((emoji && emoji!=='') || (message && message!==''));
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
                <Emoji className={'h-full rounded-full aspect-square'} unified={emoji || '1f642'} >
                </Emoji>
            }
            {/* {
                !visible &&
                <img src={`${SERVER_HTTP_ADDR}/${user.avatar}`} className={'h-full rounded-full aspect-square'} alt="">
                </img>
                
            } */}
            {
                !visible &&
                <div className="flex flex-col h-full w-full  text-2xs lg:text-sm justify-center items-center bg-white rounded-full p-2 text-black">
                    <div className={'flex justify-center items-center '}>
                        <b>
                            ${fNumber(user?.balance)}
                        </b>
                    </div>

                    <b className={'uppercase'}>
                        {user?.status}
                    </b>
                </div>
            }
        </>

    )
}

export default function MySeat({ emoji, user, isCurrentPlayer, isSmallBlinder, isBigBlinder, isDealerBlinder, visibleTip = false, tipText = "" }) {
    const { cards } = useSelector((state) => state.game);
    return (
        <div className="user-position flex  user-position-1 absolute">
            <div className="flex relative  lg:pt-4 w-full  justify-center ">
                <div className={`flex pt-2 relative h-6/7 overflow-hidden w-full justify-center ${user?.status === 'fold' ? 'opacity-30' : 'opacity-100'}`}>
                    {cards.length === 2 && cards[0].shape !== -1 &&
                        <>
                            <Card shape={cards[0].shape} side={'F'} value={cards[0].value} clss={'-rotate-6 absolute '} />
                            <Card shape={cards[1].shape} side={'F'} value={cards[1].value} clss={'rotate-12 ml-6 lg:ml-10 mt-1 absolute'} />

                        </>
                    }

                </div>

                {isDealerBlinder &&
                    <div className={`absolute border-white/50 border-2 md:border-4  top-4 md:top-12 ml-8 md:ml-6 z-40 rounded-full h-6 w-6 md:h-8 md:w-8  bg-gradient-to-br  from-green-400 to-green-600 text-center text-white flex items-center justify-center `}>
                        D
                    </div>
                }
                {isBigBlinder &&
                    <div className={`absolute border-white/50 border-2 md:border-4  top-4 md:top-12 ml-12 md:ml-16 z-50 rounded-full h-6 w-6 md:h-8 md:w-8  bg-gradient-to-br  from-red-400 to-red-600 text-center text-white flex items-center justify-center `}>
                        B
                    </div>
                }
                {isSmallBlinder &&
                    <div className={`absolute top-4 md:top-12 ml-8 md:ml-16 z-50 rounded-full h-6 w-6 md:h-8 md:w-8 lg:h-10  lg:w-10 border-white/50 border-2 md:border-4 bg-gradient-to-br  from-yellow-400 to-yellow-600 text-center text-white flex items-center justify-center`}>
                        S
                    </div>
                }
                {
                    <div className="absolute bottom-6 md:bottom-12 -ml-2 md:-ml-6">
                        <div className='relative'>
                            <ChatTip visible={visibleTip} text={tipText} />
                        </div>

                    </div>

                }
                <div className="absolute w-[7vw] h-[7vw] -bottom-7 ml-2">
                    <RadarLoader start={isCurrentPlayer} seconds={30} >

                        <EmojiRender emoji={emoji?.emoji} user={user} message = {emoji?.message}>
                        </EmojiRender>


                    </RadarLoader>
                </div>
            </div>

        </div>
    )
}