import React, { useState, useEffect, useContext } from 'react';
import {
  Container, Typography, Box, Button, Card, CardContent, List, ListItem, ListItemText, Divider
} from '@mui/material';
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
    catch { setSnackbar({ open: true, message: 'Load failed.', severity: 'error' }); }
    finally { setLoading(false); }
  };
  useEffect(() => { if (canView) load(); }, [canView]);

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
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        {canCreate && <Button variant="contained" onClick={() => { setEditing(null); setDialogOpen(true); }}>
          Add Expense
        </Button>}
      </Box>
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <List>
            {loading && (
              <Typography sx={{ p: 2 }}>Loading...</Typography>
            )}
            {!loading && data.length === 0 && (
              <Typography sx={{ p: 2 }}>No expenses found.</Typography>
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
                      {canEdit  && <EditIcon   onClick={() => { setEditing(row); setDialogOpen(true); }} />}
                      {canDelete&& <DeleteIcon onClick={() => setConfirm({ open: true, id: row.id })} />}
                    </Box>
                  }
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        <Typography variant="subtitle1" sx={{ minWidth: 120 }}>{row.transaction_date}</Typography>
                        <Typography variant="body2" color="text.secondary">{row.department}</Typography>
                        <Typography variant="body2" color="text.secondary">{row.category}</Typography>
                        <Typography variant="body2" color="text.secondary">Amount: {row.amount}</Typography>
                        <Typography variant="body2" color="text.secondary">Method: {row.payment_method}</Typography>
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
