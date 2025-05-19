// src/components/cellGroups/CellGroupForm.jsx

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box, Button, Grid, TextField, MenuItem
} from '@mui/material';

const CellGroupForm = ({ onSubmit, onClose, members, initialValues }) => {
  // Ensure safe initial values in case `initialValues` is null or undefined
  const safeInitialValues = initialValues ?? {};

  const [formData, setFormData] = useState({
    name: safeInitialValues.name || '',
    address: safeInitialValues.address || '',
    leader_id: safeInitialValues.leader_id || '',
  });

  // If initialValues changes (e.g., when editing a different group), update formData
  useEffect(() => {
    setFormData({
      name: safeInitialValues.name || '',
      address: safeInitialValues.address || '',
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
            label="Cell Group Name"
            name="name"
            fullWidth
            value={formData.name}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Address"
            name="address"
            fullWidth
            value={formData.address}
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
            {members.map((m) => (
              <MenuItem key={m.id} value={m.id}>
                {m.first_name} {m.surname}
              </MenuItem>
            ))}
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

CellGroupForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  members: PropTypes.array.isRequired,
  initialValues: PropTypes.object, // can be null or an object
};

export default CellGroupForm;
