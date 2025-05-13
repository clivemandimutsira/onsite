import React, { useState, useEffect, useContext } from 'react';
import {
  Container, Typography, Box, Button,
  Dialog, DialogTitle, DialogContent, IconButton,
  TextField, Collapse
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { EditIcon, DeleteIcon } from '../components/common/ActionIcons';
import ConfirmDialog from '../components/common/ConfirmDialog';
import SnackbarAlert from '../components/common/SnackbarAlert';
import { ChevronRight, ExpandMore } from '@mui/icons-material'; // Import chevron icons

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
import MemberFormDialog from '../components/cellGroups/MemberFormDialog';
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
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null, type: '' });

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

  const handleDelete = (row) => {
    setConfirmDialog({ open: true, id: row.id, type: 'cell group' });
  };

  const confirmDeletion = async () => {
    try {
      await deleteCellGroup(confirmDialog.id);
      showSnackbar('Cell group deleted.');
      fetchAll();
    } catch (err) {
      showSnackbar('Delete failed', 'error');
    } finally {
      setConfirmDialog({ open: false, id: null, type: '' });
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

  // Add 'designation' to the member columns
  const memberColumns = [
    { field: 'first_name', headerName: 'First Name', flex: 1 },
    { field: 'surname', headerName: 'Surname', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1.5 },
    { field: 'contact_primary', headerName: 'Phone', flex: 1 },
    { field: 'designation', headerName: 'Designation', flex: 1 }, // Added designation column
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      renderCell: (params) => (
        <Box>
          <EditIcon onClick={() => handleEditMember(expandedGroupId, params.row)} />
          <DeleteIcon onClick={() => handleMemberDelete(params.row.membership_id)} />
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
          <Button variant="contained" onClick={handleAdd}>
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
                {expandedGroupId === group.id ? <ExpandMore /> : <ChevronRight />}
              </IconButton>
              {canEdit && <EditIcon onClick={() => handleEdit(group)} />}
              {canDelete && <DeleteIcon onClick={() => handleDelete(group)} />}
            </Box>
          </Box>

          <Collapse in={expandedGroupId === group.id}>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle1">Members</Typography>
                <Button size="small" onClick={() => handleAddMember(group.id)}>
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

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        onConfirm={confirmDeletion}
        title="Confirm Deletion"
        description={`Are you sure you want to delete this ${confirmDialog.type}?`}
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
};

export default CellGroupPage;
