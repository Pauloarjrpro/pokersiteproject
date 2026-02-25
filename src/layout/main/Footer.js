
// @mui
import { styled, } from '@mui/material/styles';
import { Grid, Typography, Stack, Box, Container, } from '@mui/material';

// components
import RouterLink from '../../components/RouterLink';
import { purplePreset } from '../../utils/getColorPresets';
import IconfyButton from '../../components/IconfyButton';
import Logo from '../../components/Logo';
// ----------------------------------------------------------------------


const RootStyle = styled('div')(({ theme }) => ({
    position: 'relative',
    backgroundColor: theme.palette.background.default,
    paddingBottom: 10,
}));

// ----------------------------------------------------------------------

export default function MainFooter() {

    return (
        <RootStyle>
            <Container >
                <Box display={'flex'} flexDirection={{ xs: 'column', md: 'row', }} paddingX={2} justifyContent={'space-between'} alignItems={"center"} >
                    <div className="scale-50">
                        <Logo />
                    </div>


                    <Typography component='div'>
                        ® 2024. All Right Reserved
                    </Typography>
                    <Stack flexDirection='row'>
                        <RouterLink to="/">  Privacy Policy</RouterLink>
                        <Typography sx={{ width: 20, textAlign: 'center' }} >/</Typography>
                        <RouterLink to="/">  Term Of Use</RouterLink>
                    </Stack>
                </Box>
            </Container>
        </RootStyle>
    );
}
