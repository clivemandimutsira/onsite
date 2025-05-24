// src/pages/ResetPassword.js
import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, Button, Paper, Snackbar, Box } from '@mui/material';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { resetPasswordAPI } from '../api/auth';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setSnackbarMessage('Invalid reset link.');
      setOpenSnackbar(true);
      setTimeout(() => navigate('/login'), 3000);
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setSnackbarMessage('Please fill in both fields.');
      setOpenSnackbar(true);
      return;
    }
    if (newPassword !== confirmPassword) {
      setSnackbarMessage('Passwords do not match.');
      setOpenSnackbar(true);
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPasswordAPI({ token, newPassword });
      setSnackbarMessage('Password reset successful! Redirecting to login...');
      setOpenSnackbar(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error('Reset password error:', err.message);
      setSnackbarMessage(err.message || 'Failed to reset password.');
      setOpenSnackbar(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container sx={{ mt: 8, maxWidth: 400 }}>
      <Paper sx={{ p: 4 }} elevation={3}>
        <Typography variant="h5" gutterBottom>
          Set New Password
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Enter your new password below.
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="New Password"
            type="password"
            margin="normal"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            sx={{ mt: 2 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>

        <Box mt={2} textAlign="center">
          <Link to="/login">Back to Sign In</Link>
        </Box>
      </Paper>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={() => setOpenSnackbar(false)}
        message={snackbarMessage}
      />
    </Container>
  );
}
