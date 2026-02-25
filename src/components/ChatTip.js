
export default function ChatTip({ visible, text, position = 'top' }) {

    return (
        <>
            {visible &&
                <div className={`absolute ${position === 'top' ? '-top-4' : 'top-6'} text-black z-50 ml-4 md:ml-8 lg:ml-12 text-bold`}>
                    {position === 'bottom' && text && text !== "" &&
                        <>
                            <div className={`h-0 border-4 border-transparent  border-b-yellow-300 content-none w-0 bg-transparent`} />

                            <div className="text-2xs md:text-small lg:text-xs flex min-w-fit rounded-md py-1 rounded-tl-none bg-yellow-300 px-1  ">
                                <p className={`${text.length > 10 ? 'w-20 lg:w-24' : 'w-14 lg:w-16'}`}>{text}</p>
                            </div>

                        </>

                    }

                    {position === 'top' &&
                        <>
                            <div className="text-2xs md:text-small lg:text-xs flex min-w-fit rounded-md py-1 rounded-bl-none bg-yellow-300 px-3 md:px-6  ">
                                <label className="uppercase font-bold">{text}</label>
                            </div>
                            <div className={`h-0 border-4 border-transparent border-t-yellow-300    content-none w-0 bg-transparent`} />
                        </>

                    }

                </div>
            }
        </>

    )
}