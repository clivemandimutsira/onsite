import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Snackbar,
  Box
} from '@mui/material';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { activateAccountAPI } from '../api/auth';

export default function ActivateAccount() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setSnackbarMessage('Missing or invalid activation token.');
      setOpenSnackbar(true);
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !token) return;

    setIsSubmitting(true);
    try {
      await activateAccountAPI({ token, newPassword: password });
      setSnackbarMessage('Account activated! Redirecting to login...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      console.error(err);
      setSnackbarMessage(err.message || 'Activation failed.');
    } finally {
      setOpenSnackbar(true);
      setIsSubmitting(false);
    }
  };

  return (
    <Container sx={{ mt: 8, maxWidth: 400 }}>
      <Paper sx={{ p: 4 }} elevation={3}>
        <Typography variant="h5" gutterBottom>
          Activate Your Account
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Set a new password to activate your account.
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="New Password"
            type="password"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            sx={{ mt: 2 }}
            disabled={isSubmitting || !token}
          >
            {isSubmitting ? 'Activating...' : 'Activate Account'}
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
