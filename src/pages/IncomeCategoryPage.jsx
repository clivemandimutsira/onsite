import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Button, TextField
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { EditIcon, DeleteIcon } from '../components/common/ActionIcons';
import ConfirmDialog from '../components/common/ConfirmDialog';
import SnackbarAlert from '../components/common/SnackbarAlert';
import IncomeCategoryFormDialog from '../components/settings/IncomeCategoryFormDialog';
import {
  fetchIncomeCategories,
  createIncomeCategory,
  updateIncomeCategory,
  deleteIncomeCategory
} from '../../api/incomeCategoryService';

export default function IncomeCategoryPage() {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [openForm, setOpenForm]  = useState(false);
  const [editing, setEditing]    = useState(null);
  const [confirm, setConfirm]    = useState({ open:false, id:null });
  const [snack, setSnack]        = useState({ open:false, message:'', severity:'success' });
  const [search, setSearch]      = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchIncomeCategories();
      setRows(data);
    } catch {
      setSnack({ open:true, message:'Load failed', severity:'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(load, []);

  const handleSubmit = async (payload) => {
    try {
      if (editing) await updateIncomeCategory(editing.id, payload);
      else         await createIncomeCategory(payload);
      setSnack({ open:true, message:'Saved', severity:'success' });
      setOpenForm(false);
      load();
    } catch {
      setSnack({ open:true, message:'Save failed', severity:'error' });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteIncomeCategory(confirm.id);
      setSnack({ open:true, message:'Deleted', severity:'success' });
      load();
    } catch {
      setSnack({ open:true, message:'Delete failed', severity:'error' });
    } finally {
      setConfirm({ open:false, id:null });
    }
  };

  const filtered = rows.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { field:'name', headerName:'Category Name', flex:1 },
    {
      field:'actions', headerName:'Actions', flex:1,
      renderCell: ({ row }) => (
        <Box sx={{ display:'flex', gap:1 }}>
          <EditIcon onClick={() => { setEditing(row); setOpenForm(true); }} />
          <DeleteIcon onClick={() => setConfirm({ open:true, id:row.id })} />
        </Box>
      )
    }
  ];

  return (
    <Container maxWidth="sm" sx={{ mt:4 }}>
      <Typography variant="h4" gutterBottom>
        Income Categories
      </Typography>

      <Box sx={{ display:'flex', justifyContent:'space-between', mb:2 }}>
        <TextField
          label="Search"
          size="small"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <Button variant="contained" onClick={() => { setEditing(null); setOpenForm(true); }}>
          Add Category
        </Button>
      </Box>

      <Box sx={{ height: 400 }}>
        <DataGrid
          loading={loading}
          rows={filtered}
          columns={columns}
          getRowId={r => r.id}
          pageSize={5}
        />
      </Box>

      <IncomeCategoryFormDialog
        open={openForm}
        initialValues={editing}
        onClose={() => setOpenForm(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={confirm.open}
        title="Confirm Deletion"
        description="Delete this income category?"
        onClose={() => setConfirm({ open:false, id:null })}
        onConfirm={handleDelete}
      />

      <SnackbarAlert
        open={snack.open}
        severity={snack.severity}
        message={snack.message}
        onClose={() => setSnack(s => ({ ...s, open:false }))}
      />
    </Container>
  );
}
