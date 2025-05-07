import React, { useState, useEffect, useContext, useMemo } from 'react';
import {
  Container, Typography, Snackbar, Alert, IconButton, Box, Dialog,
  DialogTitle, DialogContent, Button, TextField, Tooltip, Chip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Edit, Trash, Users, Link as LinkIcon, UserCheck, Plus, Crown
} from 'lucide-react';
import CloseIcon from '@mui/icons-material/Close';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useNavigate } from 'react-router-dom';

import MemberStepper from '../components/memberForm/MemberStepper';
import NextOfKinList from '../components/nextOfKin/NextOfKinList';
import MemberFamilyList from '../components/memberFamily/MemberFamilyList';
import MemberCellGroupList from '../components/memberCellGroup/MemberCellGroupList';
import MemberMilestoneChecklist from '../components/MemberMilestoneChecklist';
import AddMilestoneDialog from '../components/AddMilestoneDialog';
import PrayerRequestListWithForm from '../components/dialogs/PrayerRequestListWithForm';


import CounselingSessionListWithForm from '../components/memberProfile/tabs/MemberCounselingList'; // Ensure the import path is correct

import { getMembers, deleteMember, updateMember } from '../api/memberService';
import { runManualStatusUpdate} from '../api/adminService';

import { AuthContext } from '../contexts/AuthContext';

import * as XLSX from 'xlsx';

