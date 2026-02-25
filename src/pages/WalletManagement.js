import { useState } from "react";
import { Icon } from "@iconify/react";
import { Container, Divider, Tab, Tabs, Typography, useMediaQuery, useTheme, Box } from "@mui/material";

import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';

import Page from "../components/Page";
import Deposit from "../sections/wallet/Deposit";
import Withdraw from "../sections/wallet/Withdraw";

export default function WalletManagement() {
    const theme = useTheme();
    const nonMobile = useMediaQuery(theme.breakpoints.up('sm'));

    const [tabNumber, setTabNumber] = useState("1");

    const handleChangeTab = (event, newValue) => {
        setTabNumber(newValue);
    };

    return (
        <Page title={'Buy Chips'}>
            <Container>
                <div className="flex w-full gap-2 mt-24 p-4  justify-center">
                    <img src='/assets/dealer1.png' className="h-32" alt=''>
                    </img>
                </div>
                <Divider />
                <Box sx={{ width: '100%', typography: 'body1' }}>

                    <TabContext value={tabNumber}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <TabList onChange={handleChangeTab} aria-label="Game Details">
                                <Tab label="Deposit" value="1" icon={<Icon icon="mdi:instant-deposit" width={24} />} sx={{ color: 'white' }} />
                                <Tab label="Withdraw" value="2" icon={<Icon icon="vaadin:money-withdraw" width={24} />} sx={{ color: 'white' }} />
                                {/* <Tab label="Transactions" value="3" icon={<Icon icon="ic:outline-history" width={24} />} sx={{ color: 'white' }} /> */}
                            </TabList>
                        </Box>
                        <TabPanel value="1">
                            <div className="lg:p-2 w-full sm:w-2/3 lg:w-1/2 justify-center">
                                <Deposit />
                            </div>
                        </TabPanel>
                        <TabPanel value="2">
                            <div className="lg:p-2 w-full sm:w-2/3 lg:w-1/2 justify-center">
                                <Withdraw />
                            </div>
                        </TabPanel>
                        {/* <TabPanel value="3">
                        </TabPanel> */}
                    </TabContext>
                    {/* <Tabs orientation={`${nonMobile?'vertical' : 'horizontal'}`} sx={{ borderColor: 'divider' }} value={0} centered variant={'fullWidth'} >
                        <Tab label="Deposit" icon={<Icon icon="mdi:instant-deposit" width={24} />} sx={{ color: 'white' }} />
                        <Tab label="Withdraw" icon={<Icon icon="vaadin:money-withdraw" width={24} />} sx={{ color: 'white' }} />
                        <Tab label="Transactions" icon={<Icon icon="ic:outline-history" width={24} />} sx={{ color: 'white' }} />

                    </Tabs> */}

                </Box>
            </Container>
            <Divider />

        </Page>

    )
}