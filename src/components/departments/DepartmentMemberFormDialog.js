import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, IconButton, MenuItem, Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { getMembers } from '../../api/memberService';
import { EditIcon, DeleteIcon } from '../common/ActionIcons';
import ConfirmDialog from '../common/ConfirmDialog';
import SnackbarAlert from '../common/SnackbarAlert';

const DepartmentMemberFormDialog = ({ open, onClose, departmentId, member, onSubmit, onDelete }) => {
  const [form, setForm] = useState({
    member_id: '',
    designation: '',
    date_joined: '',
  });
  const [members, setMembers] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, onConfirm: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    getMembers().then(setMembers).catch((err) => {
      console.error('Failed to fetch members:', err);
      setSnackbar({ open: true, message: 'Failed to load members.', severity: 'error' });
    });
  }, []);

  useEffect(() => {
    if (member) {
      setForm({
        member_id: member.member_id,
        designation: member.designation || '',
        date_joined: member.date_joined ? member.date_joined.split('T')[0] : '',
        id: member.membership_id,
      });
    } else {
      setForm({
        member_id: '',
        designation: '',
        date_joined: '',
      });
    }
  }, [member]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!form.member_id || !form.date_joined) {
      return alert('Please fill all required fields.');
    }
    const data = {
      ...form,
      department_id: departmentId,
    };
    onSubmit(data, !!member);
    setSnackbar({ open: true, message: member ? 'Member updated successfully!' : 'Member added successfully!', severity: 'success' });
    onClose();
  };

  const handleDelete = () => {
    onDelete(member.id);
    setSnackbar({ open: true, message: 'Member removed successfully!', severity: 'success' });
    onClose();
  };

  const openConfirmDialog = () => {
    setConfirmDialog({
      open: true,
      onConfirm: () => {
        handleDelete();
        setConfirmDialog({ open: false, onConfirm: null });
      },
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: '', severity: 'success' });
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>
          {member ? 'Edit Member Assignment' : 'Add Member to Department'}
          <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
          {member && (
            <Tooltip title="Remove Member">
              <IconButton
                onClick={openConfirmDialog}
                sx={{ position: 'absolute', right: 48, top: 8 }}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            select
            fullWidth
            label="Select Member"
            name="member_id"
            value={form.member_id}
            onChange={handleChange}
            margin="normal"
            disabled={!!member}
          >
            {members.map((m) => (
              <MenuItem key={m.id} value={m.id}>
                {m.first_name} {m.surname}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            label="Designation (optional)"
            name="designation"
            value={form.designation}
            onChange={handleChange}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Date Joined"
            type="date"
            name="date_joined"
            value={form.date_joined}
            onChange={handleChange}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {member ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title="Confirm Removal"
        content="Are you sure you want to remove this member from the department?"
        onClose={() => setConfirmDialog({ open: false, onConfirm: null })}
        onConfirm={confirmDialog.onConfirm}
      />

      {/* Snackbar */}
      <SnackbarAlert
        open={snackbar.open}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </>
  );
};

export default DepartmentMemberFormDialog;
