import React, { useState, useEffect, useContext } from 'react';
import {
  Container, Typography, Box, Button,
  Dialog, DialogTitle, DialogContent, TextField
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { ChevronRight, ExpandMore } from '@mui/icons-material';
import { EditIcon, DeleteIcon } from '../components/common/ActionIcons';
import ConfirmDialog from '../components/common/ConfirmDialog';
import SnackbarAlert from '../components/common/SnackbarAlert';
import IncomeFormDialog from '../components/income/IncomeFormDialog';
import { AuthContext } from '../contexts/AuthContext';

import {
  fetchIncomes,
  createIncome,
  updateIncome,
  deleteIncome
} from '../api/incomeService';


export default function IncomePage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const { permissions } = useContext(AuthContext);
  const canView   = permissions.includes('view_income')   || permissions.includes('manage_finance');
  const canCreate = permissions.includes('create_income') || permissions.includes('manage_finance');
  const canEdit   = permissions.includes('edit_income')   || permissions.includes('manage_finance');
  const canDelete = permissions.includes('delete_income') || permissions.includes('manage_finance');

  const load = async () => {
    setLoading(true);
    try {
      setData(await fetchIncomes());
    } catch {
      alert('Failed to load incomes');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { if (canView) load(); }, [canView]);

  const cols = [
    { field: 'transaction_date', headerName: 'Date', flex: 1 },
    { field: 'member_id',        headerName: 'Member', flex: 1 },
    { field: 'amount',           headerName: 'Amount', flex: 1 },
    { field: 'category',         headerName: 'Category', flex: 1 },
    { field: 'method',           headerName: 'Method', flex: 1 },
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

  const handleSubmit = async (values) => {
    try {
      if (editing) await updateIncome(editing.id, values);
      else           await createIncome(values);
      setSnackbar({ open: true, message: `Income ${editing ? 'updated' : 'created'}.` });
      setDialogOpen(false);
      load();
    } catch {
      setSnackbar({ open: true, message: 'Save failed.', severity: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteIncome(confirm.id);
      setSnackbar({ open: true, message: 'Income deleted.' });
      load();
    } catch {
      setSnackbar({ open: true, message: 'Delete failed.', severity: 'error' });
    } finally {
      setConfirm({ open: false, id: null });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Manage Incomes</Typography>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        {canCreate && <Button variant="contained" onClick={() => { setEditing(null); setDialogOpen(true); }}>
          Add Income
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

      <IncomeFormDialog
        open={dialogOpen}
        initialValues={editing}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={confirm.open}
        title="Confirm Delete"
        description="Delete this income?"
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
