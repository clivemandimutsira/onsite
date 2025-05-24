// src/components/memberCellGroup/MemberCellGroupForm.jsx

import React, { useState,useEffect } from 'react';
import {
  Box,
  Button,
  Grid,
  TextField,
  MenuItem
} from '@mui/material';
import { createMembership } from '../../api/memberCellGroupService';
import { getDesignations } from '../../api/designationsService';

const MemberCellGroupForm = ({ memberId, cellGroups, onClose }) => {
  const [formData, setFormData] = useState({
    cell_group_id: '',
    designation: '',
    date_joined: '',
  });

  const [designations, setDesignations] = useState([]);

  useEffect(() => {
    getDesignations()
      .then(setDesignations)
      .catch(err => console.error('Failed to load designations', err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    await createMembership({ ...formData, member_id: memberId });
    onClose();
  };

  return (
    <Box component="form" sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            select
            fullWidth
            label="Select Cell Group"
            name="cell_group_id"
            value={formData.cell_group_id}
            onChange={handleChange}
          >
            {cellGroups.map((group) => (
              <MenuItem key={group.id} value={group.id}>
                {group.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12}>
                    <TextField
            label="Designation"
            name="designation"
            fullWidth
            select
            value={formData.designation}
            onChange={handleChange}
          >
            <MenuItem value="">None</MenuItem>
            {designations.map(d => (
              <MenuItem key={d.id} value={d.name}>
                {d.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        
        <Grid item xs={12}>
          <TextField
            type="date"
            label="Date Joined"
            name="date_joined"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={formData.date_joined}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button onClick={onClose} color="secondary">
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSubmit}>
              Assign
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MemberCellGroupForm;
