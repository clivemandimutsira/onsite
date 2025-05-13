import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button
} from '@mui/material';

export default function LookupFormDialog({
  open, initialValues, onClose, onSubmit, title
}) {
  const isEdit = Boolean(initialValues);
  const [name, setName] = useState('');
  useEffect(() => {
    setName(initialValues?.name || '');
  }, [initialValues]);
  const handleSave = () => onSubmit({ name });
  return (
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
  );
}
