import { Icon } from "@iconify/react";
import * as Yup from 'yup';
import { useCallback, useMemo, useState } from "react";

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab'
import { Container, IconButton, InputAdornment, Stack, Typography, Box, Divider } from "@mui/material";
import { useSnackbar } from 'notistack';

import { FormProvider, RHFTextField, RHFUploadAvatar } from "../components/hook-form";
import Iconify from "../components/Iconify";
import { SERVER_HTTP_ADDR } from "../Config";
import useAuth from "../hooks/useAuth";
import { fNumber } from "../utils/Formatter";

import axios, { API_ACCOUNT } from "../utils/axios";

const Medal = ({ count, name, file }) => {
    return (
        <div className={`${count > 0 ? 'opacity-100' : 'opacity-50'}`}>
            <img src={`/assets/icons/${file}`} alt=''>
            </img>
        </div>
    )
}
export default function Profile() {
    const { user, initialize } = useAuth();
    const [mode, setMode] = useState('view');
    const handleMode = () => {
        setMode(mode === 'view' ? 'edit' : 'view');
    }
    const [showPassword, setShowPassword] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    const RegisterSchema = Yup.object().shape({
        currentPassword: Yup.string().required('Current Password is required'),
        fullName: Yup.string().required('FullName is required'),
    });

    const defaultValues = useMemo(() => ({
        fullName: user?.fullName || '',
        password: '',
        currentPassword: '',
        avatar: `${SERVER_HTTP_ADDR}/${user?.avatar || ''}`,

    }), [user]);

    const methods = useForm({
        resolver: yupResolver(RegisterSchema),
        defaultValues,
    });

    const {
        reset,
        setValue,
        handleSubmit,
        formState: { isSubmitting },
    } = methods;

    const onSubmit = async (data) => {

        try {
            const iForm = new FormData();
            iForm.append('fullName', data.fullName);
            iForm.append('password', data.password);
            iForm.append('currentPassword', data.currentPassword);
            iForm.append('avatar', data.avatar);
            if (typeof data.avatar === 'object') {
                axios.post(`${API_ACCOUNT.profileWithImage}`, iForm).then(res => {
                    if (res.status === 200 && res.data.response) {
                        enqueueSnackbar(res.data.response);
                        initialize();
                    }
                    else {
                        enqueueSnackbar(res.data?.response, { variant: 'error' })
                    }
                    // console.log(res)
                }).catch(err => {
                    console.log(err);
                })
            }
            else if (typeof data.avatar === 'string') {
                axios.post(`${API_ACCOUNT.profileWithoutImage}`, data).then(res => {
                    if (res.status === 200 && res.data.response) {
                        enqueueSnackbar(res.data.response);
                        initialize();
                    }
                    else {
                        enqueueSnackbar(res.data?.response, { variant: 'error' })
                    }
                }).catch(err => {
                    console.log(err);
                })
            }
            // const res = await register(iForm);
            // if(res?.data && res?.data?.message ==='success'){

            //     enqueueSnackbar(res?.data?.response);
            //     navigate('/',{replace:true})
            // }
            // else{
            //     enqueueSnackbar(res.response,{variant:'error'});
            // }
        } catch (error) {

            reset();

        }
    };
    const handleDrop = useCallback(
        (acceptedFiles) => {
            const file = acceptedFiles[0];

            if (file) {
                setValue(
                    'avatar',
                    Object.assign(file, {
                        preview: URL.createObjectURL(file),
                    })
                );
            }
        },
        [setValue]
    );
    return (
        <Container sx={{ mt: 14 }}>
            <div className="flex w-full justify-center pb-4">
                <div className='flex flex-col max-w-md p-4 md:px-8 border border-pink-600/10 w-full rounded-md pb-8'>
                    <div className=" flex justify-between w-full  ">
                        <Box className={` flex justify-center items-center`} sx={{ mt: -2, width: 76, height: 94, background: `url(/assets/icons/vip_type_${Math.floor(user.level / 10)}.svg)` }} >
                            VIP{user?.level}
                        </Box>
                        <div>
                            <IconButton onClick={handleMode}>
                                <Icon icon={`${mode === 'view' ? 'material-symbols:edit' : 'material-symbols:arrow-back-rounded'}`}></Icon>
                            </IconButton>
                        </div>

                    </div>
                    {mode === 'view' &&
                        <>
                            {/* avatar and user info */}

                            <div className='flex justify-center w-full flex-col items-center gap-4 mb-4'>
                                <div className='rounded-full border border-dashed h-32 w-32 overflow-hidden'>
                                    <img src={`${SERVER_HTTP_ADDR}/${user?.avatar}`} alt='' className="w-full h-full">
                                    </img>
                                </div>
                                <div className="flex flex-col justify-center items-center">
                                    <Typography variant='h6'>{user?.fullName}</Typography>
                                    <Typography variant='caption'>User ID:{user?.id}</Typography>
                                    <div className="flex gap-0 justify-center">
                                        {[0, 1, 2, 3, 4, 5].map((_, index) => (
                                            <div className={`${user?.level / 10 > index ? 'opacity-100' : 'opacity-50'}`} key={index}>
                                                <Icon icon='ph:medal-fill' color='yellow' key={index}></Icon>
                                            </div>

                                        ))}
                                    </div>

                                </div>
                            </div>
                            <Divider />
                            <div className="flex w-full flex-col p-2 mb-4 mt-2">
                                <div className="flex w-full items-center gap-2">
                                    <Icon icon='fa6-solid:medal'></Icon>
                                    <Typography variant='subtitle1'>Medals</Typography>
                                </div>
                                <div className='flex w-full overflow-x-auto '>
                                    {
                                        ['medal_allin.webp', 'medal_balance.webp', 'medal_deposit.webp', 'medal_kick.webp', 'medal_rank_1.webp', 'medal_super.webp'].map((file, index) => (
                                            <Medal count={Math.floor(Math.random() * index)} key={index} file={file} name='' />
                                        ))
                                    }
                                </div>
                            </div>
                            <Divider />
                            <div className="flex w-full flex-col p-2 mt-2">
                                <div className="flex w-full items-center gap-2">
                                    <Icon icon="carbon:text-link-analysis"></Icon>
                                    <Typography variant='subtitle1'>Statistics</Typography>

                                </div>
                                <div className="flex gap-2 justify-between p-2">
                                    <div className="flex flex-col gap-1 justify-center items-center p-4">
                                        <Typography variant='caption'>Total Deposit</Typography>
                                        <Typography variant='h6'>{fNumber(user?.deposit)}</Typography>
                                    </div>
                                    <div className="flex flex-col gap-1 justify-center items-center p-4">
                                        <Typography variant='caption'>Total Withdraw</Typography>
                                        <Typography variant='h6'>{fNumber(user?.withdrawed)}</Typography>
                                    </div>
                                    <div className="flex flex-col gap-1 justify-center items-center p-4">
                                        <Typography variant='caption'>Total Wagered</Typography>
                                        <Typography variant='h6'>{fNumber(user?.wagered)}</Typography>
                                    </div>
                                </div>
                            </div>
                        </>
                    }
                    {mode === 'edit' &&
                        <>
                            <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
                                <Stack spacing={3} sx={{ mb: 4 }}>
                                    <RHFUploadAvatar name='avatar' maxSize={3145728}
                                        onDrop={handleDrop} />
                                    <RHFTextField name="fullName" label="FullName" />
                                    <RHFTextField
                                        name="currentPassword"
                                        label="Current Password"
                                        type={'password'}
                                    />
                                    <RHFTextField
                                        name="password"
                                        label="New Password"
                                        type={showPassword ? 'text' : 'password'}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                        <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Stack>
                                <LoadingButton fullWidth size="large" type="submit" variant="outlined" loading={isSubmitting}>
                                    Modify
                                </LoadingButton>

                            </FormProvider>

                        </>
                    }
                </div>
            </div>
        </Container>
    )
}