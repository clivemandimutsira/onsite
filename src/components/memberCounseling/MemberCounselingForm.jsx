import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, Autocomplete, Typography
} from '@mui/material';
import {
  createMemberCounseling,
  updateMemberCounseling,
} from '../../api/memberCounselingApi';

import { getMembers } from '../../api/memberService';

const MODE_OPTIONS = ['In-person', 'Online', 'Phone'];
const STATUS_OPTIONS = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

export default function MemberCounselingForm({
  open, onClose, memberId, initialData, onSaved
}) {
  const isEdit = Boolean(initialData);
  const [form, setForm] = useState({
    date: '', time: '', counselor_id: null,
    mode: '', status: '', notes: ''
  });
  const [counselors, setCounselors] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch all members and map to fullName
    getMembers()
      .then(ms => ms.map(m => ({ id: m.id, fullName: `${m.first_name} ${m.surname}` })))
      .then(setCounselors)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (initialData) {
      setForm({
        date: initialData.date,
        time: initialData.time,
        counselor_id: initialData.counselor_id, // not name
        mode: initialData.mode,
        status: initialData.status,
        notes: initialData.notes || '',
      });
    } else {
      setForm({ date: '', time: '', counselor_id: null, mode: '', status: '', notes: '' });
    }
  }, [initialData]);

  const handleSave = async () => {
    if (!form.counselor_id) {
      setError('Counselor must be selected.');
      return;
    }
    try {
      if (isEdit) {
        await updateMemberCounseling(memberId, initialData.id, form);
      } else {
        await createMemberCounseling(memberId, form);
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{isEdit ? 'Edit Booking' : 'New Booking'}</DialogTitle>
      <DialogContent>
        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mt={1}>
          <TextField
            label="Date" type="date" name="date" value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))} 
            InputLabelProps={{ shrink: true }} 
            fullWidth
          />
          <TextField
            label="Time" type="time" name="time" value={form.time}
            onChange={e => setForm(f => ({ ...f, time: e.target.value }))} 
            InputLabelProps={{ shrink: true }} 
            fullWidth
          />

          <Autocomplete
            options={counselors}
            getOptionLabel={opt => opt.fullName}
            value={counselors.find(c => c.id === form.counselor_id) || null}
            onChange={(_, sel) => setForm(f => ({ ...f, counselor_id: sel?.id || null }))}
            renderInput={params => <TextField {...params} label="Counselor" />}
            fullWidth
          />
          {error && <Typography color="error" variant="body2">{error}</Typography>}

          <Autocomplete
            options={MODE_OPTIONS}
            value={form.mode}
            onChange={(_, v) => setForm(f => ({ ...f, mode: v || '' }))}
            renderInput={params => <TextField {...params} label="Mode" />}
            fullWidth
          />

          <Autocomplete
            options={STATUS_OPTIONS}
            value={form.status}
            onChange={(_, v) => setForm(f => ({ ...f, status: v || '' }))}
            renderInput={params => <TextField {...params} label="Status" />}
            fullWidth
          />

          <TextField
            label="Notes" name="notes" value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} 
            multiline rows={3} fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>
          {isEdit ? 'Update' : 'Book'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
