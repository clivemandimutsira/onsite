import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button
} from '@mui/material';

export default function BankFormDialog({
  open,
  initialValues,
  onClose,
  onSubmit
}) {
  const isEdit = Boolean(initialValues);
  const [form, setForm] = useState({
    name: '',
    swift_code: ''
  });

  useEffect(() => {
    if (initialValues) {
      setForm({
        name: initialValues.name || '',
        swift_code: initialValues.swift_code || ''
      });
    } else {
      setForm({ name: '', swift_code: '' });
    }
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSave = () => {
    onSubmit(form);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {isEdit ? 'Edit Bank' : 'Add Bank'}
      </DialogTitle>
      <DialogContent dividers>
        <TextField
          fullWidth
          margin="normal"
          label="Bank Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <TextField
          fullWidth
          margin="normal"
          label="SWIFT Code"
          name="swift_code"
          value={form.swift_code}
          onChange={handleChange}
          helperText="Optional, e.g. BOFAUS3N"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave}>
          {isEdit ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
