import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, IconButton, MenuItem
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { getMembers } from '../../api/memberService';

const DepartmentMemberFormDialog = ({ open, onClose, departmentId, member, onSubmit }) => {
  const [form, setForm] = useState({
    member_id: '',
    designation: '',
    date_joined: '',
  });
  const [members, setMembers] = useState([]);

  useEffect(() => {
    getMembers().then(setMembers);
  }, []);

  useEffect(() => {
    if (member) {
      setForm({
        member_id: member.member_id,
        designation: member.designation || '',
        date_joined: member.date_joined ? member.date_joined.split('T')[0] : '',
        id: member.membership_id
      });
    } else {
      setForm({
        member_id: '',
        designation: '',
        date_joined: ''
      });
    }
  }, [member]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!form.member_id || !form.date_joined) {
      return alert('Please fill all required fields.');
    }
    const data = {
      ...form,
      department_id: departmentId,
    };
    onSubmit(data, !!member);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {member ? 'Edit Member Assignment' : 'Add Member to Department'}
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <TextField
          select
          fullWidth
          label="Select Member"
          name="member_id"
          value={form.member_id}
          onChange={handleChange}
          margin="normal"
          disabled={!!member}
        >
          {members.map((m) => (
            <MenuItem key={m.id} value={m.id}>
              {m.first_name} {m.surname}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          fullWidth
          label="Designation (optional)"
          name="designation"
          value={form.designation}
          onChange={handleChange}
          margin="normal"
        />

        <TextField
          fullWidth
          label="Date Joined"
          type="date"
          name="date_joined"
          value={form.date_joined}
          onChange={handleChange}
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          {member ? 'Update' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DepartmentMemberFormDialog;
