import {
  Container,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton
} from '@mui/material';
import { PlusIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';

import { EditIcon, DeleteIcon } from '../components/common/ActionIcons';
import ConfirmDialog from '../components/common/ConfirmDialog';
import SnackbarAlert from '../components/common/SnackbarAlert';
import {
  getPermissions,
  createPermission,
  updatePermission,
  deletePermission
} from '../api/permissions';
import SearchBar from '../components/SearchBar';

export default function Permissions() {
  const [permissions, setPermissions] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [search, setSearch] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
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
      description: permission?.description || ''
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

  const permissionColumns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.5,
      sortable: false,
      renderCell: (params) => (
        <>
          <EditIcon onClick={() => handleOpen(params.row)} />
          <DeleteIcon onClick={() => handleDelete(params.row.id)} />
        </>
      )
    }
  ];

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Permissions Management
      </Typography>

      <Button
        startIcon={<PlusIcon />}
        variant="contained"
        onClick={() => handleOpen()}
        sx={{ mb: 2 }}
      >
        Create New Permission
      </Button>

      <SearchBar
        search={search}
        setSearch={setSearch}
        placeholder="Search Permissions"
      />

      <DataGrid
        rows={filteredPermissions}
        columns={permissionColumns}
        getRowId={(row) => row.id}
        pageSize={5}
        rowsPerPageOptions={[5, 10, 20]}
        autoHeight
      />

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
