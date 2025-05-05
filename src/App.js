import { BrowserRouter as Router } from 'react-router-dom';  // Add BrowserRouter
import { ThemeProvider, CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import { useContext } from 'react';
import { getTheme } from './themes/theme';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import AppRoutes from './routes/AppRoutes';
import 'react-toastify/dist/ReactToastify.css';

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

export default function App() {
  return (
    <AuthProvider>
      <Router>  {/* Wrap the AppContent in Router */}
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
