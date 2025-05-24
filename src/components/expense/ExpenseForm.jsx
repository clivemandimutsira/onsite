import React, { useState, useEffect } from 'react';
import {
  TextField, Button, Paper, Typography, MenuItem
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import {
  fetchExpense, createExpense, updateExpense
} from '../../api/expenseService';

export default function ExpenseForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    member_id: '', amount: '', department: '',
    category: '', payment_method: '', transaction_date: '',
    notes: '', receipt_url: '', approved_by: '', approved_at: ''
  });

  useEffect(() => {
    if (isEdit) {
      fetchExpense(id).then(d => setForm({
        ...d,
        transaction_date: d.transaction_date.slice(0,10),
        approved_at: d.approved_at ? d.approved_at.slice(0,16) : ''
      }));
    }
  }, [id, isEdit]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (isEdit) await updateExpense(id, form);
    else await createExpense(form);
    nav('/expenses');
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        {isEdit ? 'Edit Expense' : 'Add Expense'}
      </Typography>
      <form onSubmit={handleSubmit}>
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
          label="Department" name="department" select
          value={form.department} onChange={handleChange}
          fullWidth margin="normal" required
        >
          {['Operations','Outreach','Admin','Program']
            .map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
        </TextField>
        <TextField
          label="Category" name="category"
          value={form.category} onChange={handleChange}
          fullWidth margin="normal" required
        />
        <TextField
          label="Payment Method" name="payment_method" select
          value={form.payment_method} onChange={handleChange}
          fullWidth margin="normal" required
        >
          {['Cash','Bank','Card','Online']
            .map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
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
        <TextField
          label="Receipt URL" name="receipt_url"
          value={form.receipt_url} onChange={handleChange}
          fullWidth margin="normal"
        />
        <TextField
          label="Approved By (Member ID)" name="approved_by"
          value={form.approved_by} onChange={handleChange}
          fullWidth margin="normal"
        />
        <TextField
          label="Approved At" name="approved_at" type="datetime-local"
          value={form.approved_at} onChange={handleChange}
          fullWidth margin="normal"
          InputLabelProps={{ shrink: true }}
        />
        <Button type="submit" variant="contained" sx={{ mt:2 }}>
          {isEdit ? 'Update' : 'Create'}
        </Button>
      </form>
    </Paper>
  );
}
