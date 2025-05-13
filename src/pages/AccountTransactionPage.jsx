import React, { useState, useEffect, useContext } from 'react';
import {
  Container, Typography, Box, Button, TextField
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { EditIcon, DeleteIcon } from '../components/common/ActionIcons';
import ConfirmDialog from '../components/common/ConfirmDialog';
import SnackbarAlert from '../components/common/SnackbarAlert';
import AccountTransactionFormDialog from '../components/accountTransaction/AccountTransactionFormDialog';
import { AuthContext } from '../contexts/AuthContext';
import {
  fetchTxns,
  createTxn,
  updateTxn,
  deleteTxn
} from '../api/accountTransactionService';

export default function AccountTransactionPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
  const [search, setSearch] = useState('');

  const { permissions } = useContext(AuthContext);
  const canView = permissions.includes('view_account_txns') || permissions.includes('manage_finance');
  const canCreate = permissions.includes('create_account_txns') || permissions.includes('manage_finance');
  const canEdit = permissions.includes('edit_account_txns') || permissions.includes('manage_finance');
  const canDelete = permissions.includes('delete_account_txns') || permissions.includes('manage_finance');

  const load = async () => {
    setLoading(true);
    try { setRows(await fetchTxns()); }
    catch { setSnack({ open: true, message: 'Load failed', severity: 'error' }); }
    finally { setLoading(false); }
  };
  useEffect(() => { if (canView) load(); }, [canView]);

  const filtered = rows.filter(r =>
    r.type.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { field: 'transaction_date', headerName: 'Date', flex: 1 },
    { field: 'account_id', headerName: 'Acct ID', flex: 1 },
    {
      field: 'type',
      headerName: 'Type',
      flex: 1,
      renderCell: ({ row }) => (
        <TextField
          value={row.type || ''}
          onChange={(e) => {
            row.type = e.target.value; // Update the row's type
          }}
          label="Type"
          fullWidth
        />
      ),
    },
    { field: 'amount', headerName: 'Amount', flex: 1 },
    {
      field: 'actions', headerName: 'Actions', flex: 1,
      renderCell: ({ row }) => (
        <Box>
          {canEdit && <EditIcon onClick={() => { setEditing(row); setOpenForm(true); }} />}
          {canDelete && <DeleteIcon onClick={() => setConfirm({ open: true, id: row.id })} />}
        </Box>
      )
    }
  ];

  const handleSubmit = async (vals) => {
    try {
      if (editing) await updateTxn(editing.id, vals);
      else await createTxn(vals);
      setSnack({ open: true, message: 'Saved!', severity: 'success' });
      setOpenForm(false);
      load();
    } catch {
      setSnack({ open: true, message: 'Save failed', severity: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTxn(confirm.id);
      setSnack({ open: true, message: 'Deleted', severity: 'success' });
      load();
    } catch {
      setSnack({ open: true, message: 'Delete failed', severity: 'error' });
    } finally {
      setConfirm({ open: false, id: null });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Manage Account Transactions</Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <TextField
          label="Search type"
          size="small" value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {canCreate && (
          <Button variant="contained" onClick={() => { setEditing(null); setOpenForm(true); }}>
            Add Transaction
          </Button>
        )}
      </Box>
      <DataGrid
        autoHeight
        loading={loading}
        rows={filtered}
        columns={columns}
        getRowId={r => r.id}
        pageSize={10}
      />

      <AccountTransactionFormDialog
        open={openForm}
        initialValues={editing}
        onClose={() => setOpenForm(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={confirm.open}
        title="Confirm Deletion"
        description="Delete this transaction?"
        onClose={() => setConfirm({ open: false, id: null })}
        onConfirm={handleDelete}
      />

      <SnackbarAlert
        open={snack.open}
        severity={snack.severity}
        message={snack.message}
        onClose={() => setSnack(s => ({ ...s, open: false }))} />
    </Container>
  );
}
