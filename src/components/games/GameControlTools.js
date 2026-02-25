import { useState } from "react";
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import ControlButtons from "./ControlButtons";

export default function GameControlTools({ user, start, handleChangedBetAmount, onFold, onCheck, onBet, callAmount = 0, bigBlind = 0 }) {

    const needAmount = callAmount - (user?.betAmount || 0);

    const [betAmount, setBetAmount] = useState(needAmount);


    const handleBetAmount = (percent) => {
        setBetAmount(percent);
        // handleChangedBetAmount(amount);
    }
    return (
        <div className='w-full  flex justify-between gap-4 h-full '>
            <div className='flex-1 flex gap-1 justify-between'>
                <ControlButtons title="Fold" icon="ic:round-close" clss='from-red-400/60 to-red-600/60' onClick={onFold} />
                <ControlButtons title={`${(needAmount) >= user.balance ? 'AllIn' : 'Call'}`} disabled={(needAmount) === 0} icon="material-symbols:keyboard-arrow-up-rounded" onClick={() => onBet((needAmount) >= user.balance ? 'allin' : 'call', Math.min(needAmount, user.balance))} value={Math.min(needAmount, user.balance)} clss='from-sky-600/60 to-sky-900/60' />

                <ControlButtons title={`Raise`} icon="material-symbols:keyboard-double-arrow-up-rounded" onClick={() => onBet('raise', ((needAmount === 0 ? bigBlind : (needAmount * 2))))} disabled={(needAmount === 0 ? bigBlind : (needAmount * 2)) >= user.balance} value={(needAmount === 0 ? bigBlind : (needAmount * 2))} clss='from-yellow-300/80 to-yellow-600/80' />
            </div>
            <div className='h-full flex w-[15vw]'>
                <ControlButtons title="Check" icon="ic:baseline-check-circle-outline" clss='from-green-600/60 to-green-900/60' onClick={onCheck} disabled={needAmount > 0} />
            </div>

            <div className="flex-1 flex gap-2">
                <div className="w-2/3 flex flex-col justify-center p-2">
                    <div className="w-full">
                        <Slider onChange={handleBetAmount} value={betAmount} min={Math.min(needAmount, user?.balance)} max={Math.max(user?.balance, needAmount)} />
                    </div>


                </div>
                <ControlButtons title={`${betAmount === user?.balance ? 'All In' : (betAmount === needAmount ? 'Call' : 'Raise')}`} value={betAmount} onClick={() => onBet('raiseX', betAmount)} disabled={betAmount === 0} clss={(betAmount === needAmount ? 'from-sky-600/60 to-sky-900/60' : 'from-yellow-300/80 to-yellow-600/80')} />

                

            </div>

        </div>

    )
}