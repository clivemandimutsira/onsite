import React, { useEffect, useState, useContext } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { EditIcon, DownloadIcon, CloseIcon } from '../../components/common/ActionIcons';
import { getMemberById, updateMember } from '../../api/memberService';
import MemberTabs from './MemberTabs';
import { AuthContext } from '../../contexts/AuthContext';
import SnackbarAlert from '../../components/common/SnackbarAlert';

const MemberUserProfile = ({ memberId }) => {
  const theme = useTheme();
  const { permissions } = useContext(AuthContext);

  const canEdit = permissions.includes('edit_members') || permissions.includes('manage_members');
  const canDownload = permissions.includes('view_members') || permissions.includes('manage_members');

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchMember = async () => {
      if (!memberId) return;

      try {
        const data = await getMemberById(memberId);
        setMember(data);
        setEditForm(data);
      } catch (error) {
        console.error('Failed to load member profile', error);
        setSnackbar({ open: true, message: 'Failed to load member profile.', severity: 'error' });
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
      setSnackbar({ open: true, message: 'Member updated successfully.', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to save member.', severity: 'error' });
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

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: '', severity: 'success' });
  };

  if (loading) return <Box textAlign="center"><CircularProgress /></Box>;
  if (!member) return <Typography>No member data found.</Typography>;

  const formattedJoinDate = member.date_joined_church
    ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(member.date_joined_church))
    : 'N/A';

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Profile Summary Card */}
      <Card elevation={3}>
        <CardHeader
          avatar={
            <Avatar
              src={member.profile_picture_url}
              alt={`${member.first_name} ${member.surname}`}
              sx={{ width: 64, height: 64 }}
            />
          }
          title={
            <Typography variant="h6">
              {member.first_name} {member.surname}
            </Typography>
          }
          subheader={member.email}
          action={
            <Stack direction="row" spacing={1}>
              {canEdit && (
                <IconButton onClick={() => setEditDialogOpen(true)} color="primary">
                  <EditIcon />
                </IconButton>
              )}
              {canDownload && (
                <IconButton onClick={handleDownload} color="secondary">
                  <DownloadIcon />
                </IconButton>
              )}
            </Stack>
          }
        />
        <CardContent>
          <Stack spacing={1}>
            <Chip
              label={member.status === 'active' ? 'Active' : 'Inactive'}
              color={member.status === 'active' ? 'success' : 'error'}
              size="small"
              sx={{ width: 'fit-content' }}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} mt={2}>
              <Stack spacing={1}>
                <Typography><strong>Gender:</strong> {member.gender || 'N/A'}</Typography>
                <Typography><strong>Phone:</strong> {member.contact_primary || 'N/A'}</Typography>
                <Typography><strong>Birth Date:</strong> {member.date_of_birth || 'N/A'}</Typography>
              </Stack>
              <Stack spacing={1}>
                <Typography><strong>Member Type:</strong> {member.member_type || 'N/A'}</Typography>
                <Typography><strong>Joined At:</strong> {formattedJoinDate}</Typography>
                <Typography><strong>Occupation:</strong> {member.occupation || 'N/A'}</Typography>
              </Stack>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Box mt={4}>
        <Card elevation={2}>
          <CardContent>
            <MemberTabs member={member} />
          </CardContent>
        </Card>
      </Box>

      {/* Edit Member Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          Edit Member
          <IconButton onClick={() => setEditDialogOpen(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="First Name" name="first_name" value={editForm.first_name || ''} onChange={handleEditChange} fullWidth />
          <TextField label="Surname" name="surname" value={editForm.surname || ''} onChange={handleEditChange} fullWidth />
          <TextField label="Email" name="email" value={editForm.email || ''} onChange={handleEditChange} fullWidth />
          <TextField label="Phone" name="phone" value={editForm.phone || ''} onChange={handleEditChange} fullWidth />
          <TextField label="Occupation" name="occupation" value={editForm.occupation || ''} onChange={handleEditChange} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEdit}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for feedback */}
      <SnackbarAlert
        open={snackbar.open}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Box>
  );
};

export default MemberUserProfile;
