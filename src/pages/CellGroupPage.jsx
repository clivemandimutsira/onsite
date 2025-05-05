import React, { useState, useEffect, useContext } from 'react';
import {
  Container, Typography, Box, Button,
  Dialog, DialogTitle, DialogContent, IconButton,
  Snackbar, Alert, TextField, Collapse
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Edit, Trash, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import CloseIcon from '@mui/icons-material/Close';

import {
  getAllCellGroups,
  createCellGroup,
  updateCellGroup,
  deleteCellGroup
} from '../api/cellGroupService';

import {
  deleteMembership,
  updateMembership,
  createMembership
} from '../api/memberCellGroupService';

import { getMembers } from '../api/memberService';
import CellGroupForm from '../components/cellGroups/CellGroupForm';
import MemberFormDialog from '../components/cellGroups/MemberFormDialog'; // <- You will need this
import { AuthContext } from '../contexts/AuthContext';

const CellGroupPage = () => {
  const [cellGroups, setCellGroups] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [expandedGroupId, setExpandedGroupId] = useState(null);
  const [search, setSearch] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [memberDialogData, setMemberDialogData] = useState({ groupId: null, member: null });

  const { permissions } = useContext(AuthContext);
  const canView = permissions.includes('view_cell_groups') || permissions.includes('manage_cell_groups');
  const canCreate = permissions.includes('create_cell_groups') || permissions.includes('manage_cell_groups');
  const canEdit = permissions.includes('edit_cell_groups') || permissions.includes('manage_cell_groups');
  const canDelete = permissions.includes('delete_cell_groups') || permissions.includes('manage_cell_groups');

  useEffect(() => {
    if (canView) fetchAll();
  }, [canView]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const groups = await getAllCellGroups();
      const allMembers = await getMembers();
      setCellGroups(groups);
      setMembers(allMembers);
    } catch (err) {
      console.error('Error fetching data:', err);
      showSnackbar('Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleAdd = () => {
    setEditing(null);
    setOpenDialog(true);
  };

  const handleEdit = (row) => {
    setEditing(row);
    setOpenDialog(true);
  };

  const handleSubmit = async (formData) => {
    try {
      if (editing) {
        await updateCellGroup(editing.id, formData);
        showSnackbar('Cell group updated successfully!');
      } else {
        await createCellGroup(formData);
        showSnackbar('Cell group created successfully!');
      }
      setOpenDialog(false);
      fetchAll();
    } catch (err) {
      showSnackbar('Error saving cell group', 'error');
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm('Delete this cell group?')) return;
    try {
      await deleteCellGroup(row.id);
      showSnackbar('Cell group deleted.');
      fetchAll();
    } catch (err) {
      showSnackbar('Delete failed', 'error');
    }
  };

  const handleMemberDelete = async (membershipId) => {
    if (!window.confirm('Remove member from this cell group?')) return;
    try {
      await deleteMembership(membershipId);
      showSnackbar('Member removed.');
      fetchAll();
    } catch (err) {
      showSnackbar('Failed to remove member', 'error');
    }
  };

  const handleAddMember = (groupId) => {
    setMemberDialogData({ groupId, member: null });
    setMemberDialogOpen(true);
  };

  const handleEditMember = (groupId, member) => {
    setMemberDialogData({ groupId, member });
    setMemberDialogOpen(true);
  };

  const handleMemberSubmit = async (data, isEdit) => {
    try {
      if (isEdit) {
        await updateMembership(data.id, data);
        showSnackbar('Member updated');
      } else {
        await createMembership(data);
        showSnackbar('Member added');
      }
      setMemberDialogOpen(false);
      fetchAll();
    } catch (err) {
      showSnackbar('Error updating membership', 'error');
    }
  };

  const toggleExpand = (id) => {
    setExpandedGroupId(expandedGroupId === id ? null : id);
  };

  const filteredCellGroups = cellGroups.filter((group) =>
    group.name.toLowerCase().includes(search.toLowerCase())
  );

  const memberColumns = [
    { field: 'first_name', headerName: 'First Name', flex: 1 },
    { field: 'surname', headerName: 'Surname', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1.5 },
    { field: 'contact_primary', headerName: 'Phone', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      renderCell: (params) => (
        <Box>
          <IconButton color="primary" onClick={() => handleEditMember(expandedGroupId, params.row)}>
            <Edit size={18} />
          </IconButton>
          <IconButton color="error" onClick={() => handleMemberDelete(params.row.membership_id)}>
            <Trash size={18} />
          </IconButton>
        </Box>
      )
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Manage Cell Groups</Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <TextField
          label="Search cell groups"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: '300px' }}
        />
        {canCreate && (
          <Button startIcon={<Plus />} variant="contained" onClick={handleAdd}>
            Add Cell Group
          </Button>
        )}
      </Box>

      {filteredCellGroups.map((group) => (
        <Box key={group.id} sx={{ mb: 2, border: '1px solid #ccc', borderRadius: 2, p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">{group.name}</Typography>
            <Box>
              <IconButton onClick={() => toggleExpand(group.id)}>
                {expandedGroupId === group.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </IconButton>
              {canEdit && (
                <IconButton onClick={() => handleEdit(group)} color="primary">
                  <Edit size={18} />
                </IconButton>
              )}
              {canDelete && (
                <IconButton onClick={() => handleDelete(group)} color="error">
                  <Trash size={18} />
                </IconButton>
              )}
            </Box>
          </Box>

          <Collapse in={expandedGroupId === group.id}>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle1">Members</Typography>
                <Button
                  size="small"
                  startIcon={<Plus />}
                  onClick={() => handleAddMember(group.id)}
                >
                  Add Member
                </Button>
              </Box>
              <DataGrid
                autoHeight
                rows={(group.members || []).map((m) => ({ ...m, id: m.membership_id }))}
  columns={memberColumns}
  getRowId={(row) => row.id}
                pageSize={5}
              />
            </Box>
          </Collapse>
        </Box>
      ))}

      {/* CellGroup Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {editing ? 'Edit Cell Group' : 'Add Cell Group'}
          <IconButton onClick={() => setOpenDialog(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <CellGroupForm
            members={members}
            initialValues={editing}
            onSubmit={handleSubmit}
            onClose={() => setOpenDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Member Dialog */}
      <MemberFormDialog
        open={memberDialogOpen}
        onClose={() => setMemberDialogOpen(false)}
        groupId={memberDialogData.groupId}
        member={memberDialogData.member}
        onSubmit={handleMemberSubmit}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CellGroupPage;
