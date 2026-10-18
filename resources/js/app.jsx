import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import '@fontsource/vazirmatn/400.css';
import '@fontsource/vazirmatn/500.css';
import '@fontsource/vazirmatn/600.css';
import '@fontsource/vazirmatn/700.css';
import { setupAxios } from './auth';
import theme from './theme';
import AppRoutes from './router';
import LoginIndex from './components/LoginIndex';

setupAxios();

const cacheRtl = createCache({
    key: 'muirtl',
    stylisPlugins: [prefixer, rtlPlugin],
});

const container = document.getElementById('app');

const pages = {
    home: AppRoutes,
    login: LoginIndex,
};

const requestedPage = container?.dataset.page;

// `/` renders the dashboard shell (public); `/login` renders the login screen.
const Page = pages[requestedPage] ?? AppRoutes;

if (container) {
    createRoot(container).render(
        <React.StrictMode>
            <CacheProvider value={cacheRtl}>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <Page />
                </ThemeProvider>
            </CacheProvider>
        </React.StrictMode>,
    );
}
