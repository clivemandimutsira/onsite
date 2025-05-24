// src/pages/Users.jsx

import React from 'react';
import {
  Container,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Box,
  IconButton,
  Chip,
  Stack,
  Drawer,
  Divider,
  Switch,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ListItemAvatar,
  Avatar,
  Card, // <-- add this import
  Pagination,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState, useContext } from 'react';
import {
  Plus as PlusIcon,
  UserCog as UserCogIcon,
  LockOpen as LockOpenIcon,
  Key as KeyIcon,
  Download as DownloadIcon,
} from 'lucide-react';
import { EditIcon, DeleteIcon, CloseIcon } from '../components/common/ActionIcons';
import SnackbarAlert from '../components/common/SnackbarAlert';
import ConfirmDialog from '../components/common/ConfirmDialog';
import {
  getUsers,
  registerUser,
  assignRoleToUser,
  removeRoleFromUser,
  updateUser,
  deleteUser,
  resetTempPassword,
  unlockUser,
  toggleActive,
} from '../api/users';
import { getRoles } from '../api/roles';
import SearchBar from '../components/SearchBar';
import { AuthContext } from '../contexts/AuthContext';
import { useTheme } from '@mui/material/styles';

export default function Users() {
  const theme = useTheme();
  const { permissions } = useContext(AuthContext);

  // data + UI state
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [open, setOpen] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [tempSelectedRoles, setTempSelectedRoles] = useState([]);
  const [form, setForm] = useState({ email: '', password: '' });
  const [editing, setEditing] = useState(false);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [roleLoading, setRoleLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, onConfirm: null });
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10; // or any number you prefer

  // permissions
  const canCreate     = permissions.includes('create_user')   || permissions.includes('manage_users');
  const canEdit       = permissions.includes('edit_user')     || permissions.includes('manage_users');
  const canDelete     = permissions.includes('delete_user')   || permissions.includes('manage_users');
  const canAssignRoles= permissions.includes('assign_roles')  || permissions.includes('manage_users');
  const canResetPassword = permissions.includes('manage_users');
  const canUnlock       = permissions.includes('manage_users');
  const canToggleActive = permissions.includes('manage_users');

  // load on mount
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

  const showSnackbar = (message, severity = 'success') =>
    setSnackbar({ open: true, message, severity });

  const handleCloseSnackbar = () =>
    setSnackbar({ ...snackbar, open: false });

  // User dialog
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

  // Delete
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

  // Roles drawer
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
      const current = selectedUser.roles?.map(r => r.id) || [];
      const toAdd    = tempSelectedRoles.filter(id => !current.includes(id));
      const toRemove = current.filter(id => !tempSelectedRoles.includes(id));

      await Promise.all([
        ...toAdd.map(id => assignRoleToUser(selectedUser.id, id)),
        ...toRemove.map(id => removeRoleFromUser(selectedUser.id, id)),
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

  // Active toggle, reset, unlock
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

  // Export stub
  const exportUsers = () => {
    // TODO: call your API endpoint that returns CSV, then trigger download.
    showSnackbar('Export triggered (stub)');
  };

  // Combined client-side filters
  let filtered = users;
  if (search) {
    filtered = filtered.filter(u =>
      u.email.toLowerCase().includes(search.toLowerCase())
    );
  }
  if (filterRole) {
    filtered = filtered.filter(u =>
      u.roles.some(r => r.id === filterRole)
    );
  }
  if (filterStatus) {
    filtered = filtered.filter(u =>
      (u.is_active ? 'Active' : u.is_pending ? 'Pending' : 'Inactive') === filterStatus
    );
  }

  // Pagination
  const paginatedUsers = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // Checkbox handler
  const handleToggleSelect = (userId) => {
    setSelectedUserIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <Container sx={{ mt: 4 }}>
      

      {/* === Toolbar matching your design === */}
      <Card
        variant="outlined"
        sx={{
          mb: 3,
          borderRadius: 2,
          boxShadow: 1,
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        {/* Left: filters + search */}
        <Stack direction="row" spacing={2} alignItems="center" flex={1}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Role</InputLabel>
            <Select
              label="Role"
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
            >
              <MenuItem value="">
                <em>All Roles</em>
              </MenuItem>
              {roles.map(r => (
                <MenuItem key={r.id} value={r.id}>
                  {r.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <MenuItem value="">
                <em>All Status</em>
              </MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </Select>
          </FormControl>

          <SearchBar
            search={search}
            setSearch={setSearch}
            placeholder="Search User"
            sx={{ width: 220 }}
          />
        </Stack>

        {/* Right: add button */}
        {canCreate && (
          <Button
            variant="contained"
            startIcon={<PlusIcon />}
            onClick={() => handleOpenUserDialog()}
            sx={{ minWidth: 150, whiteSpace: 'nowrap' }}
          >
            Add New User
          </Button>
        )}
      </Card>

      {/* === User List === */}
      <Card
        variant="outlined"
        sx={{
          p: 0,
          mb: 3,
          borderRadius: 2,
          boxShadow: 1,
          overflow: 'hidden',
        }}
      >
        <List disablePadding>
          {paginatedUsers.map((user, idx) => (
            <React.Fragment key={user.id}>
              <ListItem
                secondaryAction={
                  <Stack direction="row" spacing={1} alignItems="center">
                    {canResetPassword && (
                      <Tooltip title="Reset Password">
                        <IconButton
                          onClick={() => handleResetPassword(user.id)}
                          sx={{ color: theme.palette.mode === 'dark' ? theme.palette.grey[100] : theme.palette.grey[600] }}
                        >
                          <KeyIcon fontSize={18} />
                        </IconButton>
                      </Tooltip>
                    )}
                    {canToggleActive && (
                      <Tooltip title={user.is_active ? 'Deactivate User' : 'Activate User'}>
                        <Switch
                          checked={user.is_active}
                          onChange={() => handleToggleActiveStatus(user)}
                          size="small"
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: theme.palette.mode === 'dark' ? theme.palette.success.light : theme.palette.success.main,
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: theme.palette.mode === 'dark' ? theme.palette.success.light : theme.palette.success.main,
                            },
                          }}
                        />
                      </Tooltip>
                    )}
                    {canUnlock && (
                      <Tooltip >
                        <IconButton
                          onClick={() => handleUnlock(user.id)}
                          sx={{ color: theme.palette.mode === 'dark' ? theme.palette.grey[100] : theme.palette.grey[600] }}
                        >
                          <LockOpenIcon fontSize={18} />
                        </IconButton>
                      </Tooltip>
                    )}
                    {canAssignRoles && (
                      <Tooltip>
                        <IconButton
                          onClick={() => handleOpenRoleDrawer(user)}
                          sx={{ color: theme.palette.mode === 'dark' ? theme.palette.grey[100] : theme.palette.grey[600] }}
                        >
                          <UserCogIcon fontSize={18} />
                        </IconButton>
                      </Tooltip>
                    )}
                    {canEdit && (
                      <Tooltip>
                        <IconButton
                          onClick={() => handleOpenUserDialog(user)}
                          sx={{ color: theme.palette.mode === 'dark' ? theme.palette.grey[100] : theme.palette.grey[600] }}
                        >
                          <EditIcon fontSize={18} />
                        </IconButton>
                      </Tooltip>
                    )}
                    {canDelete && (
                      <Tooltip>
                        <IconButton
                          onClick={() => handleDeleteUser(user)}
                          sx={{ color: theme.palette.mode === 'dark' ? theme.palette.grey[100] : theme.palette.grey[600] }}
                        >
                          <DeleteIcon fontSize={18} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Stack>
                }
                sx={{
                  px: 2,
                  py: 1.5,
                  '&:not(:last-child)': {
                    borderBottom: `1px solid ${theme.palette.divider}`,
                  },
                  alignItems: 'center', // <-- Ensures vertical alignment of icons and content
                }}
              >
                <ListItemAvatar>
                  <Checkbox
                    edge="start"
                    checked={selectedUserIds.includes(user.id)}
                    onChange={() => handleToggleSelect(user.id)}
                    tabIndex={-1}
                    disableRipple
                    sx={{
                      '& .MuiSvgIcon-root': {
                        borderRadius: '2px', // More rounded
                      },
                    }}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={2} alignItems="center">
                      {/* Add Avatar before email */}
                      <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                        {user.email?.[0]?.toUpperCase() || '?'}
                      </Avatar>
                      <Typography sx={{ minWidth: 200 }}>{user.email}</Typography>
                      <Stack direction="row" spacing={1}>
                        {user.roles?.length
                          ? user.roles.map(role => (
                              <Chip
                                key={role.id}
                                label={role.name}
                                size="small"
                                sx={{ maxWidth: '100%' }}
                              />
                            ))
                          : (
                            <Typography variant="body2" color="text.secondary">
                              No Roles
                            </Typography>
                          )}
                      </Stack>
                      <Chip
                        label={
                          user.is_active
                            ? 'Active'
                            : user.is_pending
                            ? 'Pending'
                            : 'Inactive'
                        }
                        size="small"
                        variant="filled"
                        color={
                          user.is_active
                            ? 'success'
                            : user.is_pending
                            ? 'warning'
                            : 'default'
                        }
                        sx={{ ml: 1, minWidth: 70, maxWidth: 80, px: 0.5, fontSize: 13 }} // reduced width and margin
                      />
                    </Stack>
                  }
                />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <Pagination
            count={Math.ceil(filtered.length / rowsPerPage)}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Box>
      </Card>

      {/* === Register / Edit Dialog === */}
      <Dialog open={open} onClose={handleCloseUserDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {editing ? 'Edit User' : 'Register New User'}
          <IconButton onClick={handleCloseUserDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Email"
            fullWidth
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
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

      {/* === Role Assignment Drawer === */}
      <Drawer anchor="right" open={openDrawer} onClose={handleCloseRoleDrawer}>
        <Box sx={{ width: 300, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Assign Roles to {selectedUser?.email}
          </Typography>
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
                fullWidth
                sx={{ mt: 2 }}
                onClick={handleSaveRoles}
              >
                Save Roles
              </Button>
            </Box>
          )}
        </Box>
      </Drawer>

      {/* === Confirm Delete === */}
      <ConfirmDialog
        open={confirmDialog.open}
        title="Confirm Deletion"
        content="Are you sure you want to delete this user?"
        onClose={() => setConfirmDialog({ open: false, onConfirm: null })}
        onConfirm={confirmDialog.onConfirm}
      />

      {/* === Snackbar === */}
      <SnackbarAlert
        open={snackbar.open}
        onClose={handleCloseSnackbar}
        severity={snackbar.severity}
        message={snackbar.message}
      />
    </Container>
  );
}
