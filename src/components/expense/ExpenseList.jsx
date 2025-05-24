import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead,
  TableRow, Paper, Button, CircularProgress, Box
} from '@mui/material';
import { fetchExpenses, deleteExpense } from '../../api/expenseService';
import { EditIcon, DeleteIcon } from '../common/ActionIcons';
import ConfirmDialog from '../common/ConfirmDialog';
import SnackbarAlert from '../common/SnackbarAlert';

export default function ExpenseList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const load = async () => {
    setLoading(true);
    try { setData(await fetchExpenses()); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = (id) => {
    setConfirm({ open: true, id });
  };

  const confirmDelete = async () => {
    try {
      await deleteExpense(confirm.id);
      setSnack({ open: true, message: 'Deleted', severity: 'success' });
      load();
    } catch {
      setSnack({ open: true, message: 'Delete failed', severity: 'error' });
    } finally {
      setConfirm({ open: false, id: null });
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Paper sx={{ p: 2 }}>
      <Button href="/expenses/new" variant="contained" sx={{ mb: 2 }}>
        Add Expense
      </Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Member ID</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Department</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Method</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map(r => (
            <TableRow key={r.id}>
              <TableCell>{r.transaction_date}</TableCell>
              <TableCell>{r.member_id}</TableCell>
              <TableCell>{r.amount}</TableCell>
              <TableCell>{r.department}</TableCell>
              <TableCell>{r.category}</TableCell>
              <TableCell>{r.payment_method}</TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <EditIcon onClick={() => window.location.href = `/expenses/${r.id}/edit`} sx={{ cursor: 'pointer' }} />
                  <DeleteIcon color="error" onClick={() => handleDelete(r.id)} sx={{ cursor: 'pointer' }} />
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ConfirmDialog
        open={confirm.open}
        title="Delete Expense"
        description="Are you sure you want to delete this expense?"
        onClose={() => setConfirm({ ...confirm, open: false })}
        onConfirm={confirmDelete}
      />
      <SnackbarAlert
        open={snack.open}
        severity={snack.severity}
        message={snack.message}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
      />
    </Paper>
  );
}
