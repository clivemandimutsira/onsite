import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, Checkbox, IconButton, Tooltip, FormControlLabel, Card, CardContent, List, ListItem, ListItemText, Divider
} from '@mui/material';
import { EditIcon, DeleteIcon } from '../components/common/ActionIcons';
import ConfirmDialog from '../components/common/ConfirmDialog';
import SnackbarAlert from '../components/common/SnackbarAlert';
import { getMilestoneTemplates, createMilestoneTemplate, updateMilestoneTemplate, deleteMilestoneTemplate } from '../api/milestoneTemplates';
import SearchBar from '../components/SearchBar';

export default function MilestoneTemplateManager() {
  const [templates, setTemplates] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', required_for_promotion: false });
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });

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

  const handleOpen = (template = null) => {
    setSelectedTemplate(template);
    if (template) {
      setForm({
        name: template.name,
        description: template.description,
        required_for_promotion: template.required_for_promotion,
      });
    } else {
      setForm({ name: '', description: '', required_for_promotion: false });
    }
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

  const handleDelete = (id) => {
    setConfirmDialog({ open: true, id });
  };

  const confirmDeletion = async () => {
    try {
      await deleteMilestoneTemplate(confirmDialog.id);
      showSnackbar('Template deleted');
      loadTemplates();
    } catch {
      showSnackbar('Delete failed', 'error');
    } finally {
      setConfirmDialog({ open: false, id: null });
    }
  };

  const filteredTemplates = templates.filter((template) =>
    template.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container sx={{ mt: 4 }}>
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 3 }}>
        <CardContent sx={{ p: 2, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'center' }}>
          <Box sx={{ flex: 1 }}>
            <SearchBar search={search} setSearch={setSearch} placeholder="Search Templates" />
          </Box>
          <Button variant="contained" onClick={() => handleOpen()}>
            Create New Template
          </Button>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <List>
            {filteredTemplates.length === 0 && (
              <Typography sx={{ p: 2 }}>No templates found.</Typography>
            )}
            {filteredTemplates.map((template, idx) => (
              <React.Fragment key={template.id}>
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
                      <Tooltip title="Edit Template">
                        <EditIcon onClick={() => handleOpen(template)} />
                      </Tooltip>
                      <Tooltip title="Delete Template">
                        <DeleteIcon color="error" onClick={() => handleDelete(template.id)} />
                      </Tooltip>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        <Typography variant="subtitle1" sx={{ minWidth: 120 }}>{template.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{template.description}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Required for Promotion: {template.required_for_promotion ? 'Yes' : 'No'}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {idx < filteredTemplates.length - 1 && <Divider variant="fullWidth" />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>

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

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        onConfirm={confirmDeletion}
        title="Confirm Deletion"
        description="Are you sure you want to delete this milestone template?"
      />

      {/* Snackbar */}
      <SnackbarAlert
        open={snackbar.open}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        severity={snackbar.severity}
        message={snackbar.message}
      />
    </Container>
  );
}
