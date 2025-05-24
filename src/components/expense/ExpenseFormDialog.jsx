// src/components/expenses/ExpenseFormDialog.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { getMembers } from '../../api/memberService';
import { getAllDepartments } from '../../api/departmentService';
import { fetchExpensesCategories } from '../../api/expenseCategoryService';
import { fetchPaymentMethods } from '../../api/paymentMethodService';

export default function ExpenseFormDialog({ open, initialValues, onClose, onSubmit }) {
  const isEdit = Boolean(initialValues);
  const [form, setForm] = useState({
    member_id: '', amount: '', department: '',
    category: '', payment_method: '', transaction_date: '',
    notes: '', receipt_url: '', approved_by: '', approved_at: ''
  });
  const [members, setMembers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const data = await getMembers();
        setMembers(data.map((m) => ({ id: m.id, name: `${m.first_name} ${m.surname}` })));
      } catch (error) {
        console.error('Failed to load members:', error);
      }
    };

    const loadDepartments = async () => {
      setLoadingDepartments(true);
      try {
        const data = await getAllDepartments();
        setDepartments(data.map((dept) => dept.name)); // Extract department names
      } catch (error) {
        console.error('Failed to load departments:', error);
      } finally {
        setLoadingDepartments(false);
      }
    };

    const loadCategories = async () => {
      try {
        const data = await fetchExpensesCategories();
        setCategories(data.map((category) => category.name)); // Extract category names
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };

    const loadPaymentMethods = async () => {
      try {
        const data = await fetchPaymentMethods();
        setPaymentMethods(data.map((method) => method.name)); // Extract payment method names
      } catch (error) {
        console.error('Failed to load payment methods:', error);
      }
    };

    loadMembers();
    loadDepartments();
    loadCategories();
    loadPaymentMethods();

    if (initialValues) {
      setForm({
        ...initialValues,
        transaction_date: initialValues.transaction_date?.slice(0, 10) || '',
        approved_at: initialValues.approved_at?.slice(0, 16) || null,
      });
    } else {
      setForm({
        member_id: '', amount: '', department: '',
        category: '', payment_method: '', transaction_date: '',
        notes: '', receipt_url: '', approved_by: '', approved_at: null,
      });
    }
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSave = () => {
    const { approved_at, ...sanitizedForm } = form; // Exclude approved_at
    onSubmit(sanitizedForm);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
      <DialogContent dividers>
        <Autocomplete
          options={members}
          getOptionLabel={(option) => {
            if (!option) return '';
            return typeof option === 'string' ? option : option.name || '';
          }}
          value={members.find((m) => m.id === form.member_id) || null}
          onChange={(e, newValue) => {
            setForm((f) => ({ ...f, member_id: newValue?.id || '' }));
          }}
          renderInput={(params) => (
            <TextField {...params} label="Member" name="member_id" margin="normal" required />
          )}
        />
        <TextField
          fullWidth margin="normal" type="number"
          label="Amount" name="amount"
          value={form.amount} onChange={handleChange}
          required
        />
        <Autocomplete
          freeSolo
          options={departments} // Use fetched departments as options
          value={form.department || ''}
          onInputChange={(e, newValue) => setForm((f) => ({ ...f, department: newValue || '' }))}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Department"
              placeholder="Select or type a department"
              margin="normal"
              variant="outlined"
              fullWidth
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loadingDepartments ? <span>Loading...</span> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
        <Autocomplete
          freeSolo
          options={categories} // Use fetched categories as options
          value={form.category || ''}
          onInputChange={(e, newValue) => setForm((f) => ({ ...f, category: newValue || '' }))}
          renderInput={(params) => (
            <TextField {...params} label="Category" name="category" margin="normal" required />
          )}
        />
        <Autocomplete
          options={paymentMethods} // Use fetched payment methods as options
          value={form.payment_method}
          onChange={(e, newValue) => setForm((f) => ({ ...f, payment_method: newValue }))}
          renderInput={(params) => (
            <TextField {...params} label="Payment Method" name="payment_method" margin="normal" required />
          )}
        />
        <TextField
          fullWidth margin="normal" type="date"
          label="Date" name="transaction_date"
          value={form.transaction_date} onChange={handleChange}
          InputLabelProps={{ shrink: true }} required
        />
        <TextField
          fullWidth margin="normal" multiline rows={2}
          label="Notes" name="notes"
          value={form.notes} onChange={handleChange}
        />
        <TextField
          fullWidth margin="normal"
          label="Receipt URL" name="receipt_url"
          value={form.receipt_url} onChange={handleChange}
        />
        <Autocomplete
          freeSolo
          options={members.map((m) => m.name)}
          value={members.find((m) => m.id === form.approved_by)?.name || ''}
          onChange={(e, newValue) => {
            const selectedMember = members.find((m) => m.name === newValue);
            setForm((f) => ({ ...f, approved_by: selectedMember?.id || '' }));
          }}
          renderInput={(params) => (
            <TextField {...params} label="Approved By" name="approved_by" margin="normal" />
          )}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Approved At"
          value={form.approved_at ? form.approved_at : ''}
          InputProps={{ readOnly: true }} // Make it read-only
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
