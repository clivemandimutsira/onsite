import {
  Container, Typography, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, Checkbox, FormControlLabel, CircularProgress, Box, Snackbar, Alert,
  IconButton, Chip, Stack, Drawer, Divider, Switch, Tooltip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState, useContext } from 'react';
import { Edit, UserCog, Trash, Plus, X, Lock, LockOpen, Key, RefreshCw } from 'lucide-react'; // ✅ Add necessary icons
import { getUsers, registerUser, assignRoleToUser, removeRoleFromUser, updateUser, deleteUser, resetTempPassword, unlockUser, toggleActive } from '../api/users';
import { getRoles } from '../api/roles';
import SearchBar from '../components/SearchBar';
import { AuthContext } from '../contexts/AuthContext'; // ✅ Import context
import { useTheme } from '@mui/material/styles'; // Import useTheme

export default function Users() {
  const theme = useTheme(); // Access the theme
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

  const { permissions } = useContext(AuthContext); // ✅ Access permissions

  // ✅ Permission flags
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
        const res = await registerUser(form); // Register user
        showSnackbar(`User registered. Temp password: ${res.tempPassword}`); // Show temp password
      }
      handleCloseUserDialog();
      loadUsers();
    } catch {
      showSnackbar('Operation failed', 'error');
    }
  };
  



  const handleDeleteUser = async (user) => {
    if (window.confirm(`Are you sure you want to delete user ${user.email}?`)) {
      try {
        await deleteUser(user.id);
        showSnackbar('User deleted');
        loadUsers();
      } catch {
        showSnackbar('Delete failed', 'error');
      }
    }
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

  const handleResetPassword = async (userId) => {
    try {
      const res = await resetTempPassword(userId);
      showSnackbar(`Temp password: ${res.tempPassword}`);
    } catch {
      showSnackbar('Error resetting password', 'error');
    }
  };

  const handleUnlock = async (userId) => {
    try {
      await unlockUser(userId);
      showSnackbar('User unlocked');
    } catch {
      showSnackbar('Error unlocking user', 'error');
    }
  };

  const handleToggleActive = async (userId, isActive) => {
    try {
      await toggleActive(userId, isActive);
      showSnackbar('User status updated');
    } catch {
      showSnackbar('Error toggling active status', 'error');
    }
  };

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(search.toLowerCase())
  );

  const userColumns = [
    { field: 'email', headerName: 'Email', flex: 1 },
    {
      field: 'roles',
      headerName: 'Roles',
      flex: 2,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {params.row.roles?.length ? params.row.roles.map(role => (
            <Chip key={role.id} label={role.name} size="small" />
          )) : <Typography variant="body2" color="text.secondary">No Roles</Typography>}
        </Stack>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          {canResetPassword && (
            <Tooltip title="Reset Password">
              <IconButton
                onClick={() => handleResetPassword(params.row.id)}
                sx={{ color: theme.palette.success.main }} // Use theme color
                size="small"
              >
                <Key size={20} />
              </IconButton>
            </Tooltip>
          )}
          {canUnlock && (
            <Tooltip title="Unlock User">
              <IconButton
                onClick={() => handleUnlock(params.row.id)}
                sx={{ color: theme.palette.success.main }} // Use theme color
                size="small"
              >
                <LockOpen size={20} />
              </IconButton>
            </Tooltip>
          )}
          {canToggleActive && (
            <Tooltip title={params.row.is_active ? "Deactivate User" : "Activate User"}>
              <Switch
                checked={params.row.is_active}
                onChange={async (e) => {
                  const newStatus = e.target.checked;
                  try {
                    await handleToggleActive(params.row.id, newStatus);
                    setUsers((prevUsers) =>
                      prevUsers.map((user) =>
                        user.id === params.row.id ? { ...user, is_active: newStatus } : user
                      )
                    );
                    showSnackbar(
                      `User ${newStatus ? "activated" : "deactivated"} successfully`
                    );
                  } catch {
                    showSnackbar("Error updating user status", "error");
                  }
                }}
                size="small"
                sx={{
                  color: params.row.is_active
                    ? theme.palette.error.main
                    : theme.palette.success.main, // Use theme color
                }}
              />
            </Tooltip>
          )}
          {canAssignRoles && (
            <Tooltip title="Assign Roles">
              <IconButton
                size="small"
                sx={{ color: theme.palette.primary.main }} // Use theme color
                onClick={() => handleOpenRoleDrawer(params.row)}
              >
                <UserCog size={20} />
              </IconButton>
            </Tooltip>
          )}
          {canEdit && (
            <Tooltip title="Edit User">
              <IconButton
                size="small"
                sx={{ color: theme.palette.info.main }} // Use theme color
                onClick={() => handleOpenUserDialog(params.row)}
              >
                <Edit size={20} />
              </IconButton>
            </Tooltip>
          )}
          {canDelete && (
            <Tooltip title="Delete User">
              <IconButton
                size="small"
                sx={{ color: theme.palette.error.main }} // Use theme color
                onClick={() => handleDeleteUser(params.row)}
              >
                <Trash size={20} />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      )
    }
  ];

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Users Management</Typography>

      {canCreate && (
        <Button startIcon={<Plus size={20} />} variant="contained" sx={{ mb: 2 }} onClick={() => handleOpenUserDialog()}>
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
        sx={{ mt: 2 }}
      />

      {/* Dialog for User Registration or Editing */}
      <Dialog open={open} onClose={handleCloseUserDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Edit User' : 'Register New User'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Email"
            fullWidth
            margin="normal"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder={editing ? 'Leave blank to keep current password' : ''}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUserDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitUser}>{editing ? 'Save Changes' : 'Register User'}</Button>
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

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
