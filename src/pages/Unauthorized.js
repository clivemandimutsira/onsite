import React from 'react';
import { Typography, Box } from '@mui/material';

export default function Unauthorized() {
  return (
    <Box textAlign="center" mt={5}>
      <Typography variant="h4">403 - Unauthorized</Typography>
      <Typography>You do not have permission to view this page.</Typography>
    </Box>
  );
}
