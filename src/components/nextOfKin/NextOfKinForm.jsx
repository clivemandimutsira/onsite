// src/components/nextOfKin/NextOfKinForm.jsx

import React, { useState } from 'react';
import { Box, Button, Grid, TextField } from '@mui/material';
import {
  createNextOfKin,
  updateNextOfKin
} from '../../api/nextOfKinService';

const NextOfKinForm = ({ memberId, initialData = null, onClose }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    contact: initialData?.contact || '',
    relationship: initialData?.relationship || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const payload = { ...formData, member_id: memberId };

    if (initialData) {
      await updateNextOfKin(initialData.id, payload);
    } else {
      await createNextOfKin(payload);
    }

    onClose();
  };

  return (
    <Box component="form" sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Name"
            fullWidth
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Contact"
            fullWidth
            name="contact"
            value={formData.contact}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Relationship"
            fullWidth
            name="relationship"
            value={formData.relationship}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button onClick={onClose} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              {initialData ? 'Update' : 'Add'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default NextOfKinForm;
