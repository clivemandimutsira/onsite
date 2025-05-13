// src/App.jsx

import React, { useContext } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { getTheme } from './themes/theme';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import AppRoutes from './routes/AppRoutes';

function AppContent() {
  const { mode } = useContext(AuthContext);

  return (
    <ThemeProvider theme={getTheme(mode)}>
      <CssBaseline />
      <AppRoutes />
      <ToastContainer />
    </ThemeProvider>
  );
}

function App() {
  const { memberId } = useContext(AuthContext);

  return (
    <Router>
      {/* Only wrap NotificationProvider once we have memberId */}
      {memberId
        ? <NotificationProvider memberId={memberId}>
            <AppContent />
          </NotificationProvider>
        : <AppContent />
      }
    </Router>
  );
}

// Top‐level export with AuthProvider
export default function Root() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
