import React, { useState, useEffect, useCallback } from 'react';
import {
  Button, Container, Typography, Box, Card, CardContent,
  Dialog, DialogTitle, DialogContent, TextField, DialogActions, List, ListItem, ListItemText, Divider
} from '@mui/material';
import {
  fetchBadges, createBadge, updateBadge, deleteBadge
} from '../api/badgeService';
import { EditIcon, DeleteIcon } from '../components/common/ActionIcons';
import ConfirmDialog from '../components/common/ConfirmDialog';
import SnackbarAlert from '../components/common/SnackbarAlert';

export default function BadgeSettingsPage() {
  const [rows, setRows] = useState([]);
  const [edit, setEdit] = useState(null);
  const [open, setOpen] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirm, setConfirm] = useState({ open: false, id: null });

  // Load data
  const load = useCallback(() => {
    fetchBadges().then(setRows).catch(console.error);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Open dialog for either New or Edit
  const handleOpenEdit = (badge = null) => {
    if (badge) {
      setEdit({
        id:          badge.id,
        label:       badge.label,
        icon_name:   badge.icon_name,
        description: badge.description || ''
      });
    } else {
      setEdit({ id: null, label: '', icon_name: '', description: '' });
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
        await updateBadge(edit.id, {
          label:       edit.label,
          icon_name:   edit.icon_name,
          description: edit.description
        });
        setSnackbar({ open: true, message: 'Badge updated!', severity: 'success' });
      } else {
        await createBadge({
          label:       edit.label,
          icon_name:   edit.icon_name,
          description: edit.description
        });
        setSnackbar({ open: true, message: 'Badge created!', severity: 'success' });
      }
      handleClose();
      load();
    } catch (err) {
      setSnackbar({ open: true, message: 'Error saving badge', severity: 'error' });
    }
  };

  const handleDelete = (id) => {
    setConfirm({ open: true, id });
  };

  const confirmDelete = async () => {
    try {
      await deleteBadge(confirm.id);
      setSnackbar({ open: true, message: 'Badge deleted!', severity: 'success' });
      load();
    } catch (err) {
      setSnackbar({ open: true, message: 'Error deleting badge', severity: 'error' });
    } finally {
      setConfirm({ open: false, id: null });
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button variant="contained" onClick={() => handleOpenEdit(null)}>
          New Badge
        </Button>
      </Box>
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <List>
            {rows.length === 0 && (
              <Typography sx={{ p: 2 }}>No badges found.</Typography>
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
                        <Typography variant="subtitle1" sx={{ minWidth: 120 }}>{row.label}</Typography>
                        <Typography variant="body2" color="text.secondary">Icon: {row.icon_name}</Typography>
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

      {/* Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{edit?.id ? 'Edit' : 'New'} Badge</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Label"
            value={edit?.label || ''}
            onChange={e => setEdit(prev => ({ ...prev, label: e.target.value }))}
          />
          <TextField
            label="Icon Name"
            value={edit?.icon_name || ''}
            onChange={e => setEdit(prev => ({ ...prev, icon_name: e.target.value }))}
          />
          <TextField
            label="Description"
            value={edit?.description || ''}
            onChange={e => setEdit(prev => ({ ...prev, description: e.target.value }))}
            multiline rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* ConfirmDialog */}
      <ConfirmDialog
        open={confirm.open}
        title="Delete Badge"
        description="Are you sure you want to delete this badge?"
        onClose={() => setConfirm({ ...confirm, open: false })}
        onConfirm={confirmDelete}
      />

      {/* SnackbarAlert */}
      <SnackbarAlert
        open={snackbar.open}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Container>
  );
}
