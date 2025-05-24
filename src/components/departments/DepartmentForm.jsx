// src/components/departments/DepartmentForm.jsx

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box, Button, Grid, TextField, MenuItem
} from '@mui/material';

const DepartmentForm = ({ onSubmit, onClose, members, initialValues }) => {
  // Fallback if initialValues is null or undefined
  const safeInitialValues = initialValues ?? {};

  const [formData, setFormData] = useState({
    name: safeInitialValues.name || '',
    description: safeInitialValues.description || '',
    leader_id: safeInitialValues.leader_id || '',
  });

  // Update form data if editing a different department
  useEffect(() => {
    setFormData({
      name: safeInitialValues.name || '',
      description: safeInitialValues.description || '',
      leader_id: safeInitialValues.leader_id || '',
    });
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <Box component="form" sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Department Name"
            name="name"
            fullWidth
            value={formData.name}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Description"
            name="description"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            select
            label="Leader"
            name="leader_id"
            fullWidth
            value={formData.leader_id}
            onChange={handleChange}
          >
            {members.length === 0 ? (
              <MenuItem disabled>No members found</MenuItem>
            ) : (
              members.map((m) => (
                <MenuItem key={m.id} value={m.id}>
                  {m.first_name} {m.surname}
                </MenuItem>
              ))
            )}
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button onClick={onClose} color="secondary">Cancel</Button>
            <Button variant="contained" onClick={handleSubmit}>
              {safeInitialValues.id ? 'Update' : 'Create'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

DepartmentForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  members: PropTypes.array.isRequired,
  initialValues: PropTypes.object, // can be null or object
};

export default DepartmentForm;
