import React, { useState, useEffect, useContext } from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { EditIcon, DeleteIcon } from '../components/common/ActionIcons';
import ConfirmDialog from '../components/common/ConfirmDialog';
import SnackbarAlert from '../components/common/SnackbarAlert';
import AccountFormDialog from '../components/account/AccountFormDialog';
import { AuthContext } from '../contexts/AuthContext';
import {
  fetchAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
} from '../api/accountService';

export default function AccountPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const { permissions } = useContext(AuthContext);

  const canView = permissions.includes('view_accounts') || permissions.includes('manage_finance');
  const canCreate = permissions.includes('create_accounts') || permissions.includes('manage_finance');
  const canEdit = permissions.includes('edit_accounts') || permissions.includes('manage_finance');
  const canDelete = permissions.includes('delete_accounts') || permissions.includes('manage_finance');

  const load = async () => {
    setLoading(true);
    try {
      setData(await fetchAccounts());
    } catch {
      setSnackbar({ open: true, message: 'Failed to load accounts.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canView) load();
  }, [canView]);

  const cols = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'type', headerName: 'Type', flex: 1 },
    { field: 'bank_name', headerName: 'Bank', flex: 1 },
    { field: 'account_number', headerName: 'Acct #', flex: 1 },
    { field: 'balance', headerName: 'Balance', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      renderCell: ({ row }) => (
        <Box>
          {canEdit && <EditIcon onClick={() => { setEditing(row); setDialogOpen(true); }} />}
          {canDelete && <DeleteIcon onClick={() => setConfirm({ open: true, id: row.id })} />}
        </Box>
      ),
    },
  ];

  const handleSubmit = async (vals) => {
    try {
      if (editing) await updateAccount(editing.id, vals);
      else await createAccount(vals);
      setSnackbar({ open: true, message: 'Account saved successfully!', severity: 'success' });
      setDialogOpen(false);
      load();
    } catch {
      setSnackbar({ open: true, message: 'Failed to save account.', severity: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAccount(confirm.id);
      setSnackbar({ open: true, message: 'Account deleted successfully!', severity: 'success' });
      load();
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete account.', severity: 'error' });
    } finally {
      setConfirm({ open: false, id: null });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Manage Accounts
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        {canCreate && (
          <Button
            variant="contained"
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            Add Account
          </Button>
        )}
      </Box>
      <DataGrid
        autoHeight
        loading={loading}
        rows={data}
        columns={cols}
        getRowId={(r) => r.id}
        pageSize={10}
      />

      <AccountFormDialog
        open={dialogOpen}
        initialValues={editing}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={confirm.open}
        title="Confirm Delete"
        description="Are you sure you want to delete this account?"
        onClose={() => setConfirm({ open: false, id: null })}
        onConfirm={handleDelete}
      />

      <SnackbarAlert
        open={snackbar.open}
        severity={snackbar.severity}
        message={snackbar.message}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))} />
    </Container>
  );
}
