import { Menu, MenuItem, Stack } from "@mui/material";
import { styled } from "@mui/material/styles";
import PropTypes from 'prop-types';
import { useState } from "react";
import Iconify from "./Iconify";
import RouterLink from "./RouterLink";


const MenuAction = styled('div')(({ theme }) => ({
    color:(theme.palette.mode==='dark'?'white':'black'),
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    "&:hover": { borderBottom: `1px solid ${theme.palette.primary.main}` }
}))

DropdownMenu.propTypes = {
    menu: PropTypes.object,
}
export default function DropdownMenu({ menu }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    return (
        <Stack gap={2}>
            <MenuAction onClick={handleClick} >
                {!menu.elements &&
                    <RouterLink to={menu.path}>{menu.title}</RouterLink>
                }
                {menu.elements &&
                    <div className = 'flex gap-2 items-center'>{menu.title}<Iconify icon={"bx:chevron-down"} /></div>

                }
            </MenuAction>
            {menu.elements &&
                <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{
                        'aria-labelledby': 'basic-button',
                    }}
                >
                    {menu.elements.map((item, index) => (
                        <MenuItem key = {index} onClick = {handleClose}>
                            <RouterLink to = {item.path} >{item.title}</RouterLink>
                        </MenuItem>
                    ))}

                </Menu>
            }
        </Stack>
    )
}