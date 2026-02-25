import { useEffect, useState } from "react"
import styled from 'styled-components';

const RadarWrapper = styled.div.attrs(props => ({
    
}))`width:100%;height:100%;position:absolute;top:0; left:0`

const RadarLoading = styled.div.attrs(props => ({
    style: {
        background: `conic-gradient(from 0deg, #0000 ${props.rotateDeg}deg, #4ab411c0  0)`,
    }
}))`width:100%;height:100%;position:absolute;top:0; left:0`

let interval = 0;

export default function RadarLoader({ seconds, start, children }) {
    const [rotateDeg, setRotateDeg] = useState(0);
    useEffect(() => {
        if (start) {
            if(interval>0){
                clearInterval(interval);
                setRotateDeg(0)
            }
            let update = 0;
            interval = setInterval(() => {
                update += 360 / seconds / 10;
                setRotateDeg(update);
                if (update >= 360) {
                    update = 0;
                    clearInterval(interval);
                }
            }, 100);
        }
        return(
            ()=>{
                setRotateDeg(0)
                clearInterval(interval);
            }
        )
    }, [start, seconds])
    return (
        <div className="relative h-full w-full rounded-full p-1 lg:p-2 bg-gradient-to-tr from-red-500 to-sky-500 overflow-hidden">
            {children}
            {start && <RadarLoading rotateDeg={rotateDeg} />}
            {!start && <RadarWrapper rotateDeg={rotateDeg} />}
        </div>
    )
}