const MemberPage = () => {
  const [members, setMembers] = useState([]);
  const [cellGroups, setCellGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const [editMode, setEditMode] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [deleteConfirmSnackbarOpen, setDeleteConfirmSnackbarOpen] = useState(false);

  const [openNokDialog, setOpenNokDialog] = useState(false);
  const [openFamilyDialog, setOpenFamilyDialog] = useState(false);
  const [openCellGroupDialog, setOpenCellGroupDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [milestoneRefreshTrigger, setMilestoneRefreshTrigger] = useState(0);

  const [openMilestoneDialog, setOpenMilestoneDialog] = useState(false);
  const [showAddMilestoneDialog, setShowAddMilestoneDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const navigate = useNavigate();
  const { permissions } = useContext(AuthContext);

  const canView = permissions.includes('view_members') || permissions.includes('manage_members');
  const canCreate = permissions.includes('create_members') || permissions.includes('manage_members');
  const canEdit = permissions.includes('edit_members') || permissions.includes('manage_members');
  const canDelete = permissions.includes('delete_members') || permissions.includes('manage_members');

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const data = await getMembers();
      setMembers(data);
    } catch (error) {
      showSnackbar(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCellGroups = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/cell-groups`);
      const data = await res.json();
      setCellGroups(data);
    } catch (err) {
      console.error('Failed to load cell groups');
    }
  };

  useEffect(() => {
    if (canView) {
      fetchMembers();
      fetchCellGroups();
    }
  }, [canView]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleDelete = (member) => {
    setMemberToDelete(member);
    setDeleteConfirmSnackbarOpen(true);
  };

  const confirmDelete = async () => {
    if (!memberToDelete) return;
    try {
      await deleteMember(memberToDelete.id);
      showSnackbar('Member deleted successfully!', 'success');
      fetchMembers();
    } catch (error) {
      showSnackbar(error.message || 'Failed to delete member', 'error');
    } finally {
      setDeleteConfirmSnackbarOpen(false);
      setMemberToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmSnackbarOpen(false);
    setMemberToDelete(null);
  };

  const handleEdit = (member) => {
    setMemberToEdit(member);
    setEditMode(true);
  };

  const handleManualTrigger = async () => {
    try {
      await runManualStatusUpdate();
      showSnackbar('Manual member sync complete');
      fetchMembers();
    } catch (err) {
      showSnackbar('Manual sync failed', 'error');
    }
  };

  const handleUpdate = async (formData, showSnackbarLocal, setActiveStep, setFormValues, setProfilePhoto) => {
    try {
      await updateMember(memberToEdit.id, formData);
      showSnackbar('Member updated successfully!', 'success');
      setActiveStep(0);
      setFormValues({});
      setProfilePhoto(null);
      setEditMode(false);
      setMemberToEdit(null);
      fetchMembers();
    } catch (error) {
      showSnackbarLocal('Error updating member', 'error');
    }
  };

  const handleMemberAdded = () => {
    showSnackbar('Member added successfully!', 'success');
    fetchMembers();
    setOpenAddDialog(false);
  };

  const openDialog = (setter, member) => {
    setSelectedMember(member);
    setter(true);
  };

  const closeDialog = (setter) => {
    setter(false);
    setSelectedMember(null);
  };

  const memoizedInitialValues = useMemo(() => {
    return memberToEdit ? { ...memberToEdit } : {};
  }, [memberToEdit]);

  const filteredMembers = members.filter((member) =>
    member.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.surname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.contact_primary.toLowerCase().includes(searchQuery.toLowerCase()) || // Phone number
    member.gender.toLowerCase().includes(searchQuery.toLowerCase()) || // Gender
    member.member_type.toLowerCase().includes(searchQuery.toLowerCase()) || // Member type
    member.status.toLowerCase().includes(searchQuery.toLowerCase()) // Status
  );

  const columns = [
    { field: 'first_name', headerName: 'First Name', flex: 1 },
    { field: 'surname', headerName: 'Surname', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1.5 },
    { field: 'contact_primary', headerName: 'Phone', flex: 1 },
    { field: 'gender', headerName: 'Gender', flex: 1 },
    {
      field: 'member_type',
      headerName: 'Type',
      flex: 1,
      renderCell: ({ row }) => {
        let label = 'Member';
        let color = 'success';
    
        if (row.member_type === 'first_timer') {
          label = 'First Timer';
          color = 'warning';
        } else if (row.member_type === 'new_convert') {
          label = 'New Convert';
          color = 'secondary';
        }
    
        return (
          <Chip
            label={label}
            color={color}
            variant="outlined"
            size="small"
            sx={{ borderRadius: '999px' }}
          />
        );
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: ({ row }) => {
        const isActive = row.status === 'active';
        return (
          <Chip
            label={isActive ? 'Active' : 'Inactive'}
            color={isActive ? 'success' : 'error'}
            variant="outlined"
            size="small"
            sx={{ borderRadius: '999px' }}
          />
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => {
        const handleOpenMenu = (event) => {
          setAnchorEl({ id: row.id, anchor: event.currentTarget });
        };
    
        const handleCloseMenu = () => {
          setAnchorEl(null);
        };
    
        const isMenuOpen = anchorEl?.id === row.id;
    
        return (
          <>
            <IconButton onClick={handleOpenMenu}>
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={isMenuOpen ? anchorEl.anchor : null}
              open={isMenuOpen}
              onClose={handleCloseMenu}
            >
              {canEdit && (
                <MenuItem onClick={() => { handleEdit(row); handleCloseMenu(); }}>
                  Edit Member
                </MenuItem>
              )}
              {canDelete && (
                <MenuItem onClick={() => { handleDelete(row); handleCloseMenu(); }}>
                  Delete
                </MenuItem>
              )}
              <MenuItem onClick={() => { openDialog(setOpenNokDialog, row); handleCloseMenu(); }}>
                Next of Kin
              </MenuItem>
              <MenuItem onClick={() => { openDialog(setOpenFamilyDialog, row); handleCloseMenu(); }}>
                Family Links
              </MenuItem>
              <MenuItem onClick={() => { openDialog(setOpenCellGroupDialog, row); handleCloseMenu(); }}>
                Cell Group
              </MenuItem>
              <MenuItem onClick={() => { openDialog(setOpenMilestoneDialog, row); handleCloseMenu(); }}>
                Milestones
              </MenuItem>
            </Menu>
          </>
        );
      }
    }
  ];
  

  if (!canView) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h6">You do not have permission to view members.</Typography>
      </Container>
    );
  }

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredMembers); // Convert data to worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Members');
    XLSX.writeFile(workbook, 'Members.xlsx'); // Save the file
  };

  const exportToCSV = () => {
    const headers = Object.keys(filteredMembers[0] || {}).join(','); // Get CSV headers
    const rows = filteredMembers.map((member) =>
      Object.values(member).join(',')
    ); // Convert each member object to a CSV row
    const csvContent = [headers, ...rows].join('\n'); // Combine headers and rows
  
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Members.csv'); // Set the file name
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>New Member Registration</Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, mb: 2 }}>
        {canCreate && (
          <Button startIcon={<Plus />} variant="contained" color="primary" onClick={() => setOpenAddDialog(true)}>
            Add Member
          </Button>
        )}
        <Box>
          <Button variant="outlined" onClick={exportToExcel} sx={{ mr: 2 }}>
            Export to Excel
          </Button>
          <Button variant="outlined" onClick={exportToCSV} sx={{ mr: 2 }}>
            Export to CSV
          </Button>
          <Button variant="outlined" onClick={handlePrint} sx={{ mr: 2 }}>
            Print
          </Button>
          <Button variant="outlined" color="secondary" onClick={handleManualTrigger}>
            Run Manual Update
          </Button>
        </Box>
      </Box>

      <Typography variant="h4" gutterBottom>Members List</Typography>

      <Box sx={{ mb: 2 }}>
        <TextField
          label="Search Members"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Box>

      <Box sx={{ height: 500, mt: 2 }}>
        <DataGrid
          rows={filteredMembers}
          columns={columns}
          getRowId={(row) => row.id}
          loading={loading}
          pageSize={10}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Box>

      {/* Add Member Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} fullWidth maxWidth="md">
        <DialogTitle>
          Add New Member
          <IconButton onClick={() => setOpenAddDialog(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <MemberStepper onSuccess={handleMemberAdded} />
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={editMode} onClose={() => setEditMode(false)} fullWidth maxWidth="md">
        <DialogTitle>
          Edit Member
          <IconButton onClick={() => setEditMode(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <MemberStepper initialValues={memoizedInitialValues} onSubmit={handleUpdate} isEditMode={true} />
        </DialogContent>
      </Dialog>

      {/* Next of Kin Dialog */}
      <Dialog open={openNokDialog} onClose={() => closeDialog(setOpenNokDialog)} fullWidth maxWidth="md">
        <DialogTitle>
          Next of Kin for {selectedMember?.first_name} {selectedMember?.surname}
          <IconButton onClick={() => closeDialog(setOpenNokDialog)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedMember && <NextOfKinList memberId={selectedMember.id} />}
        </DialogContent>
      </Dialog>

      {/* Family Dialog */}
      <Dialog open={openFamilyDialog} onClose={() => closeDialog(setOpenFamilyDialog)} fullWidth maxWidth="md">
        <DialogTitle>
          Family Links for {selectedMember?.first_name} {selectedMember?.surname}
          <IconButton onClick={() => closeDialog(setOpenFamilyDialog)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedMember && <MemberFamilyList memberId={selectedMember.id} allMembers={members} />}
        </DialogContent>
      </Dialog>

      {/* Cell Group Dialog */}
      <Dialog open={openCellGroupDialog} onClose={() => closeDialog(setOpenCellGroupDialog)} fullWidth maxWidth="md">
        <DialogTitle>
          Cell Group Membership for {selectedMember?.first_name} {selectedMember?.surname}
          <IconButton onClick={() => closeDialog(setOpenCellGroupDialog)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedMember && <MemberCellGroupList memberId={selectedMember.id} cellGroups={cellGroups} />}
        </DialogContent>
      </Dialog>

      <Dialog open={openMilestoneDialog} onClose={() => closeDialog(setOpenMilestoneDialog)} fullWidth maxWidth="md">
  <DialogTitle>
    Milestones for {selectedMember?.first_name} {selectedMember?.surname}
    <IconButton onClick={() => closeDialog(setOpenMilestoneDialog)} sx={{ position: 'absolute', right: 8, top: 8 }}>
      <CloseIcon />
    </IconButton>
  </DialogTitle>
  <DialogContent>
    {selectedMember && (
      <MemberMilestoneChecklist
        memberId={selectedMember.id}
        onAddClick={() => setShowAddMilestoneDialog(true)} // Triggers the AddMilestoneDialog
      />
    )}
  </DialogContent>
</Dialog>

<AddMilestoneDialog
  open={showAddMilestoneDialog}
  onClose={() => setShowAddMilestoneDialog(false)}
  memberId={selectedMember?.id}
  onSuccess={() => {
    setShowAddMilestoneDialog(false);
    setMilestoneRefreshTrigger(prev => prev + 1); // Optionally trigger a refresh for milestones
  }}
/>

      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Snackbar
  open={deleteConfirmSnackbarOpen}
  anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
  onClose={cancelDelete}
  message={`Delete ${memberToDelete?.first_name} ${memberToDelete?.surname}?`} // Fixed the template literal for member name
  action={
    <>
      <Button color="secondary" size="small" onClick={cancelDelete}>
        Cancel
      </Button>
      <Button color="error" size="small" onClick={confirmDelete}>
        Delete
      </Button>
    </>
  }
/>

    </Container>
  );
};

export default MemberPage;