import {
  Container, Typography, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, Checkbox, FormControlLabel, CircularProgress, Box, IconButton, Snackbar, Alert, Tooltip, Chip, Drawer, Divider
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Edit, Trash, Settings,Plus } from 'lucide-react'; // Lucide icons
import { useEffect, useState } from 'react';
import { getRoles, createRole, updateRole, deleteRole, addPermissionToRole, removePermissionFromRole } from '../api/roles';
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
    if (role) setForm({ name: role.name, description: role.description || '' });
    else setForm({ name: '', description: '' });
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

  const handleDelete = async (roleId) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;
    try {
      await deleteRole(roleId);
      showSnackbar('Role deleted');
      loadRoles();
    } catch {
      showSnackbar('Delete failed', 'error');
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

    // Instant local update
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
      await reloadRole(selectedRole.id); // Reload updated role
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
          <Tooltip title="Edit Role">
            <IconButton onClick={() => handleOpen(params.row)}>
              <Edit size={20} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Role">
            <IconButton color="error" onClick={() => handleDelete(params.row.id)}>
              <Trash size={20} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Manage Permissions">
            <IconButton onClick={() => handleOpenPermissions(params.row)}>
              <Settings size={20} />
            </IconButton>
          </Tooltip>
        </>
      )
    }
  ];

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Roles Management</Typography>

      <Button  startIcon={<Plus />} variant="contained" onClick={() => handleOpen()} sx={{ mb: 2 }}>
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

      {/* Create/Edit Role Dialog */}
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

      {/* Manage Permissions Drawer */}
      <Drawer
        anchor="right"
        open={openPermissions}
        onClose={handleClosePermissions}
        sx={{ zIndex: (theme) => theme.zIndex.modal + 1 }}
      >
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
                      '&.Mui-checked': {
                        transform: 'scale(1.2)',
                      }
                    }}
                  />
                }
                label={permission.name}
                sx={{
                  transition: 'color 0.3s',
                  color: selectedPermissions.includes(permission.id) ? 'primary.main' : 'text.primary'
                }}
              />
            ))
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button variant="outlined" onClick={handleClosePermissions}>Close</Button>
          </Box>
        </Box>
      </Drawer>

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
