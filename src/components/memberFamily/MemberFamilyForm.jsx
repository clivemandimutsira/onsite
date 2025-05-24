import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Grid,
  TextField,
  MenuItem,
  CircularProgress,
  Typography
} from '@mui/material';
import {
  createFamilyLink,
  updateFamilyLink
} from '../../api/memberFamilyService';

const MemberFamilyForm = ({ memberId, allMembers, onClose, existingLink }) => {
  const [formData, setFormData] = useState({
    relative_id: '',
    relationship: ''
  });
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    if (existingLink) {
      setFormData({
        relative_id: existingLink.relative_id,
        relationship: existingLink.relationship
      });
    }

    // Check if allMembers has data
    if (allMembers && allMembers.length > 0) {
      setLoading(false);
    }
  }, [existingLink, allMembers]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async () => {
    if (existingLink) {
      await updateFamilyLink(existingLink.id, formData);
    } else {
      await createFamilyLink({ ...formData, member_id: memberId });
    }
    onClose();
  };

  // If data is still loading, show a loading spinner
  if (loading) {
    return <CircularProgress />;
  }

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
            disabled={!!existingLink} // Prevent changing member if it's an edit
          >
            {allMembers
              .filter((m) => m.id !== memberId)  // Exclude the current member
              .map((m) => {
                const memberName = `${m.first_name || 'Unknown'} ${m.surname || 'Unknown'}`;
                return (
                  <MenuItem key={m.id} value={m.id}>
                    {memberName}
                  </MenuItem>
                );
              })}
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
              {existingLink ? 'Update Link' : 'Link Member'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MemberFamilyForm;
