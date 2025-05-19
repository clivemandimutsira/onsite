import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button
} from '@mui/material';

export default function CurrencyFormDialog({
  open, initialValues, onClose, onSubmit
}) {
  const isEdit = Boolean(initialValues);
  const [form, setForm] = useState({ code:'', name:'', symbol:'' });

  useEffect(() => {
    if (initialValues) {
      setForm({
        code:   initialValues.code,
        name:   initialValues.name,
        symbol: initialValues.symbol
      });
    } else {
      setForm({ code:'', name:'', symbol:'' });
    }
  }, [initialValues]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSave = () => onSubmit(form);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{isEdit ? 'Edit Currency' : 'Add Currency'}</DialogTitle>
      <DialogContent>
        <TextField
          margin="normal" fullWidth
          label="Code" name="code"
          value={form.code} onChange={handleChange}
          inputProps={{ maxLength: 3 }}
          helperText="3-letter ISO code"
          required
        />
        <TextField
          margin="normal" fullWidth
          label="Name" name="name"
          value={form.name} onChange={handleChange}
          required
        />
        <TextField
          margin="normal" fullWidth
          label="Symbol" name="symbol"
          value={form.symbol} onChange={handleChange}
          helperText="e.g. $, €, R"
          required
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
