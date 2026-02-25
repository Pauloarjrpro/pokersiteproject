import { lazy, Suspense } from 'react';
import {useRoutes} from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen';
import AuthGuard from '../guards/AuthGuard';
import GuestGuard from '../guards/GuestGuard';
import MainLayout from '../layout/main';

const Loadable = (Component) => (props) => {

    return (
        <Suspense fallback={<LoadingScreen isDashboard={true} />} >
            <Component {...props} />
        </Suspense>
    )
}

export default function Router(){
    return useRoutes([
        {
            path:'/game-yard/:roomId',
            element:<AuthGuard><GameYard /></AuthGuard>
        },
        {
            path:'/auth',
            element: <GuestGuard><MainLayout /></GuestGuard>,
            children:[
                {element:<Login />, index: true},
                {element:<Register />, path:'register'}
            ]
        },
        {
            path:'/account',
            element: <AuthGuard><MainLayout /></AuthGuard>,
            children:[
                
                {element:<Profile />, path:'profile'},
                {element:<Wallet />, path:'wallet'},
            ]
        },
        {
            path: '/',
            element: <MainLayout />,
            children: [
              { element: <Home />, index: true },
              { element: <Games />, path:'games' },
              { element: <Tournaments />, path:'tournaments' },
              { element: <TournamentDetails />, path: 'tournament-details/:roomId'},
              { element: <AboutUs />, path: 'about' },
              { element: <Blog />, path: 'blogs' },
              { element: <PrivacyPolicy />, path: 'privacy-policy' },
              { element: <TermsOfUse />, path: 'terms-of-use' }
            ],
          },
    ])
}
const Home = Loadable(lazy(() => import('../pages/Home')));
const Wallet = Loadable(lazy(() => import('../pages/WalletManagement')));
const Login = Loadable(lazy(() => import('../pages/Login')));
const Register = Loadable(lazy(() => import('../pages/Register')));
const Profile = Loadable(lazy(() => import('../pages/Profile')));

const Games = Loadable(lazy(() => import('../pages/ChooseGames')));

const Tournaments = Loadable(lazy(()=> import('../pages/Tournaments')));
const NormalTournaments = Loadable(lazy(()=> import('../pages/ChooseTournaments')));

const TournamentDetails = Loadable(lazy(()=>import('../pages/TournamentDetails')));


const GameYard = Loadable(lazy(()=>import("../pages/GameYard")));
const AboutUs = Loadable(lazy(()=>import("../pages/AboutUs")));
const Blog = Loadable(lazy(()=>import("../pages/Blog")));
const PrivacyPolicy = Loadable(lazy(()=>import("../pages/PrivacyPolicy")));
const TermsOfUse = Loadable(lazy(()=>import("../pages/TermsOfUse")));
