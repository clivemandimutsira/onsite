import React, { useState, useEffect, useContext } from 'react';
import {
  Container, Typography, Box, Button, Card, CardContent, List, ListItem, ListItemText, Divider
} from '@mui/material';
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
        <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <List>
            {loading && (
              <Typography sx={{ p: 2 }}>Loading...</Typography>
            )}
            {!loading && data.length === 0 && (
              <Typography sx={{ p: 2 }}>No accounts found.</Typography>
            )}
            {data.map((row, idx) => (
              <React.Fragment key={row.id}>
                <ListItem
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    justifyContent: 'space-between',
                    gap: 2,
                  }}
                  secondaryAction={
                    <Box>
                      {canEdit && <EditIcon onClick={() => { setEditing(row); setDialogOpen(true); }} />}
                      {canDelete && <DeleteIcon onClick={() => setConfirm({ open: true, id: row.id })} />}
                    </Box>
                  }
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        <Typography variant="subtitle1" sx={{ minWidth: 120 }}>{row.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{row.type}</Typography>
                        <Typography variant="body2" color="text.secondary">{row.bank_name}</Typography>
                        <Typography variant="body2" color="text.secondary">Acct #: {row.account_number}</Typography>
                        <Typography variant="body2" color="text.secondary">Balance: {row.balance}</Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {idx < data.length - 1 && <Divider variant="fullWidth" />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>

      {canCreate && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <Button
            variant="contained"
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            Add Account
          </Button>
        </Box>
      )}

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
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      />
    </Container>
  );
}
