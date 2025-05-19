// src/components/income/IncomeFormDialog.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { fetchPaymentMethods } from '../../api/paymentMethodService';
import { getMembers } from '../../api/memberService';
import { fetchIncomeCategories } from '../../api/incomeCategoryService'; // Import the new API

const INTERVAL_OPTS = ['weekly', 'monthly', 'yearly'];

export default function IncomeFormDialog({ open, initialValues, onClose, onSubmit }) {
  const isEdit = Boolean(initialValues);
  const [form, setForm] = useState({
    member_id: '',
    member_full_name: '',
    amount: '',
    category: '',
    method: '',
    transaction_date: '',
    notes: '',
    is_recurring: false,
    recurring_interval: ''
  });
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [members, setMembers] = useState([]);
  const [categories, setCategories] = useState([]); // State for income categories

  useEffect(() => {
    if (initialValues) {
      setForm({
        member_id: initialValues.member_id,
        member_full_name: initialValues.member_full_name || '',
        amount: initialValues.amount,
        category: initialValues.category,
        method: initialValues.method,
        transaction_date: initialValues.transaction_date?.slice(0, 10) || '',
        notes: initialValues.notes || '',
        is_recurring: initialValues.is_recurring,
        recurring_interval: initialValues.recurring_interval || ''
      });
    } else {
      setForm({
        member_id: '',
        member_full_name: '',
        amount: '',
        category: '',
        method: '',
        transaction_date: '',
        notes: '',
        is_recurring: false,
        recurring_interval: ''
      });
    }
  }, [initialValues]);

  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        const methods = await fetchPaymentMethods();
        setPaymentMethods(methods);
      } catch (error) {
        console.error('Failed to fetch payment methods:', error);
      }
    };

    const loadMembers = async () => {
      try {
        const membersData = await getMembers();
        setMembers(membersData);
      } catch (error) {
        console.error('Failed to fetch members:', error);
      }
    };

    const loadCategories = async () => {
      try {
        const categoriesData = await fetchIncomeCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to fetch income categories:', error);
      }
    };

    loadPaymentMethods();
    loadMembers();
    loadCategories();
  }, []);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleMemberSelect = (_, value) => {
    if (value) {
      setForm(f => ({
        ...f,
        member_id: value.id,
        member_full_name: `${value.first_name} ${value.surname}`
      }));
    } else {
      setForm(f => ({ ...f, member_id: '', member_full_name: '' }));
    }
  };

  const handleSave = () => {
    onSubmit({
      ...form,
      member_name: form.member_full_name, // Send member_full_name to the backend
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Edit Income' : 'Add Income'}</DialogTitle>
      <DialogContent dividers>
        <Autocomplete
          options={members}
          getOptionLabel={option => `${option.first_name} ${option.surname}`}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          value={
            members.find(m => m.id === form.member_id)
            || (form.member_full_name
              ? { id: form.member_id, first_name: form.member_full_name.split(' ')[0], surname: form.member_full_name.split(' ')[1] }
              : null)
          }
          onChange={handleMemberSelect}
          renderInput={params => (
            <TextField
              {...params}
              label="Member"
              margin="normal"
              fullWidth
              required
            />
          )}
        />
        <TextField
          fullWidth
          margin="normal"
          type="number"
          label="Amount"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          required
        />
        <Autocomplete
          options={categories}
          getOptionLabel={option => option.name} // Assuming categories have a `name` field
          isOptionEqualToValue={(option, value) => option.id === value.id}
          value={categories.find(c => c.name === form.category) || null}
          onChange={(_, value) => setForm(f => ({ ...f, category: value?.name || '' }))}
          renderInput={params => (
            <TextField
              {...params}
              label="Category"
              margin="normal"
              fullWidth
              required
            />
          )}
        />
        <TextField
          fullWidth
          margin="normal"
          select
          label="Method"
          name="method"
          value={form.method}
          onChange={handleChange}
          required
        >
          {paymentMethods.map(method => (
            <MenuItem key={method.id} value={method.name}>
              {method.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          fullWidth
          margin="normal"
          type="date"
          label="Date"
          name="transaction_date"
          value={form.transaction_date}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          required
        />
        <TextField
          fullWidth
          margin="normal"
          multiline
          rows={2}
          label="Notes"
          name="notes"
          value={form.notes}
          onChange={handleChange}
        />
        <FormControlLabel
          control={
            <Checkbox
              name="is_recurring"
              checked={form.is_recurring}
              onChange={handleChange}
            />
          }
          label="Recurring?"
        />
        {form.is_recurring && (
          <TextField
            fullWidth
            margin="normal"
            select
            label="Interval"
            name="recurring_interval"
            value={form.recurring_interval}
            onChange={handleChange}
            required
          >
            {INTERVAL_OPTS.map(o => (
              <MenuItem key={o} value={o}>{o}</MenuItem>
            ))}
          </TextField>
        )}
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
