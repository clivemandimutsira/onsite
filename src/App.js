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

// Inner app content
function AppContent() {
  const { mode, memberId } = useContext(AuthContext); // ✅ move this here

  const theme = getTheme(mode);

  const content = (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppRoutes />
      <ToastContainer />
    </ThemeProvider>
  );

  return memberId
    ? <NotificationProvider memberId={memberId}>{content}</NotificationProvider>
    : content;
}

// Main app wrapped with Router
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

// Root wrapper with AuthProvider
export default function Root() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
