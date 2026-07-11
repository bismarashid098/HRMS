import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AuthProvider } from 'context/AuthContext';
import { SettingsProvider } from 'context/SettingsContext';
import router from 'routes/router';
import theme from './theme';
import PWAInstallPrompt from 'components/pwa/PWAInstallPrompt';
import PWAUpdateAlert from 'components/pwa/PWAUpdateAlert';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <SettingsProvider>
          <RouterProvider router={router} />
        </SettingsProvider>
      </AuthProvider>
      <PWAInstallPrompt />
      <PWAUpdateAlert />
    </ThemeProvider>
  </StrictMode>,
);
