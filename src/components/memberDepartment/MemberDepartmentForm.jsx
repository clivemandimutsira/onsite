// src/components/memberDepartment/MemberDepartmentForm.jsx

import React, { useState } from 'react';
import {
  Box, Grid, TextField, Button, MenuItem
} from '@mui/material';

const MemberDepartmentForm = ({ memberId, departments, onClose, onSaved }) => {
  const [formData, setFormData] = useState({
    department_id: '',
    role: '',
    date_joined: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    await onSaved({ ...formData, member_id: memberId });
    onClose();
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            select
            label="Department"
            name="department_id"
            value={formData.department_id}
            onChange={handleChange}
            fullWidth
          >
            {departments.map((d) => (
              <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Date Joined"
            name="date_joined"
            type="date"
            value={formData.date_joined}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} display="flex" justifyContent="flex-end" gap={2}>
          <Button onClick={onClose} color="secondary">Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>Assign</Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MemberDepartmentForm;
