import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Button, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, Snackbar, Alert
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add, Edit, Delete, Close } from '@mui/icons-material';

import {
  getPrayerRequests,
  createPrayerRequest,
  updatePrayerRequest,
  deletePrayerRequest
} from '../api/prayerRequestService';

import { getMembers } from '../api/memberService';
import MemberAutoComplete from '../components/common/MemberAutoComplete';

const PrayerRequestList = () => {
  const [requests, setRequests] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openDialog, setOpenDialog] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState({ member_id: '', request: '', status: 'pending' });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchRequests();
    fetchMembers();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await getPrayerRequests();
      setRequests(data);
    } catch {
      showSnackbar('Failed to fetch prayer requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const data = await getMembers();
      setMembers(data);
    } catch {
      showSnackbar('Failed to fetch members', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpen = (row = null) => {
    if (row) {
      setForm({ member_id: row.member_id, request: row.request, status: row.status });
      setEditData(row);
    } else {
      setForm({ member_id: '', request: '', status: 'pending' });
      setEditData(null);
    }
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setEditData(null);
  };

  const handleSubmit = async () => {
    try {
      if (!form.member_id || !form.request) {
        showSnackbar('Please fill in all required fields', 'error');
        return;
      }

      if (editData) {
        await updatePrayerRequest(editData.id, form);
        showSnackbar('Prayer request updated');
      } else {
        await createPrayerRequest(form);
        showSnackbar('Prayer request created');
      }
      fetchRequests();
      handleClose();
    } catch {
      showSnackbar('Save failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this request?')) return;
    try {
      await deletePrayerRequest(id);
      showSnackbar('Deleted');
      fetchRequests();
    } catch {
      showSnackbar('Delete failed', 'error');
    }
  };

  // Mapping requests to include member names dynamically
  const rows = requests.map((request) => {
    const member = members.find((m) => m.id === request.member_id);
    return {
      ...request,
      member_name: member ? `${member.first_name} ${member.surname}` : 'Unknown'
    };
  });

  const columns = [
    { field: 'member_name', headerName: 'Member', flex: 1.5 },
    { field: 'request', headerName: 'Request', flex: 2 },
    { field: 'status', headerName: 'Status', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      renderCell: ({ row }) => (
        <>
          <IconButton onClick={() => handleOpen(row)}><Edit /></IconButton>
          <IconButton color="error" onClick={() => handleDelete(row.id)}><Delete /></IconButton>
        </>
      )
    }
  ];

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          New Request
        </Button>
      </Box>

      <Box sx={{ overflowX: 'auto' }}>
        {/* Only render DataGrid when both requests and members are fetched */}
        <DataGrid
          autoHeight
          rows={rows} // Use rows with mapped member_name
          columns={columns}
          getRowId={(row) => row.id}
          loading={loading || !members.length}  // Ensure members are loaded before showing data
          pageSize={5}
        />
      </Box>

      <Dialog open={openDialog} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>
          {editData ? 'Edit Prayer Request' : 'New Prayer Request'}
          <IconButton onClick={handleClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <MemberAutoComplete
            value={form.member_id}
            onChange={(val) => setForm({ ...form, member_id: val })}
          />
          <TextField
            label="Request"
            value={form.request}
            onChange={(e) => setForm({ ...form, request: e.target.value })}
            fullWidth
            multiline
            minRows={3}
          />
          <TextField
            select
            label="Status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            SelectProps={{ native: true }}
            fullWidth
          >
            <option value="pending">Pending</option>
            <option value="answered">Answered</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">Save</Button>
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
    </Box>
  );
};

export default PrayerRequestList;
