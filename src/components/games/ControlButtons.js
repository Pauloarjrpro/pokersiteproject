import { Icon } from "@iconify/react";

import { fNumber } from "../../utils/Formatter";

export default function ControlButtons({ id, icon, title, value = 0, clss = '', onClick, disabled = false, }) {

    return (
        <div className={`cursor-pointer flex flex-col  justify-center px-1  bg-gradient-to-b active:bg-gradient-to-t  from-gray-600/60 to-gray-900/60 rounded text-white flex-1 ${clss} ${disabled?'opacity-50':'opacity-100'}`} onClick={() => {
                if (!disabled) {
                    onClick(id);
                }
            }
        } >
            <div className='flex gap-2 justify-center items-center text-bold '>
                <label>{title}</label>
            </div>
            <div className="flex gap-2 justify-center items-center text-bold">
                {icon && <Icon icon={icon} />}

                <span>
                    {value > 0 && fNumber(value)}
                </span>

            </div>
        </div>
    )
}