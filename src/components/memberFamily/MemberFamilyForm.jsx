// src/components/memberFamily/MemberFamilyForm.jsx

import React, { useState } from 'react';
import {
  Box,
  Button,
  Grid,
  TextField,
  MenuItem
} from '@mui/material';
import { createFamilyLink } from '../../api/memberFamilyService';

const MemberFamilyForm = ({ memberId, allMembers, onClose }) => {
  const [formData, setFormData] = useState({
    relative_id: '',
    relationship: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async () => {
    await createFamilyLink({ ...formData, member_id: memberId });
    onClose();
  };

  return (
    <Box component="form" sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            select
            label="Select Member"
            name="relative_id"
            fullWidth
            value={formData.relative_id}
            onChange={handleChange}
          >
            {allMembers
              .filter((m) => m.id !== memberId)
              .map((m) => (
                <MenuItem key={m.id} value={m.id}>
                  {m.first_name} {m.surname}
                </MenuItem>
              ))}
          </TextField>
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Relationship"
            name="relationship"
            fullWidth
            value={formData.relationship}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12}>
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button onClick={onClose} color="secondary">
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              Link Member
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MemberFamilyForm;
