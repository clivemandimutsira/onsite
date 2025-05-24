import React, { useState, useEffect, useContext } from 'react';
import {
  Container, Typography, Box, Button, Card, CardContent,
  Dialog, DialogTitle, DialogContent, TextField, Collapse,
  List, ListItem, ListItemText, IconButton, Divider
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { ChevronRight, ExpandMore } from '@mui/icons-material'; // Chevron icons
import { AuthContext } from '../contexts/AuthContext';
import { getAllCellGroups, createCellGroup, updateCellGroup, deleteCellGroup } from '../api/cellGroupService';
import { deleteMembership, updateMembership, createMembership } from '../api/memberCellGroupService';
import { getMembers } from '../api/memberService';
import CellGroupForm from '../components/cellGroups/CellGroupForm';
import MemberFormDialog from '../components/cellGroups/MemberFormDialog';
import ConfirmDialog from '../components/common/ConfirmDialog';
import SnackbarAlert from '../components/common/SnackbarAlert';
import { EditIcon, DeleteIcon, CloseIcon, DownloadIcon } from '../components/common/ActionIcons';

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

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      
      {/* Search and Add Cell Group Card */}
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 3 }}>
        <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              gap: 2,
              p: 2,
              backgroundColor: 'background.paper',
              width: '100%',
            }}
          >
            <TextField
              label="Search cell groups"
              variant="outlined"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ flex: 3, minWidth: 280, maxWidth: 900 }}
              fullWidth
            />
            {canCreate && (
              <Button
                variant="contained"
                onClick={handleAdd}
                sx={{
                  whiteSpace: 'nowrap',
                  minWidth: 100,
                  maxWidth: 140,
                  flexShrink: 0,
                  alignSelf: { xs: 'stretch', sm: 'auto' },
                }}
              >
                Add
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {filteredCellGroups.map((group) => (
        <Card key={group.id} sx={{ mb: 2, borderRadius: 2, boxShadow: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">{group.name}</Typography>
              <Box>
                <IconButton onClick={() => toggleExpand(group.id)}>
                  {expandedGroupId === group.id ? <ExpandMore /> : <ChevronRight />}
                </IconButton>
                {canEdit && <IconButton onClick={() => handleEdit(group)}><EditIcon /></IconButton>}
                {canDelete && <IconButton onClick={() => handleDelete(group)}><DeleteIcon /></IconButton>}
              </Box>
            </Box>
            <Collapse in={expandedGroupId === group.id}>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1">Members</Typography>
                <Button size="small" sx={{ mb: 2 }} onClick={() => handleAddMember(group.id)}>Add Member</Button>
                <List>
                  {(group.members || []).map((member, idx, arr) => (
                    <React.Fragment key={member.membership_id}>
                      <ListItem sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <ListItemText
                          primary={`${member.first_name} ${member.surname}`}
                          secondary={member.email}
                        />
                        <Box>
                          <EditIcon onClick={() => handleEditMember(group.id, member)} />
                          <DeleteIcon onClick={() => handleMemberDelete(member.membership_id)} />
                        </Box>
                      </ListItem>
                      {idx < (arr.length - 1) && <Divider variant="fullWidth" />}
                    </React.Fragment>
                  ))}
                </List>
              </Box>
            </Collapse>
          </CardContent>
        </Card>
      ))}

      {/* CellGroup Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Edit Cell Group' : 'Add Cell Group'}</DialogTitle>
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
