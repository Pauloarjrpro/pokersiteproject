
import 'rc-slider/assets/index.css';
import ControlButtons from "./ControlButtons";


export default function GameReadyTools({ game, user, onReady, onCancel }) {

    return (
        <div className='w-full md:w-1/2  flex justify-between gap-4 h-full'>
            <ControlButtons title="Ready" icon="ic:baseline-check-circle-outline" clss='from-green-600/60 to-green-900/60' onClick = {onReady} />
            <ControlButtons title="Cancel" icon="ic:round-close" clss="from-red-400/60 to-red-600/60" onClick = {onCancel}/>

        </div>

    )
}