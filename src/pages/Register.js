import React, { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Snackbar,
  Box,
  InputAdornment
} from '@mui/material';
import { Email as EmailIcon } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/background.jpg';
import { registerUser } from '../api/users'; // ✅ must send email only

export default function Register() {
  const [email, setEmail] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setSnackbarMessage('Please enter your email.');
      setOpenSnackbar(true);
      return;
    }

    setIsSubmitting(true);
    try {
      await registerUser({ email }); // send only email
      setSnackbarMessage('Verification email sent. Please check your inbox.');
      setTimeout(() => navigate('/login'), 4000); // optional redirect
    } catch (err) {
      setSnackbarMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setOpenSnackbar(true);
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
        padding: '16px',
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 480,
          borderRadius: 2,
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              fontFamily: 'Jost, sans-serif',
              mb: 1,
            }}
          >
            Welcome to FaithFlow
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{ fontFamily: 'Jost, sans-serif', color: 'text.secondary' }}
          >
            Create your account
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{
              mt: 3,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              fontFamily: 'Jost, sans-serif',
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Send Verification Link'}
          </Button>
        </form>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2">
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#007bff' }}>
              Login
            </Link>
          </Typography>
        </Box>
      </Paper>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={5000}
        onClose={() => setOpenSnackbar(false)}
        message={snackbarMessage}
      />
    </Box>
  );
}
