// src/pages/Users.jsx

import {
  Container, Typography, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, Checkbox, FormControlLabel, CircularProgress, Box, IconButton, Chip, Stack, Drawer, Divider, Switch, Tooltip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState, useContext } from 'react';
import { PlusIcon, UserCogIcon, LockOpenIcon, KeyIcon } from 'lucide-react';
import { EditIcon, DeleteIcon, CloseIcon } from '../components/common/ActionIcons';
import SnackbarAlert from '../components/common/SnackbarAlert';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { getUsers, registerUser, assignRoleToUser, removeRoleFromUser, updateUser, deleteUser, resetTempPassword, unlockUser, toggleActive } from '../api/users';
import { getRoles } from '../api/roles';
import SearchBar from '../components/SearchBar';
import { AuthContext } from '../contexts/AuthContext';
import { useTheme } from '@mui/material/styles';

export default function Users() {
  const theme = useTheme();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [open, setOpen] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [tempSelectedRoles, setTempSelectedRoles] = useState([]);
  const [form, setForm] = useState({ email: '', password: '' });
  const [editing, setEditing] = useState(false);
  const [search, setSearch] = useState('');
  const [roleLoading, setRoleLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, onConfirm: null });

  const { permissions } = useContext(AuthContext);

  const canCreate = permissions.includes('create_user') || permissions.includes('manage_users');
  const canEdit = permissions.includes('edit_user') || permissions.includes('manage_users');
  const canDelete = permissions.includes('delete_user') || permissions.includes('manage_users');
  const canAssignRoles = permissions.includes('assign_roles') || permissions.includes('manage_users');
  const canResetPassword = permissions.includes('manage_users');
  const canUnlock = permissions.includes('manage_users');
  const canToggleActive = permissions.includes('manage_users');

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      showSnackbar('Failed to load users', 'error');
    }
  };

  const loadRoles = async () => {
    try {
      const data = await getRoles();
      setRoles(Array.isArray(data) ? data : []);
    } catch {
      showSnackbar('Failed to load roles', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const handleOpenUserDialog = (user = null) => {
    if (user) {
      setForm({ email: user.email, password: '' });
      setSelectedUser(user);
      setEditing(true);
    } else {
      setForm({ email: '', password: '' });
      setEditing(false);
    }
    setOpen(true);
  };

  const handleCloseUserDialog = () => {
    setOpen(false);
    setSelectedUser(null);
  };

  const handleSubmitUser = async () => {
    try {
      if (editing) {
        await updateUser(selectedUser.id, form);
        showSnackbar('User updated successfully');
      } else {
        const res = await registerUser(form);
        showSnackbar(`User registered. Temp password: ${res.tempPassword}`);
      }
      handleCloseUserDialog();
      loadUsers();
    } catch {
      showSnackbar('Operation failed', 'error');
    }
  };

  const handleDeleteUser = (user) => {
    setConfirmDialog({
      open: true,
      onConfirm: async () => {
        try {
          await deleteUser(user.id);
          showSnackbar('User deleted');
          loadUsers();
        } catch {
          showSnackbar('Delete failed', 'error');
        } finally {
          setConfirmDialog({ open: false, onConfirm: null });
        }
      },
    });
  };

  const handleOpenRoleDrawer = (user) => {
    setSelectedUser(user);
    setTempSelectedRoles(user.roles?.map(r => r.id) || []);
    setOpenDrawer(true);
  };

  const handleCloseRoleDrawer = () => {
    setSelectedUser(null);
    setTempSelectedRoles([]);
    setOpenDrawer(false);
  };

  const handleToggleRole = (roleId) => {
    setTempSelectedRoles(prev =>
      prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]
    );
  };

  const handleSaveRoles = async () => {
    if (!selectedUser) return;
    setRoleLoading(true);
    try {
      const currentRoles = selectedUser.roles?.map(r => r.id) || [];
      const rolesToAdd = tempSelectedRoles.filter(id => !currentRoles.includes(id));
      const rolesToRemove = currentRoles.filter(id => !tempSelectedRoles.includes(id));

      await Promise.all([
        ...rolesToAdd.map(id => assignRoleToUser(selectedUser.id, id)),
        ...rolesToRemove.map(id => removeRoleFromUser(selectedUser.id, id)),
      ]);

      showSnackbar('Roles updated successfully');
      loadUsers();
      handleCloseRoleDrawer();
    } catch {
      showSnackbar('Failed to update roles', 'error');
    } finally {
      setRoleLoading(false);
    }
  };

  const handleToggleActiveStatus = async (user) => {
    try {
      await toggleActive(user.id, !user.is_active);
      showSnackbar(`User ${user.is_active ? 'deactivated' : 'activated'} successfully.`);
      loadUsers();
    } catch {
      showSnackbar('Failed to update user status.', 'error');
    }
  };

  const handleResetPassword = async (userId) => {
    try {
      const tempPassword = await resetTempPassword(userId);
      showSnackbar(`Temporary password reset. New temp password: ${tempPassword}`);
    } catch {
      showSnackbar('Failed to reset password', 'error');
    }
  };

  const handleUnlock = async (userId) => {
    try {
      await unlockUser(userId);
      showSnackbar('User account unlocked successfully.');
      loadUsers();
    } catch {
      showSnackbar('Failed to unlock user.', 'error');
    }
  };

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(search.toLowerCase())
  );

  const userColumns = [
    { field: 'email', headerName: 'Email', flex: 2, minWidth: 200 },
    {
      field: 'roles',
      headerName: 'Roles',
      flex: 3,
      minWidth: 300,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {params.row.roles?.length ? (
            params.row.roles.map((role) => (
              <Chip
                key={role.id}
                label={role.name}
                size="small"
                sx={{ maxWidth: '100%' }}
              />
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              No Roles
            </Typography>
          )}
        </Stack>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 2,
      minWidth: 300,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} justifyContent="center">
          {canResetPassword && (
            <Tooltip title="Reset Password">
              <IconButton
                onClick={() => handleResetPassword(params.row.id)}
                sx={{ color: theme.palette.success.main }}
              >
                <KeyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {canToggleActive && (
            <Tooltip title={params.row.is_active ? 'Deactivate User' : 'Activate User'}>
              <Switch
                checked={params.row.is_active}
                onChange={() => handleToggleActiveStatus(params.row)}
                color="primary"
              />
            </Tooltip>
          )}
          {canUnlock && (
            <Tooltip title="Unlock User">
              <IconButton
                onClick={() => handleUnlock(params.row.id)}
                sx={{ color: theme.palette.success.main }}
              >
                <LockOpenIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {canAssignRoles && (
            <Tooltip title="Assign Roles">
              <IconButton
                onClick={() => handleOpenRoleDrawer(params.row)}
                sx={{ color: theme.palette.primary.main }}
              >
                <UserCogIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {canEdit && (
            <Tooltip title="Edit User">
              <EditIcon onClick={() => handleOpenUserDialog(params.row)} />
            </Tooltip>
          )}
          {canDelete && (
            <Tooltip title="Delete User">
              <DeleteIcon onClick={() => handleDeleteUser(params.row)} />
            </Tooltip>
          )}
        </Stack>
      ),
    },
  ];

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Users Management</Typography>

      {canCreate && (
        <Button startIcon={<PlusIcon />} variant="contained" sx={{ mb: 2 }} onClick={() => handleOpenUserDialog()}>
          Add New User
        </Button>
      )}

      <SearchBar search={search} setSearch={setSearch} placeholder="Search Users" />

      <DataGrid
        rows={filteredUsers}
        columns={userColumns}
        pageSize={10}
        autoHeight
        disableSelectionOnClick
        getRowId={(row) => row.id}
        sx={{
          mt: 2,
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: theme.palette.grey[200],
          },
          '& .MuiDataGrid-cell': {
            whiteSpace: 'normal',
            wordWrap: 'break-word',
          },
        }}
      />

      {/* Dialog for User Registration or Editing */}
      <Dialog open={open} onClose={handleCloseUserDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {editing ? 'Edit User' : 'Register New User'}
          <CloseIcon onClick={handleCloseUserDialog} />
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Email"
            fullWidth
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder={editing ? 'Leave blank to keep current password' : ''}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUserDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitUser}>
            {editing ? 'Save Changes' : 'Register User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Role Assignment Drawer */}
      <Drawer anchor="right" open={openDrawer} onClose={handleCloseRoleDrawer} sx={{ width: 350 }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Assign Roles to {selectedUser?.email}</Typography>
          <Divider />
          {roleLoading ? (
            <CircularProgress sx={{ mt: 2 }} />
          ) : (
            <Box sx={{ mt: 2 }}>
              {roles.map(role => (
                <FormControlLabel
                  key={role.id}
                  control={
                    <Checkbox
                      checked={tempSelectedRoles.includes(role.id)}
                      onChange={() => handleToggleRole(role.id)}
                    />
                  }
                  label={role.name}
                />
              ))}
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleSaveRoles}
                sx={{ mt: 2 }}
              >
                Save Roles
              </Button>
            </Box>
          )}
        </Box>
      </Drawer>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title="Confirm Deletion"
        content="Are you sure you want to delete this user?"
        onClose={() => setConfirmDialog({ open: false, onConfirm: null })}
        onConfirm={confirmDialog.onConfirm}
      />

      {/* Snackbar */}
      <SnackbarAlert
        open={snackbar.open}
        onClose={handleCloseSnackbar}
        severity={snackbar.severity}
        message={snackbar.message}
      />
    </Container>
  );
}
