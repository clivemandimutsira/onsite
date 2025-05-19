import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  MenuItem,
  Select,
  TextField,
  InputLabel,
  FormControl,
  Grid
} from '@mui/material';

const MemberCreateNotificationForm = ({ onSubmit, defaultMemberId = '' }) => {
  const [form, setForm] = useState({
    member_id: defaultMemberId,
    title: '',
    message: '',
    type: 'reminder',
    scheduled_at: '',
    recurrence: 'none',
    viaEmail: true,
    viaSms: false,
  });

  useEffect(() => {
    setForm((prev) => ({ ...prev, member_id: defaultMemberId }));
  }, [defaultMemberId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    const res = await fetch(`${API_URL}/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok && onSubmit) {
      onSubmit();
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Title"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            fullWidth
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Message"
            name="message"
            value={form.message}
            onChange={handleChange}
            multiline
            rows={4}
            required
            fullWidth
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              name="type"
              value={form.type}
              onChange={handleChange}
              label="Type"
            >
              <MenuItem value="reminder">Reminder</MenuItem>
              <MenuItem value="announcement">Announcement</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Scheduled At"
            name="scheduled_at"
            type="datetime-local"
            value={form.scheduled_at}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Recurrence</InputLabel>
            <Select
              name="recurrence"
              value={form.recurrence}
              onChange={handleChange}
              label="Recurrence"
            >
              <MenuItem value="none">One-time</MenuItem>
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <Box display="flex" alignItems="center" gap={2}>
              <label>
                <input
                  type="checkbox"
                  name="viaEmail"
                  checked={form.viaEmail}
                  onChange={handleChange}
                />
                <span style={{ marginLeft: 8 }}>Send Email</span>
              </label>
              <label>
                <input
                  type="checkbox"
                  name="viaSms"
                  checked={form.viaSms}
                  onChange={handleChange}
                />
                <span style={{ marginLeft: 8 }}>Send SMS</span>
              </label>
            </Box>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button type="submit" variant="contained" color="primary">
              Send Notification
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MemberCreateNotificationForm;
