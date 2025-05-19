import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, Autocomplete, IconButton, Tooltip
} from '@mui/material';
import {
  createCounselingSession,
  updateCounselingSession,
  deleteCounselingSession,
} from '../../api/counselingService';
import { getMembers } from '../../api/memberService';
import { EditIcon, DeleteIcon } from '../../common/ActionIcons';
import ConfirmDialog from '../common/ConfirmDialog';
import SnackbarAlert from '../common/SnackbarAlert';

const MODE_OPTIONS = ['In-person', 'Online', 'Phone'];
const STATUS_OPTIONS = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

export default function CounselingForm({ open, onClose, initialData, onSaved }) {
  const isEdit = Boolean(initialData);
  const [form, setForm] = useState({
    date: '', time: '', counselor_name: '',
    member_id: null, mode: '', status: '', notes: ''
  });
  const [members, setMembers] = useState([]);
  const [counselors, setCounselors] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, onConfirm: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    let isMounted = true;
    getMembers()
      .then(ms => {
        if (!isMounted) return;
        const opts = ms.map(m => ({
          id: m.id,
          fullName: `${m.first_name} ${m.surname}`
        }));
        setMembers(opts);
        setCounselors(opts);
      })
      .catch(console.error);
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (initialData) {
      setForm({
        date: initialData.date || '',
        time: initialData.time || '',
        counselor_name: initialData.counselor_name || '',
        member_id: initialData.member_id || null,
        mode: initialData.mode || '',
        status: initialData.status || '',
        notes: initialData.notes || '',
      });
    } else {
      setForm({
        date: '', time: '', counselor_name: '',
        member_id: null, mode: '', status: '', notes: ''
      });
    }
  }, [initialData]);

  const handleSave = async () => {
    try {
      const payload = { ...form };
      if (isEdit) {
        await updateCounselingSession(initialData.id, payload);
        setSnackbar({ open: true, message: 'Session updated successfully!', severity: 'success' });
      } else {
        await createCounselingSession(payload);
        setSnackbar({ open: true, message: 'Session created successfully!', severity: 'success' });
      }
      onSaved();
      onClose();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to save session.', severity: 'error' });
      console.error(err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCounselingSession(initialData.id);
      setSnackbar({ open: true, message: 'Session deleted successfully!', severity: 'success' });
      onSaved();
      onClose();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete session.', severity: 'error' });
      console.error(err);
    }
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
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>
          {isEdit ? 'Edit Session' : 'New Session'}
          {isEdit && (
            <Tooltip title="Delete Session">
              <IconButton
                onClick={openConfirmDialog}
                sx={{ position: 'absolute', top: 8, right: 8 }}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
        </DialogTitle>
        <DialogContent>
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mt={1}>
            <TextField
              label="Date" type="date" value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Time" type="time" value={form.time}
              onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />

            <Autocomplete
              options={counselors}
              getOptionLabel={opt => opt.fullName}
              value={
                counselors.find(c => c.fullName === form.counselor_name) || null
              }
              onChange={(_, sel) => setForm(f => ({
                ...f,
                counselor_name: sel?.fullName || ''
              }))}
              renderInput={params => <TextField {...params} label="Counselor" />}
            />

            <Autocomplete
              options={members}
              getOptionLabel={opt => opt.fullName}
              value={
                members.find(m => m.id === form.member_id) || null
              }
              onChange={(_, sel) => setForm(f => ({
                ...f,
                member_id: sel?.id || null
              }))}
              renderInput={params => <TextField {...params} label="Member" />}
            />

            <Autocomplete
              options={MODE_OPTIONS}
              value={MODE_OPTIONS.includes(form.mode) ? form.mode : null}
              onChange={(_, v) => setForm(f => ({ ...f, mode: v || '' }))}
              renderInput={params => <TextField {...params} label="Mode" />}
            />

            <Autocomplete
              options={STATUS_OPTIONS}
              value={STATUS_OPTIONS.includes(form.status) ? form.status : null}
              onChange={(_, v) => setForm(f => ({ ...f, status: v || '' }))}
              renderInput={params => <TextField {...params} label="Status" />}
            />

            <TextField
              label="Notes" value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              multiline rows={3} fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title="Confirm Deletion"
        content="Are you sure you want to delete this session?"
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
}
