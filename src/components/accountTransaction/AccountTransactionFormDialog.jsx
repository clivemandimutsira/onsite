// src/components/accountTransactions/AccountTransactionFormDialog.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete'; // Import Autocomplete

const TYPE_OPTS = ['credit', 'debit']; // Predefined options for type

export default function AccountTransactionFormDialog({ open, initialValues, onClose, onSubmit }) {
  const isEdit = Boolean(initialValues);
  const [form, setForm] = useState({
    account_id: '', related_income_id: '', related_expense_id: '',
    type: 'credit', amount: '', transaction_date: '', description: ''
  });

  useEffect(() => {
    if (initialValues) {
      setForm({
        ...initialValues,
        transaction_date: initialValues.transaction_date?.slice(0, 10) || ''
      });
    } else {
      setForm({
        account_id: '', related_income_id: '', related_expense_id: '',
        type: 'credit', amount: '', transaction_date: '', description: ''
      });
    }
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSave = () => onSubmit(form);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Edit Transaction' : 'Add Transaction'}</DialogTitle>
      <DialogContent dividers>
        <TextField
          fullWidth margin="normal"
          label="Account ID" name="account_id"
          value={form.account_id} onChange={handleChange}
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
        <TextField
          fullWidth margin="normal" type="number"
          label="Amount" name="amount"
          value={form.amount} onChange={handleChange}
          required
        />
        <TextField
          fullWidth margin="normal"
          label="Income Ref ID" name="related_income_id"
          value={form.related_income_id} onChange={handleChange}
        />
        <TextField
          fullWidth margin="normal"
          label="Expense Ref ID" name="related_expense_id"
          value={form.related_expense_id} onChange={handleChange}
        />
        <TextField
          fullWidth margin="normal" type="date"
          label="Date" name="transaction_date"
          value={form.transaction_date} onChange={handleChange}
          InputLabelProps={{ shrink: true }} required
        />
        <TextField
          fullWidth margin="normal" multiline rows={2}
          label="Description" name="description"
          value={form.description} onChange={handleChange}
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
