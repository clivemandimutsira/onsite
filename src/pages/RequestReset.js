// src/pages/RequestReset.js
import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Paper, Snackbar, Box } from '@mui/material';
import { requestResetAPI } from '../api/auth';
import { Link } from 'react-router-dom';

export default function RequestReset() {
  const [email, setEmail] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setSnackbarMessage('Please enter your email address.');
      setOpenSnackbar(true);
      return;
    }

    setIsSubmitting(true);
    try {
      await requestResetAPI({ email });
      setSnackbarMessage('If the email exists, you’ll receive reset instructions shortly.');
    } catch (err) {
      console.error('Request reset error:', err.message);
      setSnackbarMessage(err.message || 'Failed to request password reset.');
    } finally {
      setOpenSnackbar(true);
      setIsSubmitting(false);
    }
  };

  return (
    <Container sx={{ mt: 8, maxWidth: 400 }}>
      <Paper sx={{ p: 4 }} elevation={3}>
        <Typography variant="h5" gutterBottom>
          Password Reset
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Enter your account email and we’ll send you instructions to reset your password.
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            sx={{ mt: 2 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
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
