import React from 'react';

import ReactDOMClient from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Provider as ReduxProvider } from 'react-redux';
import './utils/highlight';

// editor
import 'react-quill/dist/quill.snow.css';

// lazy image
import 'react-lazy-load-image-component/src/effects/blur.css';
import 'react-lazy-load-image-component/src/effects/opacity.css';
import 'react-lazy-load-image-component/src/effects/black-and-white.css';

import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { store } from './redux/store';
import { SettingsProvider } from './contexts/SettingsContext';
import { AuthProvider } from './contexts/JWTContext';

import { DAppProvider, BSCTestnet } from '@usedapp/core';
import { getDefaultProvider } from 'ethers';

const container = document.getElementById('root');
const root = ReactDOMClient.createRoot(container);

const config = {
  readOnlyChainId: BSCTestnet.chainId,
  readOnlyUrls: {
    [BSCTestnet.chainId]: getDefaultProvider(
      'https://endpoints.omniatech.io/v1/bsc/testnet/public'
    ),
  },
};

root.render(
  <AuthProvider>
    <HelmetProvider>
      <ReduxProvider store={store} >
        <SettingsProvider>

          <BrowserRouter>
            <DAppProvider config={config}>
              <App />
            </DAppProvider>
          </BrowserRouter>
        </SettingsProvider>

      </ReduxProvider>
    </HelmetProvider>
  </AuthProvider>
);
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
