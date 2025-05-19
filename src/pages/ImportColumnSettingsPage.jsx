// src/pages/ImportColumnSettingsPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Typography, Box, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControlLabel, Checkbox, MenuItem, Select, InputLabel, FormControl, Card, CardContent, List, ListItem, ListItemText, Divider
} from '@mui/material';
import { EditIcon, DeleteIcon } from '../components/common/ActionIcons';
import ConfirmDialog from '../components/common/ConfirmDialog';
import SnackbarAlert from '../components/common/SnackbarAlert';
import {
  fetchImportColumns,
  createImportColumn,
  updateImportColumn,
  deleteImportColumn
} from '../api/importColumnService';
import {
  fetchTables,
  fetchTableColumns
} from '../api/settingService';

export default function ImportColumnSettingsPage() {
  const [tableList, setTableList]       = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [columnOptions, setColumnOptions] = useState([]);

  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState(null);

  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  // Load tables on mount
  useEffect(() => {
    fetchTables().then(setTableList).catch(console.error);
  }, []);

  // When table changes, reload columns + settings
  useEffect(() => {
    if (!selectedTable) return;

    fetchTableColumns(selectedTable)
      .then(setColumnOptions)
      .catch(console.error);

    loadSettings();
  }, [selectedTable]);

  // Fetch settings rows (server might filter by `table`)
  const loadSettings = useCallback(async () => {
    if (!selectedTable) return;
    setLoading(true);
    try {
      const data = await fetchImportColumns();
      setRows(data.filter(r => r.table_name === selectedTable));
    } finally {
      setLoading(false);
    }
  }, [selectedTable]);

  // dialog open for Add/Edit
  const handleOpen = (row = null) => {
    setEditing(row
      ? { ...row }
      : { table_name: selectedTable, column_name: '', label: '', required: false }
    );
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setEditing(null);
  };

  const handleSave = async () => {
    if (!editing.column_name) {
      setSnack({ open: true, message: 'Pick a column', severity: 'error' });
      return;
    }
    try {
      if (editing.id) {
        await updateImportColumn(editing.id, editing);
        setSnack({ open: true, message: 'Updated', severity: 'success' });
      } else {
        await createImportColumn(editing);
        setSnack({ open: true, message: 'Created', severity: 'success' });
      }
      handleClose();
      loadSettings();
    } catch {
      setSnack({ open: true, message: 'Save failed', severity: 'error' });
    }
  };

  const handleDelete = (id) => {
    setConfirm({ open: true, id });
  };

  const confirmDelete = async () => {
    try {
      await deleteImportColumn(confirm.id);
      setSnack({ open: true, message: 'Deleted', severity: 'success' });
      loadSettings();
    } catch {
      setSnack({ open: true, message: 'Delete failed', severity: 'error' });
    } finally {
      setConfirm({ open: false, id: null });
    }
  };

  const filteredRows = rows.filter(r =>
    r.column_name.toLowerCase().includes((editing?.search || '').toLowerCase()) ||
    r.label.toLowerCase().includes((editing?.search || '').toLowerCase())
  );

  return (
    <Container sx={{ mt: 4 }}>
      
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 3 }}>
        <CardContent sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 180, flex: 1 }}>
            <InputLabel>Table</InputLabel>
            <Select
              value={selectedTable}
              label="Table"
              onChange={e => setSelectedTable(e.target.value)}
            >
              {tableList.map(t => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {selectedTable && (
            <Button variant="contained" onClick={() => handleOpen()}>
              Add Column
            </Button>
          )}
        </CardContent>
      </Card>

      {selectedTable && (
        <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 3 }}>
          <CardContent>
            <List>
              {loading && (
                <Typography sx={{ p: 2 }}>Loading...</Typography>
              )}
              {!loading && rows.length === 0 && (
                <Typography sx={{ p: 2 }}>No columns configured for this table.</Typography>
              )}
              {rows.map((row, idx) => (
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
                        <EditIcon onClick={() => handleOpen(row)} sx={{ cursor: 'pointer', mr: 1 }} />
                        <DeleteIcon color="error" onClick={() => handleDelete(row.id)} sx={{ cursor: 'pointer' }} />
                      </Box>
                    }
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          <Typography variant="subtitle1" sx={{ minWidth: 120 }}>{row.column_name}</Typography>
                          <Typography variant="body2" color="text.secondary">{row.label}</Typography>
                          <Typography variant="body2" color="text.secondary">Required: {row.required ? 'Yes' : 'No'}</Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {idx < rows.length - 1 && <Divider variant="fullWidth" />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      <Dialog open={openDialog} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>
          {editing?.id ? 'Edit Column' : 'Add Column'} for {selectedTable}
        </DialogTitle>
        <DialogContent sx={{ display:'flex', flexDirection:'column', gap:2, mt:1 }}>
          <FormControl fullWidth>
            <InputLabel>Column Name</InputLabel>
            <Select
              value={editing?.column_name || ''}
              label="Column Name"
              onChange={e => setEditing(ev => ({ ...ev, column_name: e.target.value }))}
            >
              {columnOptions.map(cn => (
                <MenuItem key={cn} value={cn}>{cn}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Label"
            value={editing?.label || ''}
            onChange={e => setEditing(ev => ({ ...ev, label: e.target.value }))}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={Boolean(editing?.required)}
                onChange={e => setEditing(ev => ({ ...ev, required: e.target.checked }))}
              />
            }
            label="Required?"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {editing?.id ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ ...confirm, open: false })}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        description="Delete this column setting?"
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
