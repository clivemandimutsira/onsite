import React, { useState, useEffect, useCallback } from 'react';
import {
  Button, Container, Typography, Box, Card, CardContent,
  Dialog, DialogTitle, DialogContent, TextField, DialogActions, List, ListItem, ListItemText, Divider
} from '@mui/material';
import {
  fetchPledges, createPledge, updatePledge, deletePledge
} from '../api/pledgeService';
import Autocomplete from '@mui/material/Autocomplete';
import { EditIcon, DeleteIcon } from '../components/common/ActionIcons';
import ConfirmDialog from '../components/common/ConfirmDialog';
import SnackbarAlert from '../components/common/SnackbarAlert';
import { getAllMembers } from '../api/memberService';

export default function PledgeSettingsPage() {
  const [rows, setRows] = useState([]);
  const [edit, setEdit] = useState(null);
  const [open, setOpen] = useState(false);

  // Snackbar and confirm dialog state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirm, setConfirm] = useState({ open: false, id: null });

  // Members for mapping member_id to full name
  const [members, setMembers] = useState([]);

  const load = useCallback(() => {
    fetchPledges().then(data => setRows(data)).catch(console.error);
  }, []);

  useEffect(() => {
    load();
    getAllMembers().then(setMembers).catch(console.error);
  }, [load]);

  // Helper to get member full name
  const getMemberName = (id) => {
    if (!id || !Array.isArray(members)) return '';
    const m = members.find(m => String(m.id) === String(id));
    return m
      ? `${m.first_name || m.firstname || ''} ${m.surname || m.last_name || ''}`.trim()
      : '';
  };

  const handleOpenEdit = (pledge = null) => {
    if (pledge) {
      setEdit({
        id:          pledge.id,
        member_id:   pledge.member_id,
        amount:      pledge.amount,
        fulfilled:   pledge.fulfilled,
        description: pledge.description || ''
      });
    } else {
      setEdit({ id: null, member_id: '', amount: '', fulfilled: 0, description: '' });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEdit(null);
  };

  const handleSave = async () => {
    try {
      if (edit.id) {
        await updatePledge(edit.id, {
          member_id:   edit.member_id,
          amount:      edit.amount,
          fulfilled:   edit.fulfilled,
          description: edit.description
        });
        setSnackbar({ open: true, message: 'Pledge updated!', severity: 'success' });
      } else {
        await createPledge({
          member_id:   edit.member_id,
          amount:      edit.amount,
          description: edit.description
        });
        setSnackbar({ open: true, message: 'Pledge created!', severity: 'success' });
      }
      handleClose();
      load();
    } catch (err) {
      setSnackbar({ open: true, message: 'Error saving pledge', severity: 'error' });
    }
  };

  // Delete with confirmation
  const handleDelete = (id) => {
    setConfirm({ open: true, id });
  };

  const confirmDelete = async () => {
    try {
      await deletePledge(confirm.id);
      setSnackbar({ open: true, message: 'Pledge deleted!', severity: 'success' });
      load();
    } catch (err) {
      setSnackbar({ open: true, message: 'Error deleting pledge', severity: 'error' });
    } finally {
      setConfirm({ open: false, id: null });
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button variant="contained" onClick={() => handleOpenEdit(null)}>
          New Pledge
        </Button>
      </Box>
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <List>
            {rows.length === 0 && (
              <Typography sx={{ p: 2 }}>No pledges found.</Typography>
            )}
            {rows.map((row, idx) => (
              <React.Fragment key={row.id}>
                <ListItem
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    justifyContent: 'space-between',
                    gap: 2,
                  }}
                  secondaryAction={
                    <Box>
                      <EditIcon onClick={() => handleOpenEdit(row)} sx={{ cursor: 'pointer', mr: 1 }} />
                      <DeleteIcon color="error" onClick={() => handleDelete(row.id)} sx={{ cursor: 'pointer' }} />
                    </Box>
                  }
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        <Typography variant="subtitle1" sx={{ minWidth: 120 }}>{getMemberName(row.member_id)}</Typography>
                        <Typography variant="body2" color="text.secondary">Goal: {row.amount}</Typography>
                        <Typography variant="body2" color="text.secondary">Fulfilled: {row.fulfilled}</Typography>
                        <Typography variant="body2" color="text.secondary">{row.description}</Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {idx < rows.length - 1 && <Divider variant="fullWidth" />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{edit?.id ? 'Edit' : 'New'} Pledge</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Autocomplete
            options={members}
            getOptionLabel={(option) =>
              option && option.first_name && option.surname
                ? `${option.first_name} ${option.surname}`
                : ''
            }
            value={members.find(m => String(m.id) === String(edit?.member_id)) || null}
            onChange={(_, value) =>
              setEdit(prev => ({
                ...prev,
                member_id: value ? value.id : ''
              }))
            }
            renderInput={(params) => (
              <TextField {...params} label="Member" fullWidth />
            )}
          />
          <TextField
            label="Goal Amount"
            value={edit?.amount || ''}
            onChange={e => setEdit(prev => ({ ...prev, amount: Number(e.target.value) }))}
            type="number"
          />
          <TextField
            label="Fulfilled"
            value={edit?.fulfilled || 0}
            onChange={e => setEdit(prev => ({ ...prev, fulfilled: Number(e.target.value) }))}
            type="number"
          />
          <TextField
            label="Description"
            value={edit?.description || ''}
            onChange={e => setEdit(prev => ({ ...prev, description: e.target.value }))}
            multiline rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirm.open}
        title="Delete Pledge"
        description="Are you sure you want to delete this pledge?"
        onClose={() => setConfirm({ ...confirm, open: false })}
        onConfirm={confirmDelete}
      />

      <SnackbarAlert
        open={snackbar.open}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Container>
  );
}
