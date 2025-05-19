import React, { useState, useEffect } from 'react';
import {
  Container, Typography, TextField, Button, Paper, Snackbar, Box
} from '@mui/material';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { resetPasswordAPI } from '../api/auth'; // or create verifyEmail API
import backgroundImage from '../assets/background.jpg';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setSnackbar({ open: true, message: 'Invalid verification link.' });
      setTimeout(() => navigate('/login'), 3000);
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirm) {
      return setSnackbar({ open: true, message: 'Please fill in all fields.' });
    }
    if (password !== confirm) {
      return setSnackbar({ open: true, message: 'Passwords do not match.' });
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification failed');

      setSnackbar({ open: true, message: 'Password set! Redirecting to login...' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error('Verification error:', err.message);
      setSnackbar({ open: true, message: err.message });
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
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2,
      }}
    >
      <Paper elevation={6} sx={{ p: 4, width: '100%', maxWidth: 480 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
          Set Your Password
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="New Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            label="Confirm Password"
            type="password"
            fullWidth
            margin="normal"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <Button
            fullWidth
            type="submit"
            variant="contained"
            sx={{ mt: 2 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Verifying...' : 'Set Password'}
          </Button>
        </form>
        <Box mt={2} textAlign="center">
          <Link to="/login">Back to Login</Link>
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
}
