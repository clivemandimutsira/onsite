import React, { useState, useContext, useEffect } from 'react';
import { Container, Typography, TextField, Button, Paper, Snackbar, Box, Link as MUILink } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { loginAPI, requestResetAPI } from '../api/auth';
import { Email as EmailIcon, Lock as LockIcon } from '@mui/icons-material';
import backgroundImage from '../assets/background.jpg'; // Make sure the path is correct

export default function Login() {
  const { login, isAuthenticated, userRole } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      if (userRole === 'member') navigate('/member-dashboard');
      else navigate('/dashboard');
    }
  }, [isAuthenticated, userRole, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setSnackbarMessage('Please enter both email and password.');
      setOpenSnackbar(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const {
        token,
        roles,
        permissions,
        userRole: role,
        memberId: mId,
        forcePasswordReset
      } = await loginAPI(form);

      if (forcePasswordReset) {
        await requestResetAPI({ email: form.email });
        setSnackbarMessage('Password reset required. Check your email for instructions.');
        setOpenSnackbar(true);
        return;
      }

      login(token, roles, permissions, role, mId);
      setSnackbarMessage('Login successful!');
      setOpenSnackbar(true);
      if (role === 'member') navigate('/member-dashboard');
      else navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err.message);
      setSnackbarMessage(err.message || 'Login failed. Please try again.');
      setOpenSnackbar(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2,
        boxSizing: 'border-box',
      }}
    >
      <Paper elevation={6} sx={{ p: 4, width: '100%', maxWidth: 480, borderRadius: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, fontFamily: 'Outfit' }}>
            Welcome to FaithFlow
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
            Sign in to your account
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            margin="normal"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            InputProps={{ startAdornment: <EmailIcon sx={{ mr: 1 }} /> }}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            margin="normal"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            InputProps={{ startAdornment: <LockIcon sx={{ mr: 1 }} /> }}
          />

          <Box sx={{ textAlign: 'right', mt: 1 }}>
            <MUILink component={Link} to="/request-reset" variant="body2">
              Forgot password?
            </MUILink>
          </Box>

          <Button
            fullWidth
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 3, borderRadius: 2, fontWeight: 600 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Sign In'}
          </Button>
        </form>

        <Box mt={2} textAlign="center">
          <Typography variant="body2">
            Don’t have an account?{' '}
            <MUILink component={Link} to="/register">
              Get started
            </MUILink>
          </Typography>
        </Box>
      </Paper>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={() => setOpenSnackbar(false)}
        message={snackbarMessage}
      />
    </Box>
  );
}
