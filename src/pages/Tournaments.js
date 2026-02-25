import { Box, Button, Container, Grid, Divider, Typography, Tab, List, ListItem, FormControlLabel, Radio, IconButton, ListItemAvatar, Avatar, ListItemText, Stack, TextField, Dialog, DialogContent, DialogTitle, FormControl, InputLabel, Select, MenuItem } from "@mui/material";

import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";

import { useEffect, useState } from "react";
import Page from "../components/Page";

import useAuth from "../hooks/useAuth";

import CurrentTournaments from "../sections/tournament/currentTournaments";

import TournamentCard from "../components/TournamentCard";

import ScoopTournaments from "../sections/tournament/scoopTournaments";

import WcoopTournaments from "../sections/tournament/wcoopTournaments";

let countInterval = 0;
let remains = 3600 * 24;

export default function ChooseGameRooms(props) {

    const [tabNumber, setTabNumber] = useState("1");

    const [remainPoolTime, setRemainPoolTime] = useState(remains);

    useEffect(() => {
        countInterval = setInterval(() => {
            setRemainPoolTime(remains);
            remains--;
        }, 1000);

        return () => {
            clearInterval(countInterval);
        }
    }, []);

    const handleChangeTab = (event, newValue) => {
        setTabNumber(newValue);
    };

    return (
        <Page title={'Available Tournaments'}>
            <Container className="mt-28">
                <div className="flex gap-2 justify-between flex-col md:flex-row w-full px-4 sm:px-8 md:px-12 mb-4">
                    <div className="flex gap-4 justify-start items-center">
                        <Typography variant="h3" color="yellow" className="cursor-pointer">Tournaments</Typography>
                    </div>

                </div>
                <Box sx={{ width: '100%', typography: 'body1' }}>
                    <TabContext value={tabNumber}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <TabList onChange={handleChangeTab} aria-label="Game Details">
                                <Tab label="Normal" value="1" />
                                <Tab label="Scoop" value="2" />
                                <Tab label="Wcoop" value="3" />
                            </TabList>
                        </Box>
                        <TabPanel value="1">
                           <CurrentTournaments />
                        </TabPanel>
                        <TabPanel value="2">
                            <ScoopTournaments />
                        </TabPanel>
                        <TabPanel value="3">
                            <WcoopTournaments />
                        </TabPanel>
                    </TabContext>
                </Box>
            </Container>
        </Page>
    )
}