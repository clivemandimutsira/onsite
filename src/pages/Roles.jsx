import {
  Container, Typography, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, Checkbox, FormControlLabel, CircularProgress, Box, IconButton,
  Tooltip, Chip, Drawer, Divider
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Settings as SettingsIcon } from 'lucide-react';
import { PlusIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { EditIcon, DeleteIcon, CloseIcon, DownloadIcon } from '../components/common/ActionIcons';
import ConfirmDialog from '../components/common/ConfirmDialog';
import SnackbarAlert from '../components/common/SnackbarAlert';
import {
  getRoles, createRole, updateRole, deleteRole,
  addPermissionToRole, removePermissionFromRole
} from '../api/roles';
import { getPermissions } from '../api/permissions';
import SearchBar from '../components/SearchBar';

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [open, setOpen] = useState(false);
  const [openPermissions, setOpenPermissions] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [form, setForm] = useState({ name: '', description: '' });
  const [search, setSearch] = useState('');
  const [permissionLoading, setPermissionLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });

  useEffect(() => {
    loadRoles();
    loadPermissions();
  }, []);

  const loadRoles = async () => {
    try {
      const data = await getRoles();
      setRoles(Array.isArray(data) ? data : []);
    } catch {
      showSnackbar('Failed to load roles', 'error');
    }
  };

  const loadPermissions = async () => {
    try {
      const data = await getPermissions();
      setPermissions(Array.isArray(data) ? data : []);
    } catch {
      showSnackbar('Failed to load permissions', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const handleOpen = (role = null) => {
    setSelectedRole(role);
    setForm({
      name: role?.name || '',
      description: role?.description || ''
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRole(null);
  };

  const handleSubmit = async () => {
    try {
      if (selectedRole) {
        await updateRole(selectedRole.id, form);
        showSnackbar('Role updated successfully');
      } else {
        await createRole(form);
        showSnackbar('Role created successfully');
      }
      handleClose();
      loadRoles();
    } catch {
      showSnackbar('Save operation failed', 'error');
    }
  };

  const handleDelete = (roleId) => {
    setConfirmDialog({ open: true, id: roleId });
  };

  const confirmDeletion = async () => {
    try {
      await deleteRole(confirmDialog.id);
      showSnackbar('Role deleted');
      loadRoles();
    } catch {
      showSnackbar('Delete failed', 'error');
    } finally {
      setConfirmDialog({ open: false, id: null });
    }
  };

  const handleOpenPermissions = (role) => {
    setSelectedRole(role);
    setSelectedPermissions(role.permissions?.map(p => p.id) || []);
    setOpenPermissions(true);
  };

  const handleClosePermissions = () => {
    setSelectedRole(null);
    setOpenPermissions(false);
  };

  const handleTogglePermission = async (permissionId) => {
    if (!selectedRole) return;

    const isSelected = selectedPermissions.includes(permissionId);
    const newSelected = isSelected
      ? selectedPermissions.filter(id => id !== permissionId)
      : [...selectedPermissions, permissionId];
    setSelectedPermissions(newSelected);

    setPermissionLoading(true);
    try {
      if (isSelected) {
        await removePermissionFromRole(selectedRole.id, permissionId);
        showSnackbar('Permission removed');
      } else {
        await addPermissionToRole(selectedRole.id, permissionId);
        showSnackbar('Permission added');
      }
      await reloadRole(selectedRole.id);
    } catch {
      showSnackbar('Operation failed', 'error');
    } finally {
      setPermissionLoading(false);
    }
  };

  const reloadRole = async (roleId) => {
    try {
      const updatedRoles = await getRoles();
      const updatedRole = updatedRoles.find(r => r.id === roleId);
      if (updatedRole) {
        setSelectedRole(updatedRole);
        setSelectedPermissions(updatedRole.permissions?.map(p => p.id) || []);
        loadRoles();
      }
    } catch {
      showSnackbar('Failed to reload role', 'error');
    }
  };

  const filteredRoles = roles.filter(role =>
    role.name?.toLowerCase().includes(search.toLowerCase())
  );

  const roleColumns = [
    { field: 'name', headerName: 'Role Name', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 1 },
    {
      field: 'permissions',
      headerName: 'Permissions',
      flex: 2,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {params.row.permissions?.length ? params.row.permissions.map(permission => (
            <Chip key={permission.id} label={permission.name} size="small" />
          )) : <Typography variant="body2" color="text.secondary">No Permissions</Typography>}
        </Box>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <>
          <EditIcon onClick={() => handleOpen(params.row)} />
          <DeleteIcon onClick={() => handleDelete(params.row.id)} />
          <Tooltip title="Manage Permissions">
            <IconButton onClick={() => handleOpenPermissions(params.row)}>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </>
      )
    }
  ];

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Roles Management</Typography>

      <Button startIcon={<PlusIcon />} variant="contained" onClick={() => handleOpen()} sx={{ mb: 2 }}>
        Create New Role
      </Button>

      <SearchBar search={search} setSearch={setSearch} placeholder="Search Roles" />

      <DataGrid
        rows={filteredRoles}
        columns={roleColumns}
        pageSize={10}
        autoHeight
        getRowId={(row) => row.id}
      />

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{selectedRole ? 'Edit Role' : 'Create Role'}</DialogTitle>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {selectedRole ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Drawer anchor="right" open={openPermissions} onClose={handleClosePermissions}>
        <Box sx={{ width: { xs: 300, sm: 400 }, p: 2 }}>
          <Typography variant="h6" gutterBottom>Manage Permissions</Typography>
          <Divider sx={{ mb: 2 }} />
          {permissionLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            permissions.map(permission => (
              <FormControlLabel
                key={permission.id}
                control={
                  <Checkbox
                    checked={selectedPermissions.includes(permission.id)}
                    onChange={() => handleTogglePermission(permission.id)}
                    sx={{
                      transition: 'transform 0.2s ease',
                      '&.Mui-checked': { transform: 'scale(1.2)' }
                    }}
                  />
                }
                label={permission.name}
              />
            ))
          )}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <CloseIcon onClick={handleClosePermissions} />
          </Box>
        </Box>
      </Drawer>

      <ConfirmDialog
        open={confirmDialog?.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        onConfirm={confirmDeletion}
        title="Confirm Deletion"
        description="Are you sure you want to delete this role?"
      />

      <SnackbarAlert
        open={snackbar.open}
        onClose={handleCloseSnackbar}
        severity={snackbar.severity}
        message={snackbar.message}
      />
    </Container>
  );
}
