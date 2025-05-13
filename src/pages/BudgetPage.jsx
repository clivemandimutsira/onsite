import React, { useState, useEffect, useContext } from 'react';
import {
  Container, Typography, Box, Button, TextField
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { EditIcon, DeleteIcon } from '../components/common/ActionIcons';
import ConfirmDialog from '../components/common/ConfirmDialog';
import SnackbarAlert from '../components/common/SnackbarAlert';
import BudgetFormDialog from '../components/budget/BudgetFormDialog';
import { AuthContext } from '../contexts/AuthContext';
import {
  fetchBudgets,
  createBudget,
  updateBudget,
  deleteBudget
} from '../api/budgetService';

export default function BudgetPage() {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [openForm, setOpenForm]  = useState(false);
  const [editing, setEditing]    = useState(null);
  const [confirm, setConfirm]    = useState({ open:false, id:null });
  const [snack, setSnack]        = useState({ open:false, message:'', severity:'success' });
  const [search, setSearch]      = useState('');

  const { permissions } = useContext(AuthContext);
  const canView   = permissions.includes('view_budgets')   || permissions.includes('manage_finance');
  const canCreate = permissions.includes('create_budgets') || permissions.includes('manage_finance');
  const canEdit   = permissions.includes('edit_budgets')   || permissions.includes('manage_finance');
  const canDelete = permissions.includes('delete_budgets') || permissions.includes('manage_finance');

  const load = async () => {
    setLoading(true);
    try { setRows(await fetchBudgets()); }
    catch { setSnack({ open:true, message:'Load failed', severity:'error' }); }
    finally { setLoading(false); }
  };
  useEffect(()=>{ if (canView) load(); }, [canView]);

  const filtered = rows.filter(r =>
    r.department.toLowerCase().includes(search.toLowerCase()) ||
    (r.category||'').toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { field: 'department',  headerName: 'Department', flex: 1 },
    { field: 'category',    headerName: 'Category', flex: 1 },
    { field: 'period_start',headerName: 'Start', flex: 1 },
    { field: 'period_end',  headerName: 'End', flex: 1 },
    { field: 'amount',      headerName: 'Amount', flex: 1 },
    {
      field: 'actions', headerName: 'Actions', flex: 1,
      renderCell: ({ row }) => (
        <Box>
          {canEdit   && <EditIcon   onClick={()=>{setEditing(row); setOpenForm(true);}} />}
          {canDelete && <DeleteIcon onClick={()=>setConfirm({ open:true, id:row.id })} />}
        </Box>
      )
    }
  ];

  const handleSubmit = async (vals) => {
    try {
      if (editing) await updateBudget(editing.id, vals);
      else         await createBudget(vals);
      setSnack({ open:true, message:'Saved!', severity:'success' });
      setOpenForm(false);
      load();
    } catch {
      setSnack({ open:true, message:'Save failed', severity:'error' });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteBudget(confirm.id);
      setSnack({ open:true, message:'Deleted', severity:'success' });
      load();
    } catch {
      setSnack({ open:true, message:'Delete failed', severity:'error' });
    } finally {
      setConfirm({ open:false, id:null });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt:4 }}>
      <Typography variant="h4" gutterBottom>Manage Budgets</Typography>
      <Box sx={{ display:'flex', justifyContent:'space-between', mb:2 }}>
        <TextField
          label="Search department or category"
          size="small" value={search}
          onChange={e=>setSearch(e.target.value)}
        />
        {canCreate && (
          <Button variant="contained" onClick={()=>{ setEditing(null); setOpenForm(true); }}>
            Add Budget
          </Button>
        )}
      </Box>
      <DataGrid
        autoHeight
        loading={loading}
        rows={filtered}
        columns={columns}
        getRowId={r=>r.id}
        pageSize={10}
      />

      <BudgetFormDialog
        open={openForm}
        initialValues={editing}
        onClose={()=>setOpenForm(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={confirm.open}
        title="Confirm Deletion"
        description="Delete this budget?"
        onClose={()=>setConfirm({ open:false, id:null })}
        onConfirm={handleDelete}
      />

      <SnackbarAlert
        open={snack.open}
        severity={snack.severity}
        message={snack.message}
        onClose={()=>setSnack(s=>({ ...s, open:false }))}
      />
    </Container>
);
}
