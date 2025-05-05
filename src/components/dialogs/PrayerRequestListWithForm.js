import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, IconButton, Snackbar, Alert,
  Typography, Box, Autocomplete, Grid, TextField
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataGrid } from '@mui/x-data-grid';
import {
  getPrayerRequests,
  createPrayerRequest,
  updatePrayerRequest,
  deletePrayerRequest
} from '../../api/prayerRequestService';
import Button from '@mui/material/Button';

const statusOptions = ['pending', 'answered'];

const PrayerRequestListWithForm = ({ open, onClose, member }) => {
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState({ request: '', status: 'pending' });
  const [editMode, setEditMode] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (member) {
      fetchRequests();
      resetForm();
    }
  }, [member]);

  const fetchRequests = async () => {
    try {
      const all = await getPrayerRequests();
      setRequests(all.filter((r) => r.member_id === member.id));
    } catch {
      setSnackbar({ open: true, message: 'Failed to load prayer requests.', severity: 'error' });
    }
  };

  const resetForm = () => {
    setForm({ request: '', status: 'pending' });
    setEditMode(false);
    setSelectedRequestId(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (_, newValue) => {
    setForm((prev) => ({ ...prev, status: newValue || '' }));
  };

  const handleSubmit = async () => {
    if (!form.request || !form.status) {
      setSnackbar({ open: true, message: 'Please fill all fields.', severity: 'error' });
      return;
    }

    try {
      if (editMode && selectedRequestId) {
        await updatePrayerRequest(selectedRequestId, form);
        setSnackbar({ open: true, message: 'Prayer request updated.', severity: 'success' });
      } else {
        await createPrayerRequest({ ...form, member_id: member.id });
        setSnackbar({ open: true, message: 'Prayer request added.', severity: 'success' });
      }

      resetForm();
      fetchRequests();
    } catch {
      setSnackbar({ open: true, message: 'Error saving request.', severity: 'error' });
    }
  };

  const handleEdit = (request) => {
    setForm({ request: request.request, status: request.status });
    setSelectedRequestId(request.id);
    setEditMode(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this prayer request?')) {
      try {
        await deletePrayerRequest(id);
        setSnackbar({ open: true, message: 'Prayer request deleted.', severity: 'success' });
        fetchRequests();
      } catch {
        setSnackbar({ open: true, message: 'Error deleting request.', severity: 'error' });
      }
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle>
          Prayer Requests for {member?.first_name} {member?.surname}
          <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ mt: 1 }}>
          <Box mb={2}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Prayer Request"
                  name="request"
                  value={form.request}
                  onChange={handleFormChange}
                  fullWidth
                  multiline
                  rows={3}
                />
              </Grid>

              <Grid item xs={12}>
                <Autocomplete
                  freeSolo
                  options={statusOptions}
                  value={form.status}
                  onInputChange={handleStatusChange}
                  renderInput={(params) => (
                    <TextField {...params} label="Status" fullWidth />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" justifyContent="flex-end" gap={2}>
                  {editMode && (
                    <Button onClick={resetForm} color="secondary">Cancel</Button>
                  )}
                  <Button onClick={handleSubmit} variant="contained" color="primary">
                    {editMode ? 'Update Request' : 'Add Request'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="h6">Previous Requests</Typography>
            <Autocomplete
              options={['all', ...statusOptions]}
              value={filterStatus}
              onInputChange={(_, value) => setFilterStatus(value || 'all')}
              sx={{ width: 200 }}
              renderInput={(params) => <TextField {...params} label="Filter by Status" />}
            />
          </Box>

          {requests.length === 0 ? (
            <Typography>No prayer requests found.</Typography>
          ) : (
            <DataGrid
              autoHeight
              rows={[...requests]
                .filter(r => filterStatus === 'all' || r.status === filterStatus)
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              }
              columns={[
                { field: 'request', headerName: 'Request', flex: 2 },
                { field: 'status', headerName: 'Status', flex: 1 },
                {
                  field: 'created_at',
                  headerName: 'Date',
                  flex: 1,
                  renderCell: (params) => {
                    const date = new Date(params.value);
                    return (
                      <Typography title={date.toLocaleString()}>
                        {date.toLocaleDateString()}
                      </Typography>
                    );
                  }
                },
                {
                  field: 'actions',
                  headerName: 'Actions',
                  flex: 0.7,
                  sortable: false,
                  renderCell: (params) => (
                    <Box display="flex" gap={1}>
                      <IconButton onClick={() => handleEdit(params.row)} size="small" color="primary">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(params.row.id)} size="small" color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )
                }
              ]}
              getRowId={(row) => row.id}
              pageSize={5}
            />
          )}
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </>
  );
};

export default PrayerRequestListWithForm;
