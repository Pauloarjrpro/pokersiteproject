import * as Yup from 'yup';
import { useCallback, useState } from "react";

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { LoadingButton } from '@mui/lab'
import { Container, IconButton, InputAdornment, Stack, Typography, Link, Alert } from "@mui/material";
import { useSnackbar } from 'notistack';

import Page from "../components/Page";
import { FormProvider, RHFCheckbox, RHFTextField, RHFUploadAvatar } from "../components/hook-form";
import Iconify from "../components/Iconify";
import useAuth from '../hooks/useAuth';
import axios, { API_AUTH } from '../utils/axios';

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    const RegisterSchema = Yup.object().shape({
        email: Yup.string().email('Email must be a valid email address').required('Email is required'),
        password: Yup.string().required('Password is required'),
        fullName: Yup.string().required('FullName is required'),
        avatar: Yup.mixed().test('required', 'Avatar is required', (value) => value !== ''),
    });

    const defaultValues = {
        email: '',
        password: '',
        fullName: '',
        avatar: '',

    };

    const methods = useForm({
        resolver: yupResolver(RegisterSchema),
        defaultValues,
    });

    const {
        reset,
        setError,setValue,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = methods;

    const onSubmit = async (data) => {
        
        try {
            const iForm = new FormData();
            iForm.append('email',data.email);
            iForm.append('fullName',data.fullName);
            iForm.append('password',data.password);
            iForm.append('avatar',data.avatar);
            const res = await register(iForm);
            if(res?.data && res?.data?.message ==='success'){
        
                enqueueSnackbar(res?.data?.response);
                navigate('/',{replace:true})
            }
            else{
                enqueueSnackbar(res.response,{variant:'error'});
            }
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
        <Page title="Register">
            <Container sx={{ display: 'flex', justifyContent: 'center' }}>

                <div className="flex flex-col gap-8   items-center max-w-2xl justify-center mt-32 border border-pink-500/30 rounded-lg p-8">
                    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
                        <Stack spacing={3} sx={{ mb: 4 }}>
                            <RHFUploadAvatar name='avatar' maxSize={3145728}
                                onDrop={handleDrop} />
                            <RHFTextField name="fullName" label="FullName" />
                            <RHFTextField name="email" label="Email address" />
                            <RHFTextField
                                name="password"
                                label="Password"
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
                            Register
                        </LoadingButton>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 2 }}>
                            <Typography>Already registered?</Typography>
                            <Link component={RouterLink} variant="subtitle2" to={'/auth'} className="no-underline">
                                Login Now
                            </Link>
                        </Stack>
                    </FormProvider>

                </div>
            </Container>
        </Page>
    )
}