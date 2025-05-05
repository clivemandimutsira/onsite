import React, { useEffect, useRef, useState } from 'react';
import {
  Grid,
  Typography,
  TextField,
  Box,
  Divider,
  Avatar,
  Paper,
  Button
} from '@mui/material';

const StepSummary = React.memo(({ values, profilePhoto, handleFile }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const previousPreviewUrl = useRef(null);

  useEffect(() => {
    if (profilePhoto) {
      const newUrl = URL.createObjectURL(profilePhoto);
      setPreviewUrl(newUrl);

      if (previousPreviewUrl.current) {
        URL.revokeObjectURL(previousPreviewUrl.current);
      }
      previousPreviewUrl.current = newUrl;
    } else if (values.profile_photo) {
      const absoluteUrl = `${process.env.REACT_APP_API_URL.replace('/api', '')}${values.profile_photo}`;
      setPreviewUrl(absoluteUrl);
    } else {
      setPreviewUrl(null);
    }

    return () => {
      if (previousPreviewUrl.current) {
        URL.revokeObjectURL(previousPreviewUrl.current);
      }
    };
  }, [profilePhoto, values.profile_photo]);

  const handleUpload = (e) => {
    if (e.target.files.length) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
      <Typography variant="h6" gutterBottom>Profile Photo</Typography>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Avatar
          src={previewUrl || ''}
          alt="Profile Preview"
          sx={{ width: 100, height: 100 }}
        />
        <label htmlFor="upload-photo">
          <input
            accept="image/*"
            id="upload-photo"
            type="file"
            style={{ display: 'none' }}
            onChange={handleUpload}
          />
          <Button variant="outlined" component="span">
            {profilePhoto || values.profile_photo ? 'Change Photo' : 'Upload Photo'}
          </Button>
        </label>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Typography variant="h6" gutterBottom>Review Your Information</Typography>
      <Grid container spacing={2}>
        {Object.entries(values).map(([key, value]) => (
          <Grid item xs={12} sm={6} key={key}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                {key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </Typography>
              <Typography variant="body1">{String(value)}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
});

export default StepSummary;
