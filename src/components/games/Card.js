
const flowers = ['♠', '♥', '♣', '♦']
export default function Card({ side='F', shape, value, clss = '' }) {

    return (
        <div className={`${side === 'F' ? 'bg-white p-1 ' : ''} rounded-md flex-col gap-2   ${clss} border h-[12vw]  md:h-[10vw] lg:h-[9vw] w-[8vw] md:w-[7vw]  overflow-hidden`}>
            {side === 'B' &&
                <img src = '/assets/card-back.png' className="h-[12vw] md:h-[10vw] lg:h-[9vw] w-[8vw]" alt = ''> 
                </img>
            }
            {side === 'F' &&
                <>
                    <div className={`flex flex-col ${side === 'B' ? 'card-back' : ''}`}>
                        <label className={`${shape % 2 === 1 ? 'text-black' : 'text-red-600'} text-md leading-none lg:text-2xl lg:leading-none font-bold`}>
                            {side === 'F' ? value : <span>&nbsp;</span>}
                        </label>
                        <label className={`${shape % 2 === 1 ? 'text-black' : 'text-red-600'} text-lg leading-none lg:text-3xl lg:leading-none font-bold`}>
                            {side === 'F' ? flowers[shape] : <span>&nbsp;</span>}
                        </label>
                    </div>
                    <div className="flex w-full flex-1 justify-center items-center">
                        <label className={`${shape % 2 === 1 ? 'text-black' : 'text-red-600'} text-3xl lg:text-5xl px-4 pb-2`}>
                            {side === 'F' ? flowers[shape] : <span>&nbsp;&nbsp;</span>}
                        </label>
                    </div>
                </>
            }
        </div>
    )
}