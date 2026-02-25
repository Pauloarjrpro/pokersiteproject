import { Avatar, Button, IconButton, Stack, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { MenuRoutes } from "../../_mock/MenuItems";
import useResponsive from "../../hooks/useResponsive";
import DropdownMenu from "../../components/DropdownMenu";
import MobileDrawer from "./MobileDrawer";
import useSettings from "../../hooks/useSettings";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { SERVER_HTTP_ADDR } from "../../Config";
import AccountPopover from "./AccountPopover";

import { fNumber } from "../../utils/Formatter";

import { formatEther } from '@ethersproject/units'

import { useEthers, useEtherBalance, BSCTestnet, useTokenBalance, useTokenList } from '@usedapp/core';

export default function MainMenu() {
    const { themeMode, onToggleMode } = useSettings();
    const { isAuthenticated, user, saveWallet } = useAuth();
    const isMobile = useResponsive('down', 'md');
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    const openDrawer = () => {
        setOpen(true);

    }
    const handleClose = () => {
        setOpen(false);
    }

    const BUSD = {
        [BSCTestnet.chainId]: '0x337610d27c682e347c9cd60bd4b3b107c9d34ddd',
      }

    const { activateBrowserWallet, deactivate, account, chainId } = useEthers();

    const etherBalance = useEtherBalance(account);

    const BUSDBalance = useTokenBalance(BUSD[chainId], account);

    // console.log(chainId, account, formatEther(etherBalance));

    // Handle the wallet toggle
    const handleWalletConnection = async () => {
        if (account) {
            deactivate();
        } else {
            activateBrowserWallet();
        }
    };
    

    useEffect(()=>{
        if(account){
            saveWallet(account);
        }
    },[account])
    return (
        <Stack direction='row' gap={2} alignItems="center" >
            {!isMobile && MenuRoutes.map((menu, index) => (
                <DropdownMenu key={index} menu={menu} />
            ))}
            {!isAuthenticated &&
                <Button variant="outlined" sx={{ paddingX: 4 }} onClick={() => {
                    navigate('/auth', { replace: true })
                }}>Login/Register</Button>
            }
            {isAuthenticated &&
                <AccountPopover  />
            }

            <Button variant='contained' onClick={handleWalletConnection}>
                {account
                ? `Disconnect ${account.substring(0, 5)}...`
                : 'Connect Wallet'}
            </Button>

            {/* <IconButton onClick = {onToggleMode} sx = {{color:'black'}}>
                <Icon  color = {themeMode === 'light' ?'black':'white'} icon={themeMode === 'light' ? "ic:twotone-nightlight" : "carbon:light-filled"} width={20} />
            </IconButton> */}

            {isMobile &&
                <>
                    <IconButton onClick={openDrawer}>
                        <Icon icon='dashicons:menu-alt' color="white"/>
                    </IconButton>
                    <MobileDrawer open={open} handleClose={handleClose} />
                </>

            }

            {/* {etherBalance && (
                <div className="balance">
                    <br />
                    BNB balance:
                    <p className="bold">{formatEther(etherBalance)} ETH</p>
                </div>
            )} */}
            {/* {BUSDBalance && (
                <div className="balance">
                    <br />
                    Ether balance:
                    <p className="bold">{formatEther(BUSDBalance)} USDT</p>
                </div>
            )} */}

            {user && 
                <div className="flex gap-2 flex-1 items-center text-white ">
                    <Icon icon={`cryptocurrency-color:usdt`} width={20} />
                    <Typography>
                        {fNumber(user.balance)}
                    </Typography>
                </div>
            }
        </Stack>
    )
}