import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  MenuItem,
  Select,
  TextField,
  Typography,
  InputLabel,
  FormControl,
  Grid,
  Paper,
  Divider,
  useTheme,
} from '@mui/material';

const CreateNotificationForm = ({ onSubmit, defaultMemberId = '' }) => {
  const theme = useTheme();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const [form, setForm] = useState({
    target: 'group',
    group_id: '',
    department_id: '',
    member_type: '',
    title: '',
    message: '',
    type: 'reminder',
    scheduled_at: '',
    recurrence: 'none',
  });

  const [departments, setDepartments] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const loadDepartmentsAndGroups = async () => {
      try {
        const [departmentsRes, groupsRes] = await Promise.all([
          fetch(`${API_URL}/departments`),
          fetch(`${API_URL}/cell-groups`),
        ]);

        if (!departmentsRes.ok || !groupsRes.ok) {
          throw new Error('Failed to fetch departments or groups');
        }

        const departmentsData = await departmentsRes.json();
        const groupsData = await groupsRes.json();

        setDepartments(departmentsData);
        setGroups(groupsData);
      } catch (err) {
        console.error('Error loading departments or groups:', err);
      }
    };

    loadDepartmentsAndGroups();
  }, []);

  useEffect(() => {
    const loadRecipients = async () => {
      try {
        let url = '';
        if (form.target === 'group' && form.group_id) {
          url = `${API_URL}/cell-groups/${form.group_id}/members`;
        } else if (form.target === 'department' && form.department_id) {
          url = `${API_URL}/departments/${form.department_id}/members`;
        } else if (form.target === 'member_type' && form.member_type) {
          url = `${API_URL}/members?member_type=${form.member_type}`;
        }

        if (url) {
          const res = await fetch(url);
          if (!res.ok) throw new Error('Failed to fetch recipient data');
          const data = await res.json();
          const list = form.target === 'department' || form.target === 'group' ? data.members || [] : data;
          setRecipients(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        console.error('Failed to fetch recipients:', err);
        setRecipients([]);
      }
    };

    loadRecipients();
  }, [form.target, form.group_id, form.department_id, form.member_type]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      title: form.title,
      message: form.message,
      type: form.type,
      scheduled_at: form.scheduled_at || null,
      recurrence: form.recurrence,
    };

    if (form.target === 'group') payload.group_id = form.group_id;
    if (form.target === 'department') payload.department_id = form.department_id;
    if (form.target === 'member_type') payload.member_type = form.member_type;
    if (form.target === 'all') payload.is_global = true;

    try {
      const res = await fetch(`${API_URL}/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        if (onSubmit) onSubmit();
      } else {
        throw new Error('Failed to create notification');
      }
    } catch (err) {
      console.error('Error creating notification:', err);
      alert('Failed to create notification');
    }
  };

  return (
    <Paper
      sx={{
        maxWidth: 700,
        mx: 'auto',
        p: 3,
        boxShadow: 3,
        borderRadius: 2,
        backgroundColor: theme.palette.background.paper,
        mb: 3,
      }}
    >
      <Typography variant="h5" gutterBottom align="center" color="primary">
        Create Notification
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Target</InputLabel>
              <Select
                name="target"
                value={form.target}
                onChange={handleChange}
                label="Target"
              >
                <MenuItem value="group">Cell Group</MenuItem>
                <MenuItem value="department">Department</MenuItem>
                <MenuItem value="member_type">Member Type</MenuItem>
                <MenuItem value="all">All Members</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {form.target === 'group' && (
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Cell Group</InputLabel>
                <Select
                  name="group_id"
                  value={form.group_id}
                  onChange={handleChange}
                  label="Cell Group"
                >
                  {groups.map((group) => (
                    <MenuItem key={group.id} value={group.id}>
                      {group.name || group.id}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          {form.target === 'department' && (
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  name="department_id"
                  value={form.department_id}
                  onChange={handleChange}
                  label="Department"
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          {form.target === 'member_type' && (
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Member Type</InputLabel>
                <Select
                  name="member_type"
                  value={form.member_type}
                  onChange={handleChange}
                  label="Member Type"
                >
                  <MenuItem value="first_timer">First Timers</MenuItem>
                  <MenuItem value="new_convert">New Converts</MenuItem>
                  <MenuItem value="member">Regular Members</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}

          <Grid item xs={12}>
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

          <Grid item xs={12}>
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

          <Grid item xs={12}>
            <Button type="submit" variant="contained" fullWidth>
              Send Notification
            </Button>
          </Grid>
        </Grid>
      </form>

      <Divider sx={{ my: 3 }} />

      <Typography variant="subtitle2" gutterBottom>
        Preview Recipients: {recipients.length}
      </Typography>
      <Box sx={{ maxHeight: 120, overflowY: 'auto', pl: 1 }}>
        {recipients.map((r) => (
          <Typography key={r.id} variant="body2">
            {r.first_name} {r.surname} ({r.email || 'no email'})
          </Typography>
        ))}
      </Box>
    </Paper>
  );
};

export default CreateNotificationForm;
