import { Icon } from '@iconify/react';
import {IconButton} from '@mui/material';

import PropTypes from 'prop-types';
import { styled, useTheme } from '@mui/material/styles';
import useSettings from '../hooks/useSettings';

IconfyButton.propTypes = {
    icon:PropTypes.string,
    handleEvent:PropTypes.func,
    width:PropTypes.number,
    sx:PropTypes.any,
    background:PropTypes.string,
}
export default function IconfyButton({ icon, handleEvent, width = 20, sx, background =''}) {
    const theme = useTheme();
    const {themeMode}  = useSettings();
    const isLight = (themeMode === 'light');
    const clickEvent = (e)=>{
        if(handleEvent){
            handleEvent(e)
        }
    }
    return (
        <IconButton onClick = {clickEvent} sx={{  ...sx}}>
            <Icon icon={icon} width={width} />
        </IconButton>
    )
}