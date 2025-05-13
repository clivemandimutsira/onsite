import React, { useState, useEffect } from 'react';
import {
  TextField, Button, Paper, Typography, MenuItem
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import {
  fetchAccount, createAccount, updateAccount
} from '../../api/accountService';

export default function AccountForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: '', type: '', bank_name: '',
    account_number: '', balance: ''
  });

  useEffect(() => {
    if (isEdit) {
      fetchAccount(id).then(d => setForm(d));
    }
  }, [id, isEdit]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (isEdit) await updateAccount(id, form);
    else await createAccount(form);
    nav('/accounts');
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        {isEdit ? 'Edit Account' : 'Add Account'}
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Name" name="name"
          value={form.name} onChange={handleChange}
          fullWidth margin="normal" required
        />
        <TextField
          label="Type" name="type" select
          value={form.type} onChange={handleChange}
          fullWidth margin="normal" required
        >
          {['bank','cash','mobile'].map(o =>
            <MenuItem key={o} value={o}>{o}</MenuItem>
          )}
        </TextField>
        <TextField
          label="Bank Name" name="bank_name"
          value={form.bank_name} onChange={handleChange}
          fullWidth margin="normal"
        />
        <TextField
          label="Account Number" name="account_number"
          value={form.account_number} onChange={handleChange}
          fullWidth margin="normal"
        />
        <TextField
          label="Balance" name="balance" type="number"
          value={form.balance} onChange={handleChange}
          fullWidth margin="normal" required
        />
        <Button type="submit" variant="contained" sx={{ mt:2 }}>
          {isEdit ? 'Update' : 'Create'}
        </Button>
      </form>
    </Paper>
  );
}
