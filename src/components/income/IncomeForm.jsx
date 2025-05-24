import React, { useState, useEffect } from 'react';
import {
  TextField, Button, Checkbox, FormControlLabel,
  MenuItem, Paper, Typography
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import {
  fetchIncome, createIncome, updateIncome
} from '../../api/incomeService';

export default function IncomeForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    member_id: '', amount: '', category: '',
    method: '', transaction_date: '', notes: '',
    is_recurring: false, recurring_interval: ''
  });

  useEffect(() => {
    if (isEdit) {
      fetchIncome(id).then(data => setForm({
        ...data,
        transaction_date: data.transaction_date.slice(0,10)
      }));
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f, [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEdit) await updateIncome(id, form);
    else await createIncome(form);
    nav('/income');
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        {isEdit ? 'Edit Income' : 'Add Income'}
      </Typography>
      <form onSubmit={handleSubmit} noValidate autoComplete="off">
        <TextField
          label="Member ID" name="member_id"
          value={form.member_id} onChange={handleChange}
          fullWidth margin="normal" required
        />
        <TextField
          label="Amount" name="amount" type="number"
          value={form.amount} onChange={handleChange}
          fullWidth margin="normal" required
        />
        <TextField
          label="Category" name="category" select
          value={form.category} onChange={handleChange}
          fullWidth margin="normal" required
        >
          {['Tithe','Offering','Donation','Event Fee']
            .map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
        </TextField>
        <TextField
          label="Method" name="method" select
          value={form.method} onChange={handleChange}
          fullWidth margin="normal" required
        >
          {['Cash','Bank','Card','Online']
            .map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
        </TextField>
        <TextField
          label="Date" name="transaction_date" type="date"
          value={form.transaction_date} onChange={handleChange}
          fullWidth margin="normal" required
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Notes" name="notes" multiline rows={3}
          value={form.notes} onChange={handleChange}
          fullWidth margin="normal"
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
            label="Interval" name="recurring_interval" select
            value={form.recurring_interval} onChange={handleChange}
            fullWidth margin="normal" required
          >
            {['weekly','monthly','yearly']
              .map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
          </TextField>
        )}
        <Button type="submit" variant="contained" sx={{ mt:2 }}>
          {isEdit ? 'Update' : 'Create'}
        </Button>
      </form>
    </Paper>
  );
}
