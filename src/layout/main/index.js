import { Outlet } from 'react-router-dom';
// @mui
import { Box, Stack } from '@mui/material';
// components
//
import Footer from './Footer';
import Header from './Header';


// ----------------------------------------------------------------------

export default function MainLayout() {


    return (
        <Stack sx={{ minHeight: 1 }}>
            <Header />
            <Box sx={{ minHeight: '100vh' }}>
                <Outlet />
            </Box>
            <Box sx={{ flexGrow: 1 }} />

            <Footer />

        </Stack>
    );
}
