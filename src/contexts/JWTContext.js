import PropTypes from 'prop-types';
import { createContext, useEffect, useReducer } from 'react';
// utils
import axios, { API_AUTH } from '../utils/axios';
import { isValidToken, setSession } from '../utils/jwt';

// ----------------------------------------------------------------------

const initialState = {
  isAuthenticated: false,
  isInitialized: false,
  user: null,
  wallet: null
};

const handlers = {
  INITIALIZE: (state, action) => {
    const { isAuthenticated, user } = action.payload;
    return {
      ...state,
      isAuthenticated,
      isInitialized: true,
      user,
    };
  },
  LOGIN: (state, action) => {
    const { user } = action.payload;

    return {
      ...state,
      isAuthenticated: true,
      user,
    };
  },
  LOGOUT: (state) => ({
    ...state,
    isAuthenticated: false,
    user: null,
  }),
  REGISTER: (state, action) => {
    const { user } = action.payload;

    return {
      ...state,
      isAuthenticated: true,
      user,
    };
  },
  WalletConnect: (state, action) => {
    const { account } = action.payload;

    return {
      ...state,
      wallet: account
    }
  }
};

const reducer = (state, action) => (handlers[action.type] ? handlers[action.type](state, action) : state);

const AuthContext = createContext({
  ...initialState,
  method: 'jwt',
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  register: () => Promise.resolve(),
  saveWallet: () => Promise.resolve()
});

// ----------------------------------------------------------------------

AuthProvider.propTypes = {
  children: PropTypes.node,
};

function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const initialize = async () => {

    try {
      const accessToken = localStorage.getItem('accessToken');
      console.log('......initalize authorization......, token:', accessToken)
      if (accessToken && isValidToken(accessToken)) {
        setSession(accessToken);

        const response = await axios.get(API_AUTH.account);
        const { user } = response.data.result;

        dispatch({
          type: 'INITIALIZE',
          payload: {
            isAuthenticated: ((user&& typeof user === 'object')? true:false),
            user:((user&& typeof user === 'object')?user:null),
          },
        });
      } else {
        dispatch({
          type: 'INITIALIZE',
          payload: {
            isAuthenticated: false,
            user: null,
          },
        });
      }
    } catch (err) {
      console.error(err);
      dispatch({
        type: 'INITIALIZE',
        payload: {
          isAuthenticated: false,
          user: null,
        },
      });
    }
  };
  useEffect(() => {
    

    initialize();
  }, []);
 
  const login = async (email, password) => {
    const response = await axios.post(API_AUTH.login, {
      email,
      password,
    });
    try {
      const { token, user } = response.data.result;
      console.log(token)
      setSession(token);

      dispatch({
        type: 'LOGIN',
        payload: {
          user,
        },
      });
    }
    catch (err) {

    }
    return response;
  };

  const register = async (iForm) => {
    const response = await axios.post(API_AUTH.register, iForm);
    const { accessToken, user } = response.data.result;

    localStorage.setItem('accessToken', accessToken);

    dispatch({
      type: 'REGISTER',
      payload: {
        user,
      },
    });
    return response;
  };

  const logout = async () => {
    setSession(null);
    dispatch({ type: 'LOGOUT' });
  };

  const saveWallet = async (address) => {
    dispatch({ 
      type: 'WalletConnect',
      payload: {
        account: address
      }
    })

    return address;
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        method: 'jwt',
        login,
        logout,
        register,
        initialize,
        saveWallet
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };
