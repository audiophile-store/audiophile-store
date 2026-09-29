import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Provider } from 'react-redux'
import store from './app/store'
import { ThemeProvider } from '@mui/material/styles';
import { muiColorTheme } from './utils/mui';
import { BrowserRouter } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import { SnackbarProvider } from 'notistack';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

const root = ReactDOM.createRoot(container);
root.render(
  <React.StrictMode>
    <Provider store={ store }>
      <ThemeProvider theme={ muiColorTheme }>
        <BrowserRouter>
          <ScrollToTop>
            <SnackbarProvider autoHideDuration={ 2000 }>
              <App />
            </SnackbarProvider>
          </ScrollToTop>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);
