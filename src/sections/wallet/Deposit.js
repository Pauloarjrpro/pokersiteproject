import { Icon } from "@iconify/react";
import { Box, Button, Divider, InputAdornment, MenuItem, Select, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import IconfyButton from "../../components/IconfyButton";
import useAuth from "../../hooks/useAuth";
import { deposits } from "../../mocks";
import { fNumber, fShortenNumber } from "../../utils/Formatter";
import { fDateTime } from "../../utils/formatTime";
import WalletConnectDialog from "./WalletConnect";
import axiosInstance, { API_ACCOUNT } from "../../utils/axios";

import { useSendTransaction, ERC20Interface, useContractFunction, useEthers, BSCTestnet, useTokenBalance } from "@usedapp/core";
import { utils, Contract } from "ethers";
import { formatEther } from '@ethersproject/units';
import { DataGrid } from "@mui/x-data-grid";

export default function Deposit() {
    const { user, initialize } = useAuth();
    const { activateBrowserWallet, deactivate, account, chainId } = useEthers();
    const { sendTransaction } = useSendTransaction();
    const contractAddress = '0x337610d27c682e347c9cd60bd4b3b107c9d34ddd';
    const contract = new Contract(contractAddress, ERC20Interface);

    const { send, state } = useContractFunction(contract, 'transfer', { transactionName: 'Wrap' });

    const BUSD = {
        [BSCTestnet.chainId]: '0x337610d27c682e347c9cd60bd4b3b107c9d34ddd',
    }

    const BUSDBalance = useTokenBalance(BUSD[chainId], account);

    const navigate = useNavigate();
    const [buyAmount, setBuyAmount] = useState(0);
    const [openWallet, setOpenWallet] = useState(false);
    const [history, setHistory] = useState([]);

    const status = state.status;
    const handlePlay = () => {
        navigate('/games', { replace: true })
    }
    const handleConnect = () => {
        setOpenWallet(!openWallet);
    }

    const handleAmount = (e) => {
        setBuyAmount(e.target.value)
    }

    const handleDeposit = () => {
        const res = sendTransaction({ to: '0x1562dF6C81E147747599b9F259e3A9A5b247bd42', value: 1 });
        console.log(res);
    }

    const handleTokenDeposit = async () => {

        const res = await send( '0x1562dF6C81E147747599b9F259e3A9A5b247bd42', utils.parseEther(buyAmount));

        console.log(res);
    }

    useEffect(()=>{
        if( status == "Success" ) {
            axiosInstance.post(`${API_ACCOUNT.deposit}?token=${localStorage.getItem('accessToken')}`,
                {
                    amount: buyAmount,
                    address: account
                }
            ).then((res) => {
                if(res.status === 200 && res.data.result){
                    // enqueueSnackbar('Withdraw successfully!', { variant: 'success' });
                } else {
                    // enqueueSnackbar('Withdraw failed!', { variant: 'error' });
                }
            }).catch(e=>{
                // enqueueSnackbar('Withdraw failed!', { variant: 'error' });
            })

            }
    }, [status])

    useEffect(()=>{
        initialize();
        axiosInstance.get(`${API_ACCOUNT.getDeposit}?token=${localStorage.getItem('accessToken')}`,
        ).then((res) => {
            if(res.status === 200 && res.data.result){
                setHistory(res.data.result.data);
                // enqueueSnackbar('Withdraw successfully!', { variant: 'success' });
            } else {
                // enqueueSnackbar('Withdraw failed!', { variant: 'error' });
            }
        }).catch(e=>{
            // enqueueSnackbar('Withdraw failed!', { variant: 'error' });
        })
    },[])

    const columns = [
        { field: 'id', headerName: 'ID', width: 50 },
        {
          field: 'created_at',
          headerName: 'Date',
          width: 170,
          valueGetter: (params) =>
                `${fDateTime(params.row.created_at)}`,
        },
        {
          field: 'amount',
          headerName: 'Amount',
          width: 100,
        },
        {
          field: 'balance',
          headerName: 'Balance',
          type: 'number',
          width: 100,
        }
    ];

    return (
        <><div className="flex flex-col lg:px-4 gap-4 w-full">
            <div className="flex gap-2 w-full justify-end">
                <Button size="large" variant={'outlined'} onClick={handleConnect}>Connect Wallet</Button>
            </div>
            <Divider />
            <div className="flex gap-2 w-full">
                <Select className="flex-1" defaultValue={'usdt'} sx={{ width: '140px' }} renderValue={(value) => {

                    return (
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Icon icon={`cryptocurrency:${value}`} width={20} />
                            <Typography className="uppercase">{value}</Typography>
                        </Box>
                    )
                }}>
                    {/* <MenuItem value={'btc'}><Icon icon="cryptocurrency:btc" width={20} />&nbsp;BTC</MenuItem>
                    <MenuItem value={'eth'} ><Icon icon="cryptocurrency:eth" width={20} />&nbsp;ETH</MenuItem>
                    <MenuItem value={'bnb'} ><Icon icon="cryptocurrency:bnb" width={20} />&nbsp;BNB</MenuItem> */}
                    <MenuItem value={'usdt'} ><Icon icon="cryptocurrency:usdt" width={20} />&nbsp;USDT</MenuItem>
                </Select >
                <div className="flex gap-2 flex-1">
                    <TextField type={'number'} value={buyAmount} label="" onChange={(e)=>handleAmount(e)} />
                </div>

            </div>
            <div className="flex w-full justify-center">
                <Icon icon={'material-symbols:keyboard-arrow-down-rounded'} />
            </div>
            <div className="flex w-full justify-center items-center">
                <img alt="" src='/assets/chip-group.png' className="w-20"></img>
                <Typography variant={'h5'}>{fNumber(user?.balance)} + </Typography>
                <Typography variant={'h5'}>&nbsp;{fNumber(buyAmount)} = {fNumber(user?.balance + buyAmount)}</Typography>
            </div>
            <Divider />
            <div className="flex w-full justify-center items-center gap-2">
                <Button variant="outlined" size="large" onClick={()=>handleTokenDeposit()}>Deposit</Button>

            </div>
            {/* deposit history */}
            <Divider />
            <Typography variant={'h6'} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}><Icon icon="material-symbols:chevron-right-rounded" width={20} />Your Deposit History</Typography>
            <div className="flex flex-col gap-4 flex-1 w-full border py-4 px-2 lg:px-4 rounded-lg border-pink-600/10 ">
                {/* {deposits.map((deposit, index) => (
                    <div key={index}>
                        <div className='flex gap-4 justify-between items-center' >
                            <div className="items-center  flex-1">
                                {deposit.date}
                            </div>
                            <div className="flex gap-2 flex-1 items-center ">
                                <Icon icon={`cryptocurrency:${deposit.coin}`} width={20} />
                                <Typography>
                                    {fShortenNumber(deposit.amount)}
                                </Typography>
                            </div>
                            <div className="flex gap-2 items-center">
                                <img src='/assets/chip-group.png' alt='' className="w-14" />
                                {fNumber(deposit.chip)}
                            </div>
                        </div>
                        <Divider />
                    </div>

                ))} */}
                <DataGrid
                    rows={history}
                    columns={columns}
                    initialState={{
                    pagination: {
                        paginationModel: {
                        pageSize: 5,
                        },
                    },
                    }}
                    pageSizeOptions={[5]}
                />
            </div>

        </div>
        <WalletConnectDialog handleClose={()=>setOpenWallet(false)}  open = {openWallet}/>
        </>

    )
}