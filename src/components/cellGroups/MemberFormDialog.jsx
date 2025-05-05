import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Autocomplete from '@mui/material/Autocomplete';
import { getMembers } from '../../api/memberService';

const MemberFormDialog = ({ open, onClose, groupId, member, onSubmit }) => {
  const isEdit = Boolean(member);
  const [form, setForm] = useState({
    member_id: '',
    cell_group_id: groupId,
    designation: '',
    date_joined: ''
  });

  const [members, setMembers] = useState([]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const data = await getMembers();
        setMembers(data);
      } catch (err) {
        console.error('Failed to load members', err);
      }
    };
    fetchMembers();
  }, []);

  useEffect(() => {
    if (isEdit && member) {
      setForm({
        member_id: member.member_id,
        cell_group_id: groupId,
        designation: member.designation || '',
        date_joined: member.date_joined?.substring(0, 10) || ''
      });
    } else {
      setForm({
        member_id: '',
        cell_group_id: groupId,
        designation: '',
        date_joined: ''
      });
    }
  }, [member, groupId, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    const data = isEdit ? { ...form, id: member.id } : form;
    onSubmit(data, isEdit);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {isEdit ? 'Edit Member Assignment' : 'Add Member to Cell Group'}
        <IconButton onClick={onClose} sx={{ position: 'absolute', top: 8, right: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
        <Autocomplete
          freeSolo
          options={members}
          getOptionLabel={(option) =>
            typeof option === 'string'
              ? option
              : `${option.first_name} ${option.surname}`
          }
          value={
            typeof form.member_id === 'string'
              ? form.member_id
              : members.find((m) => m.id === form.member_id) || null
          }
          onChange={(e, value) => {
            if (typeof value === 'string') {
              setForm((prev) => ({ ...prev, member_id: value }));
            } else {
              setForm((prev) => ({ ...prev, member_id: value ? value.id : '' }));
            }
          }}
          disabled={isEdit}
          renderInput={(params) => (
            <TextField {...params} label="Select or Enter Member" fullWidth />
          )}
        />

        <TextField
          label="Designation"
          name="designation"
          value={form.designation}
          onChange={handleChange}
          fullWidth
          select
        >
          <MenuItem value="">None</MenuItem>
          <MenuItem value="Leader">Leader</MenuItem>
          <MenuItem value="Assistant">Assistant</MenuItem>
          <MenuItem value="Member">Member</MenuItem>
        </TextField>

        <TextField
          label="Date Joined"
          type="date"
          name="date_joined"
          value={form.date_joined}
          onChange={handleChange}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          {isEdit ? 'Update' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MemberFormDialog;
