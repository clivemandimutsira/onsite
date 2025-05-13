// src/components/income/IncomeFormDialog.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Checkbox, FormControlLabel, MenuItem
} from '@mui/material';

const CATEGORY_OPTS = ['Tithe','Offering','Donation','Event Fee'];
const METHOD_OPTS   = ['Cash','Bank','Card','Online'];
const INTERVAL_OPTS = ['weekly','monthly','yearly'];

export default function IncomeFormDialog({ open, initialValues, onClose, onSubmit }) {
  const isEdit = Boolean(initialValues);
  const [form, setForm] = useState({
    member_id: '', amount: '', category: '',
    method: '', transaction_date: '', notes: '',
    is_recurring: false, recurring_interval: ''
  });

  useEffect(() => {
    if (initialValues) {
      setForm({
        ...initialValues,
        transaction_date: initialValues.transaction_date?.slice(0,10) || ''
      });
    } else {
      setForm({
        member_id:'', amount:'', category:'',
        method:'', transaction_date:'', notes:'',
        is_recurring:false, recurring_interval:''
      });
    }
  }, [initialValues]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = () => onSubmit(form);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Edit Income' : 'Add Income'}</DialogTitle>
      <DialogContent dividers>
        <TextField
          fullWidth margin="normal"
          label="Member ID" name="member_id"
          value={form.member_id} onChange={handleChange}
          required
        />
        <TextField
          fullWidth margin="normal" type="number"
          label="Amount" name="amount"
          value={form.amount} onChange={handleChange}
          required
        />
        <TextField
          fullWidth margin="normal" select
          label="Category" name="category"
          value={form.category} onChange={handleChange}
          required
        >
          {CATEGORY_OPTS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
        </TextField>
        <TextField
          fullWidth margin="normal" select
          label="Method" name="method"
          value={form.method} onChange={handleChange}
          required
        >
          {METHOD_OPTS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
        </TextField>
        <TextField
          fullWidth margin="normal" type="date"
          label="Date" name="transaction_date"
          value={form.transaction_date} onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          required
        />
        <TextField
          fullWidth margin="normal" multiline rows={2}
          label="Notes" name="notes"
          value={form.notes} onChange={handleChange}
        />
        <FormControlLabel
          control={
            <Checkbox
              name="is_recurring" checked={form.is_recurring}
              onChange={handleChange}
            />
          }
          label="Recurring?"
        />
        {form.is_recurring && (
          <TextField
            fullWidth margin="normal" select
            label="Interval" name="recurring_interval"
            value={form.recurring_interval}
            onChange={handleChange}
            required
          >
            {INTERVAL_OPTS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
          </TextField>
        )}
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
