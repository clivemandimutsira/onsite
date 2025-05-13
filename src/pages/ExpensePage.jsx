import React, { useState, useEffect, useContext } from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { EditIcon, DeleteIcon } from '../components/common/ActionIcons';
import ConfirmDialog from '../components/common/ConfirmDialog';
import SnackbarAlert from '../components/common/SnackbarAlert';
import ExpenseFormDialog from '../components/expense/ExpenseFormDialog';
import { AuthContext } from '../contexts/AuthContext';
import {
  fetchExpenses,
 createExpense,
  updateExpense,
 deleteExpense
} from '../api/expenseService';

export default function ExpensePage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const { permissions } = useContext(AuthContext);
  const canView   = permissions.includes('view_expenses')   || permissions.includes('manage_finance');
  const canCreate = permissions.includes('create_expenses') || permissions.includes('manage_finance');
  const canEdit   = permissions.includes('edit_expenses')   || permissions.includes('manage_finance');
  const canDelete = permissions.includes('delete_expenses') || permissions.includes('manage_finance');

  const load = async () => {
    setLoading(true);
    try { setData(await fetchExpenses()); }
    catch { alert('Load failed'); }
    finally { setLoading(false); }
  };
  useEffect(() => { if (canView) load(); }, [canView]);

  const cols = [
    { field: 'transaction_date', headerName: 'Date', flex: 1 },
    { field: 'department',       headerName: 'Dept.', flex: 1 },
    { field: 'category',         headerName: 'Category', flex: 1 },
    { field: 'amount',           headerName: 'Amount', flex: 1 },
    { field: 'payment_method',   headerName: 'Method', flex: 1 },
    {
      field: 'actions', headerName: 'Actions', flex: 1,
      renderCell: ({ row }) => (
        <Box>
          {canEdit  && <EditIcon   onClick={() => { setEditing(row); setDialogOpen(true); }} />}
          {canDelete&& <DeleteIcon onClick={() => setConfirm({ open: true, id: row.id })} />}
        </Box>
      )
    }
  ];

  const handleSubmit = async vals => {
    try {
      if (editing) await updateExpense(editing.id, vals);
      else           await createExpense(vals);
      setSnackbar({ open: true, message: 'Saved!' });
      setDialogOpen(false);
      load();
    } catch {
      setSnackbar({ open: true, message: 'Save failed.', severity: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteExpense(confirm.id);
      setSnackbar({ open: true, message: 'Deleted.' });
      load();
    } catch {
      setSnackbar({ open: true, message: 'Delete failed.', severity: 'error' });
    } finally {
      setConfirm({ open: false, id: null });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Manage Expenses</Typography>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        {canCreate && <Button variant="contained" onClick={() => { setEditing(null); setDialogOpen(true); }}>
          Add Expense
        </Button>}
      </Box>
      <DataGrid
        autoHeight
        loading={loading}
        rows={data}
        columns={cols}
        getRowId={r => r.id}
        pageSize={10}
      />

      <ExpenseFormDialog
        open={dialogOpen}
        initialValues={editing}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={confirm.open}
        title="Confirm Delete"
        description="Delete this expense?"
        onClose={() => setConfirm({ open: false, id: null })}
        onConfirm={handleDelete}
      />

      <SnackbarAlert
        open={snackbar.open}
        severity={snackbar.severity}
        message={snackbar.message}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
      />
    </Container>
  );
}
