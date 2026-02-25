import * as Yup from 'yup';
import { useState } from "react";
import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {LoadingButton} from '@mui/lab'
import { Container, IconButton, InputAdornment, Stack, Typography,Link, Alert } from "@mui/material";
import Page from "../components/Page";
import { FormProvider, RHFCheckbox, RHFTextField } from "../components/hook-form";
import Iconify from "../components/Iconify";
import Logo from '../components/Logo';
import useAuth from '../hooks/useAuth';


export default function Login() {
    const { login } = useAuth();
    const { enqueueSnackbar } = useSnackbar();
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const LoginSchema = Yup.object().shape({
      email: Yup.string().email('Email must be a valid email address').required('Email is required'),
      password: Yup.string().required('Password is required'),
    });
  
    const defaultValues = {
      email: '',
      password: '',
      remember: true,
    };
  
    const methods = useForm({
      resolver: yupResolver(LoginSchema),
      defaultValues,
    });
  
    const {
      reset,
      setError,
      handleSubmit,
      formState: { errors, isSubmitting },
    } = methods;
  
    const onSubmit = async (data) => {
      try {

        const res = await login(data.email, data.password);
        
        if(res?.data && res?.data?.message ==='success'){
                
            enqueueSnackbar(res?.data?.response);
            navigate('/',{replace:true});
        }
        else{
            enqueueSnackbar(res?.data?.response,{variant:'error'});
        }
      } catch (error) {
        // console.log(error)
        reset();
      }
    };
    return (
        <Page title="Login">
            <Container sx = {{display:'flex', justifyContent:'center'}}>

                <div className="flex flex-col gap-8   items-center max-w-2xl justify-center mt-32 border border-pink-500/30 rounded-lg p-8">
                    <div className='flex gap-2 py-4 items-center'>
                        <Logo sx = {{width:100, height:60}}/>
                        <div className='hidden md:block'>
                        <Typography variant="h4">Welcome to visit us</Typography>
                        <Typography >Please input your authentications</Typography>
                        </div>
                        
                    </div>
                    
                    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
                        <Stack spacing={3}>

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

                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 2 }}>
                            <RHFCheckbox name="remember" label="Remember me" />
                            <Link component={RouterLink} variant="subtitle2" to={'reset-password'} className = "no-underline">
                                Forgot password?
                            </Link>
                        </Stack>

                        <LoadingButton fullWidth size="large" type="submit" variant="outlined" loading={isSubmitting}>
                            Login
                        </LoadingButton>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 2 }}>
                            <Typography>Not registered yet?</Typography>
                            <Link component={RouterLink} variant="subtitle2" to={'/auth/register'} className = "no-underline">
                                Register You
                            </Link>
                        </Stack>
                    </FormProvider>

                </div>
            </Container>
        </Page>
    )
}