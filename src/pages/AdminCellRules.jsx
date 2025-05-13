import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Box, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField,
  Tooltip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { EditIcon, DeleteIcon } from '../components/common/ActionIcons';
import ConfirmDialog from '../components/common/ConfirmDialog';
import SnackbarAlert from '../components/common/SnackbarAlert';

import {
  getRules, createRule, updateRule, deleteRule
} from '../api/rulesService';

import {
  getDesignations, createDesignation, updateDesignation, deleteDesignation
} from '../api/designationsService';

import {
  getPromotionRule, updatePromotionRule
} from '../api/promotionRuleService';

export default function AdminCellRules() {
  const [rules, setRules] = useState([]);
  const [desigs, setDesigs] = useState([]);
  const [promotionRule, setPromotionRule] = useState({});

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('rule'); // 'rule' or 'desig'
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({});
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null, type: '' });

  useEffect(() => {
    loadRules();
    loadDesigs();
    loadPromotion();
  }, []);

  const loadRules = () => getRules().then(setRules);
  const loadDesigs = () => getDesignations().then(setDesigs);
  const loadPromotion = () => getPromotionRule().then(setPromotionRule);

  const handleOpen = (type, item = null) => {
    setMode(type);
    setEditItem(item);
    setForm(item || (type === 'rule'
      ? { min_size: '', max_size: '', split_into: '', designation_level: '' }
      : { name: '', rank: '' }));
    setOpen(true);
  };

  const handleClose = () => setOpen(false);
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handlePromoChange = e => setPromotionRule(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (mode === 'rule') {
      if (editItem) await updateRule(editItem.id, form);
      else await createRule(form);
      loadRules();
      showSnack(editItem ? 'Rule updated' : 'Rule added');
    } else {
      if (editItem) await updateDesignation(editItem.id, form);
      else await createDesignation(form);
      loadDesigs();
      showSnack(editItem ? 'Designation updated' : 'Designation added');
    }
    handleClose();
  };

  const handleDelete = (id, type) => {
    setConfirmDialog({ open: true, id, type });
  };

  const confirmDeletion = async () => {
    const { id, type } = confirmDialog;
    if (type === 'rule') {
      await deleteRule(id);
      loadRules();
      showSnack('Rule deleted');
    } else {
      await deleteDesignation(id);
      loadDesigs();
      showSnack('Designation deleted');
    }
    setConfirmDialog({ open: false, id: null, type: '' });
  };

  const showSnack = (message, severity = 'success') => {
    setSnack({ open: true, message, severity });
  };

  const savePromotionRule = async () => {
    const updated = await updatePromotionRule(promotionRule.id, promotionRule);
    setPromotionRule(updated);
    showSnack('Promotion rule updated');
  };

  const ruleCols = [
    { field: 'min_size', headerName: 'Min Size', width: 100 },
    { field: 'max_size', headerName: 'Max Size', width: 100 },
    { field: 'split_into', headerName: 'Split Into', width: 100 },
    { field: 'designation_level', headerName: 'Designation', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: (params) => (
        <>
          <Tooltip title="Edit Rule">
            <EditIcon onClick={() => handleOpen('rule', params.row)} />
          </Tooltip>
          <Tooltip title="Delete Rule">
            <DeleteIcon color="error" onClick={() => handleDelete(params.row.id, 'rule')} />
          </Tooltip>
        </>
      )
    }
  ];

  const desigCols = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'rank', headerName: 'Rank', width: 100 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: (params) => (
        <>
          <Tooltip title="Edit Designation">
            <EditIcon onClick={() => handleOpen('desig', params.row)} />
          </Tooltip>
          <Tooltip title="Delete Designation">
            <DeleteIcon color="error" onClick={() => handleDelete(params.row.id, 'desig')} />
          </Tooltip>
        </>
      )
    }
  ];

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4">Admin: Cell Rules & Designations</Typography>
      <Box sx={{ display: 'flex', gap: 2, my: 2 }}>
        <Button variant="contained" onClick={() => handleOpen('rule')}>Add Rule</Button>
        <Button variant="contained" onClick={() => handleOpen('desig')}>Add Designation</Button>
      </Box>

      {/* Split Rules */}
      <Box sx={{ height: 300, mb: 4 }}>
        <Typography variant="h6">Split Rules</Typography>
        <DataGrid rows={rules} columns={ruleCols} getRowId={r => r.id} />
      </Box>

      {/* Designations */}
      <Box sx={{ height: 300, mb: 4 }}>
        <Typography variant="h6">Designations</Typography>
        <DataGrid rows={desigs} columns={desigCols} getRowId={r => r.id} />
      </Box>

      {/* Promotion Rule */}
      <Box sx={{ my: 4 }}>
        <Typography variant="h6">Promotion Rule</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 1 }}>
          <TextField
            label="Child Count Required"
            name="child_count_required"
            value={promotionRule.child_count_required || ''}
            onChange={handlePromoChange}
          />
          <TextField
            label="Max Members Per Group"
            name="max_members_per_group"
            value={promotionRule.max_members_per_group || ''}
            onChange={handlePromoChange}
          />
          <TextField
            label="Designation Name"
            name="designation_name"
            value={promotionRule.designation_name || ''}
            onChange={handlePromoChange}
          />
          <Button variant="outlined" onClick={savePromotionRule}>Save</Button>
        </Box>
      </Box>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editItem ? 'Edit' : 'Add'} {mode === 'rule' ? 'Rule' : 'Designation'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {mode === 'rule' ? (
            <>
              <TextField label="Min Size" name="min_size" value={form.min_size} onChange={handleChange} />
              <TextField label="Max Size" name="max_size" value={form.max_size} onChange={handleChange} />
              <TextField label="Split Into" name="split_into" value={form.split_into} onChange={handleChange} />
              <TextField label="Designation Level" name="designation_level" value={form.designation_level} onChange={handleChange} />
            </>
          ) : (
            <>
              <TextField label="Name" name="name" value={form.name} onChange={handleChange} />
              <TextField label="Rank" name="rank" value={form.rank} onChange={handleChange} />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>{editItem ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        onConfirm={confirmDeletion}
        title="Confirm Deletion"
        description={`Are you sure you want to delete this ${confirmDialog.type === 'rule' ? 'rule' : 'designation'}?`}
      />

      {/* Feedback Snackbar */}
      <SnackbarAlert
        open={snack.open}
        onClose={() => setSnack({ ...snack, open: false })}
        severity={snack.severity}
        message={snack.message}
      />
    </Container>
  );
}
