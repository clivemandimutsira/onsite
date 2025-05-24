import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, Autocomplete, Typography
} from '@mui/material';

import {
  createPrayerRequest,
  updatePrayerRequest
} from '../../api/memberPrayerRequestApi';

const STATUS_OPTIONS = ['Pending', 'Answered', 'In Progress', 'Closed'];

export default function MemberPrayerRequestForm({
  open, onClose, memberId, initialData, onSaved
}) {
  const isEdit = Boolean(initialData);  // Check if we're editing an existing request
  const [form, setForm] = useState({ request: '', status: 'Pending' });
  const [error, setError] = useState('');

  // When initialData changes, update the form state if editing
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
        console.log('Editing prayer request', { memberId, id: initialData.id, form });
        await updatePrayerRequest(memberId, initialData.id, form);  // Update existing request
      } else {
        console.log('Creating prayer request', { memberId, form });
        await createPrayerRequest(memberId, form);  // Create new request
      }
      onSaved(); // Callback to refresh the list
      onClose();  // Close the form dialog
    } catch (err) {
      console.error(err);
      // Removed the "Something went wrong" error message
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
            onChange={e => setForm(f => ({ ...f, request: e.target.value }))}  // Update request field
            multiline
            rows={4}
            fullWidth
          />
          <Autocomplete
            options={STATUS_OPTIONS}
            value={form.status}
            onChange={(_, value) =>
              setForm(f => ({ ...f, status: value || 'Pending' }))  // Update status field
            }
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
