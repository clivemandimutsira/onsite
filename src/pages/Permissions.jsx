import {
  Container,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Box,
  Card,
  CardContent,
  IconButton,
  useTheme,
  useMediaQuery,
  Paper
} from '@mui/material';
import { PlusIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { EditIcon, DeleteIcon } from '../components/common/ActionIcons';
import ConfirmDialog from '../components/common/ConfirmDialog';
import SnackbarAlert from '../components/common/SnackbarAlert';
import { getPermissions, createPermission, updatePermission, deletePermission } from '../api/permissions';
import SearchBar from '../components/SearchBar';

export default function Permissions() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [permissions, setPermissions] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [search, setSearch] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const loadPermissions = async () => {
    try {
      const data = await getPermissions();
      setPermissions(Array.isArray(data) ? data : []);
    } catch {
      showSnackbar('Failed to load permissions', 'error');
    }
  };

  useEffect(() => {
    loadPermissions();
  }, []);

  const handleOpen = (permission = null) => {
    setSelectedPermission(permission);
    setForm({
      name: permission?.name || '',
      description: permission?.description || '',
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedPermission(null);
  };

  const handleSubmit = async () => {
    try {
      if (selectedPermission) {
        await updatePermission(selectedPermission.id, form);
        showSnackbar('Permission updated!', 'success');
      } else {
        await createPermission(form);
        showSnackbar('Permission created!', 'success');
      }
      handleClose();
      loadPermissions();
    } catch {
      showSnackbar('Save failed', 'error');
    }
  };

  const handleDelete = (id) => {
    setConfirmDialog({ open: true, id });
  };

  const confirmDeletion = async () => {
    try {
      await deletePermission(confirmDialog.id);
      showSnackbar('Permission deleted!', 'success');
      loadPermissions();
    } catch {
      showSnackbar('Delete failed', 'error');
    } finally {
      setConfirmDialog({ open: false, id: null });
    }
  };

  const filteredPermissions = permissions.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container sx={{ mt: 4 }}>
      {/* Search and Add Button Container */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center', // Always center
          gap: 2,
          mb: 3,
          p: 2,
          backgroundColor: theme.palette.background.paper,
          borderRadius: 2,
          boxShadow: theme.shadows[3],
          transition: 'transform 0.3s ease',
          '&:hover': {
            transform: 'scale(1.02)',
          },
        }}
      >
        {/* Search and Add Inline */}
        <SearchBar
          search={search}
          setSearch={setSearch}
          placeholder="Search Permissions"
          sx={{
            flex: 1,
            minWidth: 180,
            maxWidth: 400, // Slightly wider for balance
          }}
        />
        <Button
          startIcon={<PlusIcon />}
          variant="contained"
          onClick={() => handleOpen()}
          sx={{
            whiteSpace: 'nowrap',
            minWidth: 170,
            flexShrink: 0,
            // Removed alignSelf
          }}
        >
          Create New Permission
        </Button>
      </Box>

      {/* Permissions List */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: 3,
        }}
      >
        {filteredPermissions.map((permission) => (
          <Card
            key={permission.id}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              padding: 2,
              boxShadow: theme.shadows[3],
              borderRadius: 2,
              backgroundColor: theme.palette.background.paper,
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
          >
            <CardContent sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6">{permission.name}</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {permission.description}
              </Typography>
            </CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <IconButton onClick={() => handleOpen(permission)}>
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => handleDelete(permission.id)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          </Card>
        ))}
      </Box>

      {/* Create/Edit Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {selectedPermission ? 'Edit Permission' : 'Create Permission'}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />
          <TextField
            label="Description"
            fullWidth
            margin="normal"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {selectedPermission ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Deletion Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        onConfirm={confirmDeletion}
        title="Confirm Deletion"
        description="Are you sure you want to delete this permission?"
      />

      {/* Snackbar Notification */}
      <SnackbarAlert
        open={snackbar.open}
        onClose={handleSnackbarClose}
        severity={snackbar.severity}
        message={snackbar.message}
      />
    </Container>
  );
}
