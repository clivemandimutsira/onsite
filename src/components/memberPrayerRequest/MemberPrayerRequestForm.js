import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, Autocomplete, Typography
} from '@mui/material';

const STATUS_OPTIONS = ['Pending', 'Answered', 'In Progress', 'Closed'];

export default function MemberPrayerRequestForm({
  open, onClose, memberId, initialData, onSaved
}) {
  const isEdit = Boolean(initialData);
  const [form, setForm] = useState({ request: '', status: 'Pending' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setForm({
        request: initialData.request || '',
        status: initialData.status || 'Pending',
      });
    } else {
      setForm({ request: '', status: 'Pending' });
    }
  }, [initialData]);

  const handleSave = async () => {
    if (!form.request.trim()) {
      setError('Request cannot be empty.');
      return;
    }

    try {
      if (isEdit) {
        await window.api.updatePrayerRequest(memberId, initialData.id, form);
      } else {
        await window.api.createPrayerRequest(memberId, form);
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      setError('Something went wrong.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{isEdit ? 'Edit Prayer Request' : 'New Prayer Request'}</DialogTitle>
      <DialogContent>
        <Box mt={2}>
          <TextField
            label="Prayer Request"
            value={form.request}
            onChange={e => setForm(f => ({ ...f, request: e.target.value }))}
            multiline rows={4}
            fullWidth
          />
          <Autocomplete
            options={STATUS_OPTIONS}
            value={form.status}
            onChange={(_, value) => setForm(f => ({ ...f, status: value || 'Pending' }))}
            renderInput={params => <TextField {...params} label="Status" />}
            fullWidth
            sx={{ mt: 2 }}
          />
          {error && <Typography color="error" mt={1}>{error}</Typography>}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>
          {isEdit ? 'Update' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
