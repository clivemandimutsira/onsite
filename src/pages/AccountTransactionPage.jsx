import React, { useState, useEffect, useContext } from 'react';
import {
  Container, Typography, Box, Button, TextField, Card, CardContent, List, ListItem, ListItemText, Divider
} from '@mui/material';
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
      <Typography variant="h4" gutterBottom>Account Transactions</Typography>
      {canCreate && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <Button
            variant="contained"
            onClick={() => { setEditing(null); setOpenForm(true); }}
          >
            Add Transaction
          </Button>
        </Box>
      )}
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'center', mb: 2 }}>
            <TextField
              label="Search type"
              size="small"
              value={search}
              onChange={e => setSearch(e.target.value)}
              sx={{ flex: 2, minWidth: 220, maxWidth: 400 }}
              fullWidth
            />
          </Box>
          <List>
            {loading && (
              <Typography sx={{ p: 2 }}>Loading...</Typography>
            )}
            {!loading && filtered.length === 0 && (
              <Typography sx={{ p: 2 }}>No transactions found.</Typography>
            )}
            {filtered.map((row, idx) => (
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
                      {canEdit && <EditIcon onClick={() => { setEditing(row); setOpenForm(true); }} />}
                      {canDelete && <DeleteIcon onClick={() => setConfirm({ open: true, id: row.id })} />}
                    </Box>
                  }
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        <Typography variant="subtitle1" sx={{ minWidth: 120 }}>{row.type}</Typography>
                        <Typography variant="body2" color="text.secondary">Date: {row.transaction_date}</Typography>
                        <Typography variant="body2" color="text.secondary">Acct ID: {row.account_id}</Typography>
                        <Typography variant="body2" color="text.secondary">Amount: {row.amount}</Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {idx < filtered.length - 1 && <Divider variant="fullWidth" />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>

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
        onClose={() => setSnack(s => ({ ...s, open: false }))}
      />
    </Container>
  );
}
