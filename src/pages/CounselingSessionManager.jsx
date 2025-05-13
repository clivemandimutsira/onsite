import React, { useState, useEffect } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, TextField, Typography, Autocomplete
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { EditIcon, DeleteIcon } from '../components/common/ActionIcons';
import ConfirmDialog from '../components/common/ConfirmDialog';
import SnackbarAlert from '../components/common/SnackbarAlert';

import {
  getAllCounselingSessions,
  createCounselingSession,
  updateCounselingSession,
  deleteCounselingSession,
} from '../api/counselingService';
import { getMembers } from '../api/memberService';

const modes = ['Online', 'In-person'];
const statuses = ['Pending', 'Completed', 'Cancelled'];

const CounselingSessionManager = () => {
  const [sessions, setSessions] = useState([]);
  const [members, setMembers] = useState([]);
  const [counselors, setCounselors] = useState([]);
  const [form, setForm] = useState({
    date: '',
    time: '',
    counselor_id: '',
    mode: '',
    status: '',
    notes: '',
    member_id: '',
  });
  const [editId, setEditId] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });

  const fetchSessions = async () => {
    try {
      const res = await getAllCounselingSessions();
      setSessions(res);
    } catch (err) {
      showSnackbar('Failed to load sessions', 'error');
    }
  };

  useEffect(() => {
    fetchSessions();
    getMembers()
      .then((data) => {
        setMembers(data);
        setCounselors(data); // Assume same table
      })
      .catch(console.error);
  }, []);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleFormChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleOpenDialog = (session = null) => {
    if (session) {
      setForm({
        date: session.date,
        time: session.time,
        counselor_id: session.counselor_id || '',
        mode: session.mode,
        status: session.status,
        notes: session.notes,
        member_id: session.member_id || '',
      });
      setEditId(session.id);
    } else {
      setForm({
        date: '',
        time: '',
        counselor_id: '',
        mode: '',
        status: '',
        notes: '',
        member_id: '',
      });
      setEditId(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditId(null);
  };

  const handleSubmit = async () => {
    if (!form.member_id || !form.counselor_id) {
      showSnackbar('Please select both a member and a counselor', 'error');
      return;
    }

    const payload = { ...form };

    try {
      if (editId) {
        await updateCounselingSession(editId, payload);
        showSnackbar('Session updated');
      } else {
        await createCounselingSession(payload);
        showSnackbar('Session created');
      }
      fetchSessions();
      handleCloseDialog();
    } catch {
      showSnackbar('Error saving session', 'error');
    }
  };

  const handleDelete = (id) => {
    setConfirmDialog({ open: true, id });
  };

  const confirmDeletion = async () => {
    try {
      await deleteCounselingSession(confirmDialog.id);
      showSnackbar('Session deleted');
      fetchSessions();
    } catch {
      showSnackbar('Delete failed', 'error');
    } finally {
      setConfirmDialog({ open: false, id: null });
    }
  };

  const columns = [
    { field: 'date', headerName: 'Date', flex: 1 },
    { field: 'time', headerName: 'Time', flex: 1 },
    { field: 'counselor_name', headerName: 'Counselor', flex: 1 },
    { field: 'member_name', headerName: 'Member', flex: 1 },
    { field: 'mode', headerName: 'Mode', flex: 1 },
    { field: 'status', headerName: 'Status', flex: 1 },
    { field: 'notes', headerName: 'Notes', flex: 2 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <>
          <EditIcon onClick={() => handleOpenDialog(params.row)} />
          <DeleteIcon onClick={() => handleDelete(params.row.id)} />
        </>
      ),
    },
  ];

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Counseling Sessions</Typography>
        <Button variant="contained" onClick={() => handleOpenDialog()}>
          Add Session
        </Button>
      </Box>

      <DataGrid
        autoHeight
        rows={sessions}
        columns={columns}
        getRowId={(row) => row.id}
        pageSize={5}
      />

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {editId ? 'Edit Session' : 'Add Session'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            name="date"
            label="Date"
            type="date"
            value={form.date}
            onChange={handleFormChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            name="time"
            label="Time"
            type="time"
            value={form.time}
            onChange={handleFormChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <Autocomplete
            value={counselors.find((c) => c.id === form.counselor_id) || null}
            onChange={(e, newValue) =>
              setForm({ ...form, counselor_id: newValue ? newValue.id : '' })
            }
            getOptionLabel={(option) =>
              typeof option === 'string'
                ? option
                : `${option.first_name} ${option.surname}`
            }
            options={counselors}
            renderInput={(params) => <TextField {...params} label="Counselor" fullWidth />}
            isOptionEqualToValue={(option, value) => option.id === value.id}
          />
          <Autocomplete
            value={members.find((m) => m.id === form.member_id) || null}
            onChange={(e, newValue) =>
              setForm({ ...form, member_id: newValue ? newValue.id : '' })
            }
            getOptionLabel={(option) =>
              typeof option === 'string'
                ? option
                : `${option.first_name} ${option.surname}`
            }
            options={members}
            renderInput={(params) => <TextField {...params} label="Member" fullWidth />}
            isOptionEqualToValue={(option, value) => option.id === value.id}
          />
          <Autocomplete
            freeSolo
            value={form.mode}
            onInputChange={(e, newValue) => setForm({ ...form, mode: newValue })}
            options={modes}
            renderInput={(params) => <TextField {...params} label="Mode" fullWidth />}
          />
          <Autocomplete
            freeSolo
            value={form.status}
            onInputChange={(e, newValue) => setForm({ ...form, status: newValue })}
            options={statuses}
            renderInput={(params) => <TextField {...params} label="Status" fullWidth />}
          />
          <TextField
            name="notes"
            label="Notes"
            multiline
            rows={3}
            value={form.notes}
            onChange={handleFormChange}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>{editId ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        onConfirm={confirmDeletion}
        title="Confirm Deletion"
        description="Are you sure you want to delete this session?"
      />

      <SnackbarAlert
        open={snackbar.open}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        severity={snackbar.severity}
        message={snackbar.message}
      />
    </Box>
  );
};

export default CounselingSessionManager;
