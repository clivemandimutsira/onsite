import React, { useEffect, useState, useContext } from 'react';
import {
  Box, Typography, Avatar, Grid, Chip, Divider, CircularProgress,
  IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';

import { getMemberById, updateMember } from '../../api/memberService';
import MemberTabs from './MemberTabs';
import { AuthContext } from '../../contexts/AuthContext';

const MemberUserProfile = ({ memberId }) => {
  const { permissions } = useContext(AuthContext);

  const canEdit = permissions.includes('edit_members') || permissions.includes('manage_members');
  const canDownload = permissions.includes('view_members') || permissions.includes('manage_members');

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    if (!memberId) {
      setLoading(false);
      return;
    }

    const fetchMember = async () => {
      try {
        const data = await getMemberById(memberId);
        setMember(data);
        setEditForm(data);
      } catch (error) {
        console.error('Failed to load member profile', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMember();
  }, [memberId]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async () => {
    try {
      await updateMember(member.id, editForm);
      setMember(editForm);
      setEditDialogOpen(false);
    } catch {
      alert('Failed to save');
    }
  };

  const handleDownload = () => {
    const data = `
      Name: ${member.first_name} ${member.surname}
      Email: ${member.email}
      Phone: ${member.phone}
      Status: ${member.status}
    `;
    const blob = new Blob([data], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `Member_${member.first_name}_${member.surname}.txt`;
    link.href = url;
    link.click();
  };

  if (loading) return <CircularProgress />;
  if (!memberId || !member) return <Typography>No member data found.</Typography>;

  const formattedJoinDate = member.date_joined_church
    ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(member.date_joined_church))
    : 'N/A';

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            src={member.profile_picture_url}
            alt={`${member.first_name} ${member.surname}`}
            sx={{ width: 80, height: 80, mr: 2 }}
          />
          <Box>
            <Typography variant="h5">{member.first_name} {member.surname}</Typography>
            <Typography color="text.secondary">{member.email}</Typography>
            <Chip
              label={member.status === 'active' ? 'Active' : 'Inactive'}
              color={member.status === 'active' ? 'success' : 'error'}
              size="small"
              sx={{ mt: 1 }}
            />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {canEdit && (
            <IconButton color="primary" onClick={() => setEditDialogOpen(true)}>
              <EditIcon />
            </IconButton>
          )}
          {canDownload && (
            <IconButton color="secondary" onClick={handleDownload}>
              <DownloadIcon />
            </IconButton>
          )}
        </Box>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography><strong>Gender:</strong> {member.gender || 'N/A'}</Typography>
          <Typography><strong>Phone:</strong> {member.contact_primary || 'N/A'}</Typography>
          <Typography><strong>Birth Date:</strong> {member.date_of_birth || 'N/A'}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography><strong>Member Type:</strong> {member.member_type || 'N/A'}</Typography>
          <Typography><strong>Joined At:</strong> {formattedJoinDate}</Typography>
          <Typography><strong>Occupation:</strong> {member.occupation || 'N/A'}</Typography>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      <MemberTabs member={member} />

      {/* Edit Member Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          Edit Member
          <IconButton onClick={() => setEditDialogOpen(false)} sx={{ position: 'absolute', top: 8, right: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField name="first_name" label="First Name" value={editForm.first_name || ''} onChange={handleEditChange} fullWidth />
          <TextField name="surname" label="Surname" value={editForm.surname || ''} onChange={handleEditChange} fullWidth />
          <TextField name="email" label="Email" value={editForm.email || ''} onChange={handleEditChange} fullWidth />
          <TextField name="phone" label="Phone" value={editForm.phone || ''} onChange={handleEditChange} fullWidth />
          <TextField name="occupation" label="Occupation" value={editForm.occupation || ''} onChange={handleEditChange} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEdit}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MemberUserProfile;
