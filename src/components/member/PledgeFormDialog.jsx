// src/components/member/PledgeFormDialog.jsx
import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button
} from '@mui/material';

export default function PledgeFormDialog({ open, onClose, onSubmit }) {
  const [amount, setAmount]     = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = () => {
    onSubmit({ amount, description });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create a Pledge</DialogTitle>
      <DialogContent dividers>
        <TextField
          label="Amount" type="number"
          fullWidth margin="normal"
          value={amount} onChange={e=>setAmount(e.target.value)}
        />
        <TextField
          label="Description" multiline rows={3}
          fullWidth margin="normal"
          value={description} onChange={e=>setDescription(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleCreate}>
          Pledge
        </Button>
      </DialogActions>
    </Dialog>
  );
}
