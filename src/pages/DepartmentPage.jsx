import React, { useState, useEffect, useContext } from 'react';
import {
  Container, Typography, Box, Button, Dialog, DialogTitle, DialogContent, TextField, Collapse, IconButton,
  List, ListItem, ListItemText, Card, CardContent, Divider, useTheme
} from '@mui/material';
import { EditIcon, DeleteIcon } from '../components/common/ActionIcons';
import ConfirmDialog from '../components/common/ConfirmDialog';
import SnackbarAlert from '../components/common/SnackbarAlert';
import { ChevronRight, ExpandMore } from '@mui/icons-material'; // Import chevron icons

import {
  getDepartmentsWithMembers,
  createDepartment,
  updateDepartment,
  deleteDepartment
} from '../api/departmentService';

import {
  deleteMembership,
  updateMembership,
  createMembership
} from '../api/memberDepartmentService';

import { getMembers } from '../api/memberService';
import DepartmentForm from '../components/departments/DepartmentForm';
import MemberFormDialog from '../components/departments/DepartmentMemberFormDialog';
import { AuthContext } from '../contexts/AuthContext';

const DepartmentPage = () => {
  const [departments, setDepartments] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [expandedDepartmentId, setExpandedDepartmentId] = useState(null);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null, type: '' });

  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [memberDialogData, setMemberDialogData] = useState({ departmentId: null, member: null });

  const { permissions } = useContext(AuthContext);
  const canView = permissions.includes('view_departments') || permissions.includes('manage_departments');
  const canCreate = permissions.includes('create_departments') || permissions.includes('manage_departments');
  const canEdit = permissions.includes('edit_departments') || permissions.includes('manage_departments');
  const canDelete = permissions.includes('delete_departments') || permissions.includes('manage_departments');

  const theme = useTheme(); // Get current theme for styling

  const fetchAll = async () => {
    setLoading(true);
    try {
      const deptList = await getDepartmentsWithMembers();
      const memberList = await getMembers();
      setDepartments(deptList);
      setMembers(memberList);
    } catch (err) {
      showSnackbar('Error loading departments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canView) fetchAll();
  }, [canView]);

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

  const handleDelete = (row) => {
    setConfirmDialog({ open: true, id: row.id, type: 'department' });
  };

  const confirmDeletion = async () => {
    try {
      await deleteDepartment(confirmDialog.id);
      showSnackbar('Department deleted.');
      fetchAll();
    } catch (err) {
      showSnackbar('Delete failed', 'error');
    } finally {
      setConfirmDialog({ open: false, id: null, type: '' });
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (editing) {
        await updateDepartment(editing.id, formData);
        showSnackbar('Department updated successfully!');
      } else {
        await createDepartment(formData);
        showSnackbar('Department created successfully!');
      }
      setOpenDialog(false);
      fetchAll();
    } catch (err) {
      showSnackbar('Error saving department', 'error');
    }
  };

  const handleAddMember = (departmentId) => {
    setMemberDialogData({ departmentId, member: null });
    setMemberDialogOpen(true);
  };

  const handleEditMember = (departmentId, member) => {
    setMemberDialogData({ departmentId, member });
    setMemberDialogOpen(true);
  };

  const handleMemberDelete = async (membershipId) => {
    try {
      await deleteMembership(membershipId);
      showSnackbar('Member removed.');
      fetchAll();
    } catch (err) {
      showSnackbar('Failed to remove member', 'error');
    }
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
    setExpandedDepartmentId(expandedDepartmentId === id ? null : id);
  };

  const filteredDepartments = departments.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      
      {/* Search and Add Department Card */}
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
              label="Search departments"
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

      {filteredDepartments.map((dept) => (
        <Card key={dept.id} sx={{ mb: 2, boxShadow: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">{dept.name}</Typography>
              <Box>
                <IconButton onClick={() => toggleExpand(dept.id)}>
                  {expandedDepartmentId === dept.id ? <ExpandMore /> : <ChevronRight />}
                </IconButton>
                {canEdit && <EditIcon onClick={() => handleEdit(dept)} />}
                {canDelete && <DeleteIcon onClick={() => handleDelete(dept)} />}
              </Box>
            </Box>

            <Collapse in={expandedDepartmentId === dept.id}>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Members</Typography>
                <List>
                  {(dept.members || []).map((member, idx, arr) => (
                    <React.Fragment key={member.membership_id}>
                      <ListItem sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <ListItemText
                          primary={`${member.first_name} ${member.surname}`}
                          secondary={`Email: ${member.email}, Phone: ${member.contact_primary}`}
                        />
                        <Box>
                          <EditIcon onClick={() => handleEditMember(dept.id, member)} />
                          <DeleteIcon onClick={() => handleMemberDelete(member.membership_id)} />
                        </Box>
                      </ListItem>
                      {idx < (arr.length - 1) && <Divider variant="fullWidth" />}
                    </React.Fragment>
                  ))}
                </List>
                <Button size="small" onClick={() => handleAddMember(dept.id)}>
                  Add Member
                </Button>
              </Box>
            </Collapse>
          </CardContent>
        </Card>
      ))}

      {/* Department Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Edit Department' : 'Add Department'}</DialogTitle>
        <DialogContent>
          <DepartmentForm
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
        departmentId={memberDialogData.departmentId}
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

export default DepartmentPage;
