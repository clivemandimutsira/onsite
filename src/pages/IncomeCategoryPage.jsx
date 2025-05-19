import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Button, Card, CardContent, TextField, List, ListItem, ListItemText, Divider
} from '@mui/material';
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

  return (
    <Container maxWidth="sm" sx={{ mt:4 }}>
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 3 }}>
        <CardContent sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'center' }}>
          <TextField
            label="Search"
            size="small"
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{ flex: 1, minWidth: 180, maxWidth: 400 }}
            fullWidth
          />
          <Button variant="contained" onClick={() => { setEditing(null); setOpenForm(true); }}>
            Add Category
          </Button>
        </CardContent>
      </Card>
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <List>
            {loading && (
              <Typography sx={{ p: 2 }}>Loading...</Typography>
            )}
            {!loading && filtered.length === 0 && (
              <Typography sx={{ p: 2 }}>No categories found.</Typography>
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
                      <EditIcon onClick={() => { setEditing(row); setOpenForm(true); }} />
                      <DeleteIcon onClick={() => setConfirm({ open:true, id:row.id })} />
                    </Box>
                  }
                >
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1">{row.name}</Typography>
                    }
                  />
                </ListItem>
                {idx < filtered.length - 1 && <Divider variant="fullWidth" />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>

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
