import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Stack, IconButton, Tooltip, Chip, List, ListItem, ListItemText, Divider, Avatar, Snackbar, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PaymentIcon from '@mui/icons-material/Payment';
import PersonIcon from '@mui/icons-material/Person';

import {
  fetchDonations,
  createDonation,
  updateDonation,
  deleteDonation,
  uploadDonationProof,
  startOnlinePayment
} from '../api/donationService';

export default function DonationPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const load = async () => {
    setLoading(true);
    try { setRows(await fetchDonations()); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleEdit = (row) => {
    setEditing(row);
    setOpen(true);
  };
  const handleAdd = () => {
    setEditing({ member_id:'', amount:'', donation_date:'', method:'Cash', status:'Pending' });
    setOpen(true);
  };
  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteDonation(toDelete);
      setSnackbar({ open: true, message: 'Donation deleted', severity: 'success' });
      load();
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setConfirmOpen(false);
      setToDelete(null);
    }
  };

  const handleSave = async () => {
    const fn = editing.id ? updateDonation : createDonation;
    try {
      await fn(editing.id, editing);
      setSnackbar({ open: true, message: editing.id ? 'Donation updated' : 'Donation created', severity: 'success' });
      setOpen(false);
      load();
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  const statusColor = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'pending': return 'warning';
      case 'completed': return 'success';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt:4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={600}>Donations</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          New Donation
        </Button>
      </Stack>
      <Box sx={{
        minHeight: 520,
        background: theme => theme.palette.background.paper,
        borderRadius: 2,
        boxShadow: 2,
        p: 2
      }}>
        <List>
          {loading && (
            <Typography sx={{ p: 2 }}>Loading...</Typography>
          )}
          {!loading && rows.length === 0 && (
            <Typography sx={{ p: 2 }}>No donations found.</Typography>
          )}
          {!loading && rows.map((row, idx) => (
            <React.Fragment key={row.id}>
              <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <PersonIcon />
                </Avatar>
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Typography fontWeight={600}>{row.first_name} {row.surname}</Typography>
                      <Chip label={row.method} size="small" sx={{ ml: 1 }} />
                      <Chip label={row.status} color={statusColor(row.status)} size="small" sx={{ ml: 1 }} />
                    </Stack>
                  }
                  secondary={
                    <Stack direction="row" spacing={3} mt={1}>
                      <Typography variant="body2" color="text.secondary">
                        Member ID: {row.member_id}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Amount: <b>₦{row.amount}</b>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Date: {new Date(row.donation_date).toLocaleDateString()}
                      </Typography>
                    </Stack>
                  }
                />
                <Stack direction="row" spacing={1} sx={{ ml: 2 }}>
                  <Tooltip title="Edit">
                    <IconButton size="small" color="primary" onClick={()=>handleEdit(row)}>
                      <EditOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        setToDelete(row.id);
                        setConfirmOpen(true);
                      }}
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </ListItem>
              {idx < rows.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
        </List>
      </Box>

      {/* Confirm Delete Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Delete Donation?</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this donation?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={open} onClose={()=>setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 600 }}>
          {editing?.id ? 'Edit' : 'New'} Donation
        </DialogTitle>
        <DialogContent sx={{ display:'grid', gap:2, mt:1 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Member ID"
              type="number"
              fullWidth
              value={editing?.member_id || ''}
              onChange={e=>setEditing(ev=>({ ...ev, member_id:+e.target.value }))}
            />
            <TextField
              label="Amount"
              type="number"
              fullWidth
              value={editing?.amount|| ''}
              onChange={e=>setEditing(ev=>({ ...ev, amount:+e.target.value }))}
              InputProps={{ startAdornment: <span style={{ marginRight: 4 }}>₦</span> }}
            />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Date"
              type="date"
              fullWidth
              value={editing?.donation_date||''}
              onChange={e=>setEditing(ev=>({ ...ev, donation_date:e.target.value }))}
              InputLabelProps={{ shrink:true }}
            />
            <TextField
              label="Method"
              select
              fullWidth
              SelectProps={{ native: true }}
              value={editing?.method||''}
              onChange={e=>setEditing(ev=>({ ...ev, method:e.target.value }))}
            >
              <option value="Cash">Cash</option>
              <option value="Transfer">Transfer</option>
              <option value="POS">POS</option>
              <option value="Online">Online</option>
            </TextField>
            <TextField
              label="Status"
              select
              fullWidth
              SelectProps={{ native: true }}
              value={editing?.status||''}
              onChange={e=>setEditing(ev=>({ ...ev, status:e.target.value }))}
            >
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Failed">Failed</option>
            </TextField>
          </Stack>
          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
            >
              Upload Receipt
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={async e => {
                  const file = e.target.files[0];
                  if (!file || !editing?.id) return;
                  const fd = new FormData();
                  fd.append('file', file);
                  try {
                    await uploadDonationProof(editing.id, fd);
                    setSnackbar({ open: true, message: 'Receipt uploaded', severity: 'success' });
                    load(); // refresh list
                  } catch (err) {
                    setSnackbar({ open: true, message: err.message, severity: 'error' });
                  }
                }}
              />
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<PaymentIcon />}
              onClick={async () => {
                if (!editing) return;
                try {
                  const { paymentUrl } = await startOnlinePayment(editing);
                  window.location.href = paymentUrl;
                } catch (err) {
                  setSnackbar({ open: true, message: err.message, severity: 'error' });
                }
              }}
            >
              Give Online
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {editing?.id?'Update':'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
