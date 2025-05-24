import {
  Container, Typography, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, CircularProgress, Box, IconButton, Tooltip, Card, CardContent, Divider, Grid,
  Chip, Collapse
} from '@mui/material';
import { PlusIcon , SettingsIcon} from 'lucide-react';
import { useEffect, useState } from 'react';
import { EditIcon, DeleteIcon,  } from '../components/common/ActionIcons';
import ConfirmDialog from '../components/common/ConfirmDialog';
import SnackbarAlert from '../components/common/SnackbarAlert';
import {
  getRoles, createRole, updateRole, deleteRole,
  addPermissionToRole, removePermissionFromRole
} from '../api/roles';
import { getPermissions } from '../api/permissions';
import SearchIcon from '@mui/icons-material/Search'; // Add this import at the top

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

  const [expandedPermissionCategory, setExpandedPermissionCategory] = useState(null);

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

  const handleAddAllPermissions = async () => {
    if (!selectedRole) return;

    setPermissionLoading(true);
    try {
      await Promise.all(permissions.map(permission =>
        addPermissionToRole(selectedRole.id, permission.id)
      ));
      showSnackbar('All permissions added');
      await reloadRole(selectedRole.id);
    } catch {
      showSnackbar('Add all permissions failed', 'error');
    } finally {
      setPermissionLoading(false);
    }
  };

  const handleRevokeAllPermissions = async () => {
    if (!selectedRole) return;

    setPermissionLoading(true);
    try {
      await Promise.all(permissions.map(permission =>
        removePermissionFromRole(selectedRole.id, permission.id)
      ));
      showSnackbar('All permissions revoked');
      await reloadRole(selectedRole.id);
    } catch {
      showSnackbar('Revoke all permissions failed', 'error');
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

  return (
    <Container sx={{ mt: 4 }}>
      <Card sx={{ mb: 2, boxShadow: 3 }}>
        <CardContent
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 2,
            flexWrap: { xs: 'wrap', sm: 'nowrap' },
          }}
        >
          <TextField
            placeholder="Search Roles"
            value={search}
            onChange={e => setSearch(e.target.value)}
            size="small"
            variant="outlined"
            sx={{ flex: 1, minWidth: 200 }}
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
              ),
            }}
          />
          <Button
            startIcon={<PlusIcon />}
            variant="contained"
            onClick={() => handleOpen()}
            sx={{
              whiteSpace: 'nowrap',
              fontWeight: 600,
              px: 3,
              boxShadow: 1,
            }}
          >
            Create New Role
          </Button>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        {filteredRoles.map((role) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            key={role.id}
            sx={{ mb: 2 }}
          >
            <Card sx={{ boxShadow: 3, borderRadius: 2, transition: 'transform 0.2s ease' }} hoverable>
              <CardContent>
                <Typography variant="h6">{role.name}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {role.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Tooltip title="Edit">
                    <IconButton
                      onClick={() => handleOpen(role)}
                      color="primary"
                      sx={{ flex: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      onClick={() => handleDelete(role.id)}
                      color="error"
                      sx={{ flex: 1 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Permissions">
                    <IconButton
                      onClick={() => handleOpenPermissions(role)}
                      color="warning"
                      sx={{ flex: 1 }}
                    >
                      <SettingsIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

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

      <Dialog open={openPermissions} onClose={handleClosePermissions} fullWidth maxWidth="sm">
        <DialogTitle>Manage Permissions</DialogTitle>
        <DialogContent>
          {permissionLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              <Button variant="outlined" onClick={handleAddAllPermissions} sx={{ mb: 2, width: '100%' }}>
                Add All Permissions
              </Button>
              <Button variant="outlined" onClick={handleRevokeAllPermissions} sx={{ mb: 2, width: '100%' }}>
                Revoke All Permissions
              </Button>

              {permissions.map(permission => (
                <Card sx={{ mb: 2, borderRadius: 1 }} key={permission.id}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body1">{permission.name}</Typography>
                    <Button
                      variant={selectedPermissions.includes(permission.id) ? "contained" : "outlined"}
                      color={selectedPermissions.includes(permission.id) ? "primary" : "default"}
                      onClick={() => handleTogglePermission(permission.id)}
                    >
                      {selectedPermissions.includes(permission.id) ? "Remove" : "Add"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePermissions}>Close</Button>
        </DialogActions>
      </Dialog>

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
