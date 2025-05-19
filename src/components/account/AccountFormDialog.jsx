// src/components/accounts/AccountFormDialog.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, MenuItem
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete'; // Import Autocomplete

const TYPE_OPTS = ['bank', 'cash', 'mobile']; // Predefined options for type
const BANK_OPTS = ['Bank of America', 'Chase Bank', 'Wells Fargo', 'HSBC', 'Citibank']; // Predefined options for bank names

export default function AccountFormDialog({ open, initialValues, onClose, onSubmit }) {
  const isEdit = Boolean(initialValues);
  const [form, setForm] = useState({
    name: '', type: '', bank_name: '', account_number: '', balance: ''
  });

  useEffect(() => {
    if (initialValues) setForm(initialValues);
    else setForm({ name: '', type: '', bank_name: '', account_number: '', balance: '' });
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSave = () => onSubmit(form);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Edit Account' : 'Add Account'}</DialogTitle>
      <DialogContent dividers>
        <TextField
          fullWidth
          margin="normal"
          label="Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <Autocomplete
          freeSolo
          options={TYPE_OPTS} // Predefined options for type
          value={form.type}
          onInputChange={(e, newValue) => setForm((f) => ({ ...f, type: newValue }))}
          renderInput={(params) => (
            <TextField {...params} label="Type" name="type" margin="normal" required />
          )}
        />
        <Autocomplete
          freeSolo
          options={BANK_OPTS} // Predefined options for bank names
          value={form.bank_name}
          onInputChange={(e, newValue) => setForm((f) => ({ ...f, bank_name: newValue }))}
          renderInput={(params) => (
            <TextField {...params} label="Bank Name" name="bank_name" margin="normal" />
          )}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Account Number"
          name="account_number"
          value={form.account_number}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          margin="normal"
          type="number"
          label="Balance"
          name="balance"
          value={form.balance}
          onChange={handleChange}
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
