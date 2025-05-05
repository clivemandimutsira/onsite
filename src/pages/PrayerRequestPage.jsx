import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Box, Button, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, Snackbar, Alert
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Plus, Trash, Edit } from 'lucide-react';
import CloseIcon from '@mui/icons-material/Close';
import MemberAutoComplete from '../components/common/MemberAutoComplete'; // adjust path if needed

import {
  getPrayerRequests,
  createPrayerRequest,
  updatePrayerRequest,
  deletePrayerRequest
} from '../api/prayerRequestService';

const PrayerRequestPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState({ member_id: '', request: '', status: 'pending' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await getPrayerRequests();
      setRequests(data);
    } catch {
      showSnackbar('Failed to load requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpen = (row = null) => {
    if (row) {
      setEditData(row);
      setForm({ member_id: row.member_id, request: row.request, status: row.status });
    } else {
      setEditData(null);
      setForm({ member_id: '', request: '', status: 'pending' });
    }
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    try {
      if (editData) {
        await updatePrayerRequest(editData.id, form);
        showSnackbar('Updated successfully');
      } else {
        await createPrayerRequest(form);
        showSnackbar('Created successfully');
      }
      setOpenDialog(false);
      fetchRequests();
    } catch {
      showSnackbar('Save failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this request?')) return;
    try {
      await deletePrayerRequest(id);
      showSnackbar('Deleted successfully');
      fetchRequests();
    } catch {
      showSnackbar('Delete failed', 'error');
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'member_id', headerName: 'Member ID', flex: 1 },
    { field: 'request', headerName: 'Request', flex: 2 },
    { field: 'status', headerName: 'Status', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      renderCell: ({ row }) => (
        <>
          <IconButton onClick={() => handleOpen(row)}><Edit size={18} /></IconButton>
          <IconButton onClick={() => handleDelete(row.id)} color="error"><Trash size={18} /></IconButton>
        </>
      ),
    },
  ];

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Prayer Requests</Typography>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" startIcon={<Plus />} onClick={() => handleOpen()}>
          New Request
        </Button>
      </Box>

      <DataGrid
        autoHeight
        rows={requests}
        columns={columns}
        pageSize={10}
        getRowId={(row) => row.id}
        loading={loading}
      />

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {editData ? 'Edit Request' : 'New Request'}
          <IconButton onClick={() => setOpenDialog(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <MemberAutoComplete
            value={form.member_id}
            onChange={(val) => setForm({ ...form, member_id: val })}
          />
          <TextField
            label="Request"
            multiline
            minRows={3}
            value={form.request}
            onChange={(e) => setForm({ ...form, request: e.target.value })}
            fullWidth
          />
          <TextField
            select
            label="Status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            fullWidth
          >
            <option value="pending">Pending</option>
            <option value="answered">Answered</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default PrayerRequestPage;
