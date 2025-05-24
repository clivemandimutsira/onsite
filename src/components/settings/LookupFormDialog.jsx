import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button
} from '@mui/material';
import SnackbarAlert from '../common/SnackbarAlert';

export default function LookupFormDialog({
  open, initialValues, onClose, onSubmit, title
}) {
  const isEdit = Boolean(initialValues);
  const [name, setName] = useState('');
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    setName(initialValues?.name || '');
  }, [initialValues]);

  const handleSave = () => {
    if (!name.trim()) {
      setSnack({ open: true, message: 'Name is required', severity: 'error' });
      return;
    }
    onSubmit({ name });
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
        <DialogTitle>{isEdit ? `Edit ${title}` : `Add ${title}`}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth margin="normal"
            label="Name"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
      <SnackbarAlert
        open={snack.open}
        severity={snack.severity}
        message={snack.message}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
      />
    </>
  );
}
