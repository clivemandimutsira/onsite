// src/components/member/PaymentFormDialog.jsx
import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, MenuItem
} from '@mui/material';

const TYPES = ['Tithe','Offering','Donation','Event Fee'];

export default function PaymentFormDialog({ open, onClose, onPaid }) {
  const [type, setType]         = useState('');
  const [amount, setAmount]     = useState('');
  const [loading, setLoading]   = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      await onPaid(amount, type);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Make Online Payment</DialogTitle>
      <DialogContent dividers>
        <TextField
          select label="Type"
          fullWidth margin="normal"
          value={type} onChange={e=>setType(e.target.value)}
        >
          {TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
        </TextField>
        <TextField
          label="Amount" type="number"
          fullWidth margin="normal"
          value={amount} onChange={e=>setAmount(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant="contained" onClick={handlePay} disabled={!type||!amount||loading}>
          {loading ? 'Processing…' : 'Pay'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
