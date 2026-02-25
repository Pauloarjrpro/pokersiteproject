import { Icon } from "@iconify/react";
import { fNumber } from "../../utils/Formatter";
import Card from "./Card";

export default function DealerCards({ game, player, dealerCards }) {
    
    const cards = dealerCards?dealerCards:(game?.round?.dealerCards);
    return (
        <div className="absolute top-[18%] lg:top-1/4 w-full flex-col flex gap-3 scale-75  lg:scale-90 z-40">
            <div className="flex gap-1 w-full justify-center">

                <div className="flex gap-1 items-center ">
                    <div className="h-8 bg-white rounded-full z-30">
                        <Icon icon='mdi:casino-chip' color='red' height={32} width={32}></Icon>
                    </div>
                    <label className="text-center flex-1 rounded-full w-[160px] lg:[w-200px]  bg-white/30 -ml-8">
                        {fNumber(game?.round?.betAmount)}$
                    </label>

                </div>
            </div>
            <div className='w-full  justify-center flex gap-1 '>
                {
                    game!=null && cards?.map((card, index) => (
                        <Card shape={card.shape} side={card?.side} value={card.value} key = {index} />
                    ))
                }
                {
                    (game === null || !game?.round) &&
                    [1,2,3,4,5].map((_,index)=>(
                        <Card side={'B'} key = {index} />
                    ))
                }

            </div>
            <div className="flex gap-1 w-full justify-center">
                <div className="flex gap-1 items-center">
                    <div className="h-6 bg-white rounded-full z-30">
                        <Icon icon='mdi:casino-chip' color='#555' height={24} width={24}></Icon>
                    </div>
                    <label className="text-center flex-1 rounded-full w-[120px] lg:[w-160px] bg-white/30 -ml-6 text-sm">
                        {fNumber(player?.betAmount)}$
                    </label>

                </div>
            </div>


        </div>
    )
}