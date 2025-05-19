// src/components/budgets/BudgetFormDialog.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, MenuItem
} from '@mui/material';
import { getAllDepartments } from '../../api/departmentService'; // Import the API

export default function BudgetFormDialog({ open, initialValues, onClose, onSubmit }) {
  const isEdit = Boolean(initialValues);
  const [form, setForm] = useState({
    department: '', category: '', period_start: '', period_end: '', amount: ''
  });
  const [departments, setDepartments] = useState([]); // State for departments

  useEffect(() => {
    if (initialValues) {
      setForm({
        ...initialValues,
        period_start: initialValues.period_start?.slice(0, 10) || '',
        period_end: initialValues.period_end?.slice(0, 10) || ''
      });
    } else {
      setForm({
        department: '', category: '', period_start: '', period_end: '', amount: ''
      });
    }
  }, [initialValues]);

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const departmentsData = await getAllDepartments();
        setDepartments(departmentsData);
      } catch (error) {
        console.error('Failed to fetch departments:', error);
      }
    };

    loadDepartments();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSave = () => onSubmit(form);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Edit Budget' : 'Add Budget'}</DialogTitle>
      <DialogContent dividers>
        <TextField
          fullWidth margin="normal" select
          label="Department" name="department"
          value={form.department} onChange={handleChange}
          required
        >
          {departments.map(department => (
            <MenuItem key={department.id} value={department.name}>
              {department.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          fullWidth margin="normal"
          label="Category" name="category"
          value={form.category} onChange={handleChange}
        />
        <TextField
          fullWidth margin="normal" type="date"
          label="Start Date" name="period_start"
          value={form.period_start} onChange={handleChange}
          InputLabelProps={{ shrink: true }} required
        />
        <TextField
          fullWidth margin="normal" type="date"
          label="End Date" name="period_end"
          value={form.period_end} onChange={handleChange}
          InputLabelProps={{ shrink: true }} required
        />
        <TextField
          fullWidth margin="normal" type="number"
          label="Amount" name="amount"
          value={form.amount} onChange={handleChange}
          required
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>
          {isEdit ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
