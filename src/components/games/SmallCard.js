
const flowers = ['♠', '♥', '♣', '♦']
export default function SmallCard({ side = 'F', shape, value, clss = '', highlight = 1 }) {

    return (
        <div className={`${side === 'F' ? 'bg-white p-1 ' : ''} rounded-md flex-col gap-2   ${clss} border h-[6vw]  md:h-[5vw] lg:h-[4.5vw] w-[4vw] md:w-[3.5vw]  overflow-hidden ${highlight === 2 ? 'scale-105 border-2 border-sky-500' : (highlight === 1 ? '' : 'opacity-70')}`}>
            <>
                <div className={`flex flex-col `}>
                    <label className={`${shape % 2 === 1 ? 'text-black' : 'text-red-600'} text-xs leading-none lg:text-small lg:leading-none font-bold`}>
                        {side === 'F' ? value : <span>&nbsp;</span>}
                    </label>
                    <label className={`${shape % 2 === 1 ? 'text-black' : 'text-red-600'} text-xs leading-none lg:text-small lg:leading-none font-bold`}>
                        {side === 'F' ? flowers[shape] : <span>&nbsp;</span>}
                    </label>
                </div>
                <div className="flex w-full flex-1 justify-center items-center">
                    <label className={`${shape % 2 === 1 ? 'text-black' : 'text-red-600'} text-xl lg:text-2xl px-4 pb-2`}>
                        {side === 'F' ? flowers[shape] : <span>&nbsp;&nbsp;</span>}
                    </label>
                </div>
            </>

        </div>
    )
}