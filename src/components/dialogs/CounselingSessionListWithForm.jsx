// src/components/dialogs/CounselingSessionListWithForm.jsx

import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, IconButton, Typography, Box, TextField, Grid, Autocomplete, Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { EditIcon, DeleteIcon } from '../common/ActionIcons'; // Corrected import
import { DataGrid } from '@mui/x-data-grid';
import {
  getCounselingSessions,
  createCounselingSession,
  updateCounselingSession,
  deleteCounselingSession
} from '../../api/counselingSessionService';
import { getMembers } from '../../api/memberService';
import ConfirmDialog from '../common/ConfirmDialog';
import SnackbarAlert from '../common/SnackbarAlert';

const modeOptions = ['in-person', 'online'];
const statusOptions = ['scheduled', 'completed', 'cancelled'];

const CounselingSessionListWithForm = ({ open, onClose, member }) => {
  const [sessions, setSessions] = useState([]);
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({
    session_date: '',
    mode: '',
    status: '',
    notes: '',
    counselor_id: ''
  });
  const [editSession, setEditSession] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, onConfirm: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (member) {
      fetchSessions();
      fetchMembers();
      resetForm();
    }
  }, [member]);

  useEffect(() => {
    if (editSession) {
      setForm({
        session_date: editSession.session_date?.slice(0, 16) || '',
        mode: editSession.mode || '',
        status: editSession.status || '',
        notes: editSession.notes || '',
        counselor_id: editSession.counselor_id || ''
      });
    }
  }, [editSession]);

  const fetchSessions = async () => {
    try {
      const all = await getCounselingSessions();
      setSessions(all.filter((s) => s.member_id === member.id));
    } catch {
      setSnackbar({ open: true, message: 'Failed to load counseling sessions.', severity: 'error' });
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await getMembers();
      setMembers(res);
    } catch {
      console.error('Failed to load members');
    }
  };

  const resetForm = () => {
    setForm({
      session_date: '',
      mode: '',
      status: '',
      notes: '',
      counselor_id: ''
    });
    setEditSession(null);
  };

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleAutocomplete = (field) => (_, val) =>
    setForm((prev) => ({ ...prev, [field]: val || '' }));

  const handleSubmit = async () => {
    const { session_date, mode, status, counselor_id } = form;

    if (!member?.id || !session_date || !mode || !status || !counselor_id) {
      setSnackbar({ open: true, message: 'All fields are required.', severity: 'error' });
      return;
    }

    try {
      if (editSession) {
        await updateCounselingSession(editSession.id, { ...form, member_id: member.id });
        showSnackbar('Session updated');
      } else {
        await createCounselingSession({ ...form, member_id: member.id });
        showSnackbar('Session added');
      }

      fetchSessions();
      resetForm();
    } catch {
      setSnackbar({ open: true, message: 'Error saving session.', severity: 'error' });
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleDelete = async (id) => {
    try {
      await deleteCounselingSession(id);
      showSnackbar('Session deleted');
      fetchSessions();
    } catch {
      showSnackbar('Delete failed', 'error');
    }
  };

  const openConfirmDialog = (id) => {
    setConfirmDialog({
      open: true,
      onConfirm: () => {
        handleDelete(id);
        setConfirmDialog({ open: false, onConfirm: null });
      },
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: '', severity: 'success' });
  };

  const getCounselorName = (id) => {
    const counselor = members.find((m) => m.id === id);
    return counselor ? `${counselor.first_name} ${counselor.surname}` : 'N/A';
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle>
          Counseling Sessions for {member?.first_name} {member?.surname}
          <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Box mb={2}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="session_date"
                  type="datetime-local"
                  label="Session Date"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  value={form.session_date}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={6}>
                <Autocomplete
                  options={modeOptions}
                  value={form.mode}
                  onChange={handleAutocomplete('mode')}
                  renderInput={(params) => <TextField {...params} label="Mode" />}
                />
              </Grid>
              <Grid item xs={6}>
                <Autocomplete
                  options={statusOptions}
                  value={form.status}
                  onChange={handleAutocomplete('status')}
                  renderInput={(params) => <TextField {...params} label="Status" />}
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  options={members}
                  getOptionLabel={(option) => `${option.first_name} ${option.surname}`}
                  value={members.find((m) => m.id === form.counselor_id) || null}
                  onChange={(_, selected) =>
                    setForm((prev) => ({ ...prev, counselor_id: selected?.id || '' }))
                  }
                  renderInput={(params) => <TextField {...params} label="Counselor" fullWidth />}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="notes"
                  label="Notes"
                  fullWidth
                  multiline
                  rows={2}
                  value={form.notes}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} display="flex" justifyContent="flex-end" gap={2}>
                {editSession && (
                  <Button onClick={() => resetForm()} color="secondary">
                    Cancel
                  </Button>
                )}
                <Button variant="contained" onClick={handleSubmit}>
                  {editSession ? 'Update Session' : 'Add Session'}
                </Button>
              </Grid>
            </Grid>
          </Box>

          <Typography variant="h6" gutterBottom>Previous Sessions</Typography>
          <DataGrid
            autoHeight
            rows={sessions}
            columns={[
              { field: 'session_date', headerName: 'Date', flex: 1 },
              { field: 'mode', headerName: 'Mode', flex: 1 },
              { field: 'status', headerName: 'Status', flex: 1 },
              {
                field: 'counselor_id',
                headerName: 'Counselor',
                flex: 1,
                renderCell: (params) => (
                  <>{getCounselorName(params.row?.counselor_id)}</>
                )
              },
              { field: 'notes', headerName: 'Notes', flex: 2 },
              {
                field: 'actions',
                headerName: 'Actions',
                flex: 1,
                sortable: false,
                renderCell: ({ row }) => (
                  <Box display="flex" gap={1}>
                    <IconButton onClick={() => setEditSession(row)} size="small" color="primary">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => openConfirmDialog(row.id)} size="small" color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )
              }
            ]}
            getRowId={(row) => row.id}
            pageSize={5}
          />
        </DialogContent>
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
};

export default CounselingSessionListWithForm;


