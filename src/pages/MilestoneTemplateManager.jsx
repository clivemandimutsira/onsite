import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, Checkbox, Snackbar, Alert, IconButton, Tooltip, Chip, Drawer, Divider,
  CircularProgress, FormControlLabel
} from '@mui/material';
import { Edit, Trash, Plus } from 'lucide-react'; // Lucide icons
import { DataGrid } from '@mui/x-data-grid';
import { getMilestoneTemplates, createMilestoneTemplate, updateMilestoneTemplate, deleteMilestoneTemplate } from '../api/milestoneTemplates';
import SearchBar from '../components/SearchBar';

export default function MilestoneTemplateManager() {
  const [templates, setTemplates] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', required_for_promotion: false });
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [permissionLoading, setPermissionLoading] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await getMilestoneTemplates();
      setTemplates(Array.isArray(data) ? data : []);
    } catch {
      showSnackbar('Failed to load milestone templates', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const handleOpen = (template = null) => {
    setSelectedTemplate(template);
    if (template) setForm({ name: template.name, description: template.description, required_for_promotion: template.required_for_promotion });
    else setForm({ name: '', description: '', required_for_promotion: false });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedTemplate(null);
  };

  const handleSubmit = async () => {
    try {
      if (selectedTemplate) {
        await updateMilestoneTemplate(selectedTemplate.id, form);
        showSnackbar('Template updated successfully');
      } else {
        await createMilestoneTemplate(form);
        showSnackbar('Template created successfully');
      }
      handleClose();
      loadTemplates();
    } catch {
      showSnackbar('Save operation failed', 'error');
    }
  };

  const handleDelete = async (templateId) => {
    if (!window.confirm('Are you sure you want to delete this milestone template?')) return;
    try {
      await deleteMilestoneTemplate(templateId);
      showSnackbar('Template deleted');
      loadTemplates();
    } catch {
      showSnackbar('Delete failed', 'error');
    }
  };

  const filteredTemplates = templates.filter(template =>
    template.name?.toLowerCase().includes(search.toLowerCase())
  );

  const templateColumns = [
    { field: 'name', headerName: 'Template Name', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 1 },
    {
      field: 'required_for_promotion',
      headerName: 'Required for Promotion',
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2">{params.row.required_for_promotion ? 'Yes' : 'No'}</Typography>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <>
          <Tooltip title="Edit Template">
            <IconButton onClick={() => handleOpen(params.row)}>
              <Edit size={20} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Template">
            <IconButton color="error" onClick={() => handleDelete(params.row.id)}>
              <Trash size={20} />
            </IconButton>
          </Tooltip>
        </>
      )
    }
  ];

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Milestone Template Manager</Typography>

      <Button startIcon={<Plus />} variant="contained" onClick={() => handleOpen()} sx={{ mb: 2 }}>
        Create New Template
      </Button>

      <SearchBar search={search} setSearch={setSearch} placeholder="Search Templates" />

      <DataGrid
        rows={filteredTemplates}
        columns={templateColumns}
        pageSize={10}
        autoHeight
        getRowId={(row) => row.id}
      />

      {/* Create/Edit Template Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{selectedTemplate ? 'Edit Template' : 'Create Template'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            label="Description"
            fullWidth
            margin="normal"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={form.required_for_promotion}
                onChange={(e) => setForm({ ...form, required_for_promotion: e.target.checked })}
              />
            }
            label="Required for Promotion"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {selectedTemplate ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
