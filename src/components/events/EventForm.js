import React, { useState, useEffect } from 'react';
import {
  Box,
  Stack,
  TextField,
  Button,
  Typography,
  Divider,
} from '@mui/material';
import {
  DateTimePicker,
  LocalizationProvider,
} from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate, useParams } from 'react-router-dom';

import {
  createEvent,
  fetchEventById,
  updateEvent,
} from '../../api/eventService';

export default function EventForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const nav = useNavigate();

  const [data, setData] = useState({
    name: '',
    description: '',
    event_date: new Date(),
    location: '',
    qr_token: '',
    latitude: '',
    longitude: '',
    geofence_radius: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editing) {
      fetchEventById(id).then((e) =>
        setData({
          name: e.name,
          description: e.description,
          event_date: new Date(e.event_date),
          location: e.location,
          qr_token: e.qr_token || '',
          latitude: e.latitude || '',
          longitude: e.longitude || '',
          geofence_radius: e.geofence_radius || '',
        })
      );
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (dt) => {
    setData((prev) => ({ ...prev, event_date: dt }));
  };

  const generateQrToken = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const validate = () => {
    const newErrors = {};
    if (data.latitude && isNaN(parseFloat(data.latitude))) {
      newErrors.latitude = 'Latitude must be a number';
    }
    if (data.longitude && isNaN(parseFloat(data.longitude))) {
      newErrors.longitude = 'Longitude must be a number';
    }
    if (data.geofence_radius && isNaN(parseFloat(data.geofence_radius))) {
      newErrors.geofence_radius = 'Radius must be a number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...data,
      qr_token: data.qr_token || generateQrToken(),
    };

    if (editing) await updateEvent(id, payload);
    else await createEvent(payload);

    nav('/events');
  };

  const mapPreviewUrl = () => {
    if (!data.latitude || !data.longitude) return null;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${data.longitude},${data.latitude},${data.longitude},${data.latitude}&layer=mapnik&marker=${data.latitude},${data.longitude}`;
  };

  return (
    <Box
      sx={{
        maxWidth: 600,
        mx: 'auto',
        mt: 4,
        p: 4,
        borderRadius: '32px',
        border: '1px solid',
        borderColor: (theme) =>
          theme.palette.mode === 'dark'
            ? theme.palette.common.white
            : theme.palette.grey[400],
        bgcolor: 'transparent',
        boxShadow: 'none',
        color: 'text.primary',
        transition: 'border-color 0.3s',
      }}
    >
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        {editing ? 'Edit Event' : 'Create Event'}
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <TextField
            label="Event Name"
            name="name"
            fullWidth
            required
            value={data.name}
            onChange={handleChange}
          />

          <TextField
            label="Description"
            name="description"
            fullWidth
            multiline
            minRows={3}
            value={data.description}
            onChange={handleChange}
          />

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="Date & Time"
              value={data.event_date}
              onChange={handleDateChange}
              renderInput={(params) => <TextField fullWidth {...params} />}
            />
          </LocalizationProvider>

          <TextField
            label="Location"
            name="location"
            fullWidth
            value={data.location}
            onChange={handleChange}
          />

          <TextField
            label="QR Token"
            name="qr_token"
            fullWidth
            value={data.qr_token}
            onChange={handleChange}
            helperText={!editing ? 'Leave blank to auto-generate' : ''}
          />

          <Divider />

          <Typography variant="subtitle1" fontWeight="bold">
            Geofencing Settings
          </Typography>

          <TextField
            label="Latitude"
            name="latitude"
            fullWidth
            value={data.latitude}
            onChange={handleChange}
            error={!!errors.latitude}
            helperText={errors.latitude}
          />
          <TextField
            label="Longitude"
            name="longitude"
            fullWidth
            value={data.longitude}
            onChange={handleChange}
            error={!!errors.longitude}
            helperText={errors.longitude}
          />
          <TextField
            label="Geofence Radius (meters)"
            name="geofence_radius"
            fullWidth
            value={data.geofence_radius}
            onChange={handleChange}
            error={!!errors.geofence_radius}
            helperText={errors.geofence_radius}
          />

          {mapPreviewUrl() && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Map Preview:
              </Typography>
              <Box
                sx={{
                  border: '1px solid #ccc',
                  borderRadius: 1,
                  overflow: 'hidden',
                  height: 300,
                }}
              >
                <iframe
                  title="Map Preview"
                  src={mapPreviewUrl()}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                ></iframe>
              </Box>
            </Box>
          )}

          <Stack direction="row" spacing={2} mt={2} justifyContent="flex-end">
            <Button variant="outlined" onClick={() => nav('/events')}>
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              {editing ? 'Update' : 'Create'}
            </Button>
          </Stack>
        </Stack>
      </form>
    </Box>
  );
}
