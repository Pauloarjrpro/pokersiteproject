import axios from 'axios';
// config
import { SERVER_HTTP_ADDR } from '../Config';

// ----------------------------------------------------------------------
const API_AUTH = {
  login:'/api/account/login',
  register:'/api/account/register',
  account:'/api/account/my-account',
}
const API_GAME={
  pool:'/api/game/get-pool',
  create: '/api/game/create',
  update: '/api/game/update',
  kickUser: '/api/game/kickUser',
  createTournament: '/api/tournament/create',
  joinTournament: '/api/tournament/join',
  createScoop: '/api/tournament/createScoop'
}

const API_TOURNAMENT={
  updateMember: '/api/tournament/updateMember',
  updateTournament: '/api/tournament/update',
  startTournament: '/api/tournament/start'
}

const API_ACCOUNT = {
  profileWithImage:'/api/account/set-profile-with-image',
  profileWithoutImage:'/api/account/set-profile-without-image',
  withdraw: './api/account/withdraw',
  deposit: './api/account/deposit',
  getWithdraw: './api/account/getWithdraw',
  getDeposit: './api/account/getDeposit'
}
const axiosInstance = axios.create({
  baseURL: SERVER_HTTP_ADDR,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);

export default axiosInstance;

export {
  API_AUTH,API_ACCOUNT,API_GAME, API_TOURNAMENT
}