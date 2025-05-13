import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Autocomplete from '@mui/material/Autocomplete';

import { getMembers } from '../../api/memberService';
import { getDesignations } from '../../api/designationsService';

import ConfirmDialog from '../common/ConfirmDialog';
import SnackbarAlert from '../common/SnackbarAlert';

const MemberFormDialog = ({ open, onClose, groupId, member, onSubmit }) => {
  const isEdit = Boolean(member);

  const [form, setForm] = useState({
    member_id: '',
    cell_group_id: groupId,
    designation: '',
    date_joined: ''
  });

  const [designations, setDesignations] = useState([]);
  const [members, setMembers] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const data = await getMembers();
        setMembers(data);
      } catch (err) {
        console.error('Failed to load members', err);
      }
    };
    fetchMembers();
  }, []);

  useEffect(() => {
    getDesignations()
      .then(setDesignations)
      .catch(err => console.error('Failed to load designations', err));
  }, []);

  useEffect(() => {
    if (isEdit && member) {
      setForm({
        member_id: member.member_id,
        cell_group_id: groupId,
        designation: member.designation || '',
        date_joined: member.date_joined?.substring(0, 10) || ''
      });
    } else {
      setForm({
        member_id: '',
        cell_group_id: groupId,
        designation: '',
        date_joined: ''
      });
    }
  }, [member, groupId, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    const data = isEdit ? { ...form, id: member.id } : form;
    onSubmit(data, isEdit);
    setSnackbar({
      open: true,
      message: isEdit ? 'Member updated successfully!' : 'Member added successfully!',
      severity: 'success'
    });
    onClose();
  };

  const handleDelete = () => {
    // Add delete logic or call a passed-in onDelete callback
    setConfirmOpen(false);
    setSnackbar({ open: true, message: 'Member deleted successfully.', severity: 'info' });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>
          {isEdit ? 'Edit Member Assignment' : 'Add Member to Cell Group'}
          <IconButton
            onClick={onClose}
            sx={{ position: 'absolute', top: 8, right: 8, width: 20, height: 20 }}
          >
            <CloseIcon sx={{ width: 20, height: 20 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Autocomplete
            freeSolo
            options={members}
            getOptionLabel={(option) =>
              typeof option === 'string'
                ? option
                : `${option.first_name} ${option.surname}`
            }
            value={
              typeof form.member_id === 'string'
                ? form.member_id
                : members.find((m) => m.id === form.member_id) || null
            }
            onChange={(e, value) => {
              if (typeof value === 'string') {
                setForm((prev) => ({ ...prev, member_id: value }));
              } else {
                setForm((prev) => ({ ...prev, member_id: value ? value.id : '' }));
              }
            }}
            disabled={isEdit}
            renderInput={(params) => (
              <TextField {...params} label="Select or Enter Member" fullWidth />
            )}
          />

          <TextField
            label="Designation"
            name="designation"
            value={form.designation}
            onChange={handleChange}
            fullWidth
            select
          >
            <MenuItem value="">None</MenuItem>
            {designations.map(d => (
              <MenuItem key={d.id} value={d.name}>
                {d.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Date Joined"
            type="date"
            name="date_joined"
            value={form.date_joined}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
          <div>
            {isEdit && (
              <IconButton color="error" onClick={() => setConfirmOpen(true)}>
                <DeleteIcon />
              </IconButton>
            )}
          </div>

          <div>
            <Button onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {isEdit ? 'Update' : 'Add'}
            </Button>
          </div>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Confirm Deletion"
        content="Are you sure you want to remove this member from the group?"
      />

      <SnackbarAlert
        open={snackbar.open}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </>
  );
};

export default MemberFormDialog;
