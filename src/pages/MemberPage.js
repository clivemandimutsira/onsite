import React, { useState, useEffect, useContext } from 'react';
import {
  Grid,
  Box,
  Container,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Card,
  CardContent,
  Divider,
  useTheme,
} from '@mui/material';
import SnackbarAlert from '../components/common/SnackbarAlert';
import CloseIcon from '@mui/icons-material/Close';
import { AuthContext } from '../contexts/AuthContext';
import FiltersPanel from '../components/adminmember/FiltersPanel';
import MemberListPanel from '../components/adminmember/MemberListPanel';
import MemberDetailPanel from '../components/adminmember/MemberDetailPanel';
import MemberStepper from '../components/memberForm/MemberStepper';
import { getMembers, deleteMember, updateMember, exportMembers, importMembers } from '../api/memberService';
import CreateNotificationForm from '../components/admin/CreateNotificationForm';
import { runManualStatusUpdate } from '../api/adminService';
import NextOfKinList from '../components/nextOfKin/NextOfKinList';
import MemberFamilyList from '../components/memberFamily/MemberFamilyList';
import MemberCellGroupList from '../components/memberCellGroup/MemberCellGroupList';
import MemberMilestoneChecklist from '../components/MemberMilestoneChecklist';
import MemberCreateNotificationForm from '../components/admin/MemberCreateNotificationForm';
import AddMilestoneDialog from '../components/AddMilestoneDialog';

const MemberPage = () => {
  const theme = useTheme(); // Access the current theme
  const isDarkMode = theme.palette.mode === 'dark'; // Check if the theme is dark

  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [typeFilter, setTypeFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openGroupNotif, setOpenGroupNotif] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [openNokDialog, setOpenNokDialog] = useState(false);
  const [openFamilyDialog, setOpenFamilyDialog] = useState(false);
  const [openCellGroupDialog, setOpenCellGroupDialog] = useState(false);
  const [openMilestoneDialog, setOpenMilestoneDialog] = useState(false);
  const [openNotificationDialog, setOpenNotificationDialog] = useState(false);

  const [showAddMilestoneDialog, setShowAddMilestoneDialog] = useState(false);
  const [milestoneRefreshTrigger, setMilestoneRefreshTrigger] = useState(0);
  const [cellGroups, setCellGroups] = useState([]);
  const [editMode, setEditMode] = useState(false);

  const { permissions } = useContext(AuthContext);
  const canView = permissions.includes('view_members') || permissions.includes('manage_members');

  useEffect(() => {
    if (canView) {
      fetchMembers();
      fetchCellGroups();
    }
  }, [canView]);

  useEffect(() => {
    applyFilters();
  }, [members, typeFilter, roleFilter, searchQuery]);

  const fetchMembers = async () => {
    try {
      const data = await getMembers();
      setMembers(data);
    } catch (error) {
      console.error(error);
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

  const applyFilters = () => {
    let result = [...members];
    if (typeFilter !== 'all') result = result.filter(m => m.member_type === typeFilter);
    if (roleFilter.length) result = result.filter(m => m.roles?.some(r => roleFilter.includes(r)));
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(m =>
        `${m.first_name} ${m.surname}`.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.contact_primary.includes(q)
      );
    }
    setFilteredMembers(result);
  };

  const handleSelect = (member) => setSelectedMember(member);

  const handleDelete = async (member) => {
    try {
      await deleteMember(member.id);
      showSnackbar('Member deleted', 'success');
      fetchMembers();
      if (selectedMember?.id === member.id) setSelectedMember(null);
    } catch (error) {
      showSnackbar('Delete failed', 'error');
    }
  };

  const handleUpdate = async (formData, showSnackbarLocal, setActiveStep, setFormValues, setProfilePhoto) => {
    if (!selectedMember) return;

    try {
      await updateMember(selectedMember.id, formData);
      showSnackbar('Member updated successfully!', 'success');
      setActiveStep?.(0);
      setFormValues?.({});
      setProfilePhoto?.(null);
      setEditMode(false);
      setOpenAddDialog(false);
      fetchMembers();
      setSelectedMember(null);
    } catch (error) {
      showSnackbarLocal?.('Error updating member', 'error');
    }
  };

  const handleManualTrigger = async () => {
    try {
      await runManualStatusUpdate();
      showSnackbar('Manual sync complete', 'success');
      fetchMembers();
    } catch {
      showSnackbar('Manual sync failed', 'error');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportMembers();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'members.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      showSnackbar('Export failed', 'error');
    }
  };

  const handleImport = async (formData) => {
    // delegates to FiltersPanel’s file change
    return importMembers(formData);
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const closeAddDialog = () => {
    setOpenAddDialog(false);
    setEditMode(false);
    setSelectedMember(null);
  };

  if (!canView) return <Container><Box>You lack permission to view members.</Box></Container>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Card
        sx={{
          boxShadow: theme.shadows[1], // Use theme shadows
          borderRadius: theme.shape.borderRadius, // Use theme border radius
          backgroundColor: isDarkMode ? theme.palette.background.paper : theme.palette.background.default, // Use theme background
          color: theme.palette.text.primary, // Use theme text color
          paddingX: theme.spacing(2), // Use theme spacing
        }}
      >
        <CardContent>
          <Grid container spacing={2} alignItems="flex-start" wrap="nowrap">
            <Grid item xs={12} md={3}>
              <FiltersPanel
                typeFilter={typeFilter}
                onTypeChange={setTypeFilter}
                roleFilter={roleFilter}
                onRoleChange={setRoleFilter}
                onRunManual={handleManualTrigger}
                onAddMember={() => setOpenAddDialog(true)}
                onSendGroupNotification={() => setOpenGroupNotif(true)}
                onExport={handleExport}      // pass export handler
                onImport={handleImport}      // pass import handler
              />
            </Grid>

            <Divider orientation="vertical" flexItem />

            <Grid item xs={12} md={4}>
              <Box mb={2}>
                <TextField
                  label="Search Members"
                  variant="outlined"
                  fullWidth
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  sx={{
                    backgroundColor: isDarkMode ? theme.palette.background.paper : theme.palette.background.default, // Use theme background
                    color: theme.palette.text.primary, // Use theme text color
                  }}
                />
              </Box>
              <MemberListPanel
                members={filteredMembers}
                selectedId={selectedMember?.id}
                onSelect={handleSelect}
                onDelete={handleDelete}
              />
            </Grid>

            <Divider orientation="vertical" flexItem />

            <Grid item xs={12} md={4}>
              {selectedMember ? (
                <MemberDetailPanel
                  member={selectedMember}
                  onEdit={() => {
                    setEditMode(true); // Enable edit mode
                    setOpenAddDialog(true); // Open the Add/Edit dialog
                  }}
                  onDelete={() => handleDelete(selectedMember)}
                  onNextOfKin={() => setOpenNokDialog(true)}
                  onFamily={() => setOpenFamilyDialog(true)}
                  onCellGroup={() => setOpenCellGroupDialog(true)}
                  onMilestones={() => setOpenMilestoneDialog(true)}
                  onNotify={() => setOpenNotificationDialog(true)}
                />
              ) : (
                <Box>Please select a member to see details.</Box>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Dialog open={openAddDialog} onClose={closeAddDialog} fullWidth maxWidth="md">
        <DialogTitle>
          {selectedMember ? 'Edit Member' : 'Add New Member'}
          <IconButton onClick={closeAddDialog} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <MemberStepper
            initialValues={selectedMember || {}}
            isEditMode={editMode}
            onSuccess={() => {
              setOpenAddDialog(false);
              fetchMembers();
              setSelectedMember(null);
              setEditMode(false);
            }}
            onSubmit={editMode ? handleUpdate : undefined}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={openGroupNotif} onClose={() => setOpenGroupNotif(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          Send Group Notification
          <IconButton onClick={() => setOpenGroupNotif(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <CreateNotificationForm
            allowGroupSelection
            onSubmit={() => {
              setOpenGroupNotif(false);
              showSnackbar('Group notification sent', 'success');
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={openNokDialog} onClose={() => setOpenNokDialog(false)} fullWidth maxWidth="md">
        <DialogTitle>Next of Kin for {selectedMember?.first_name} {selectedMember?.surname}</DialogTitle>
        <DialogContent>
          {selectedMember && <NextOfKinList memberId={selectedMember.id} />}
        </DialogContent>
      </Dialog>

      <Dialog open={openFamilyDialog} onClose={() => setOpenFamilyDialog(false)} fullWidth maxWidth="md">
        <DialogTitle>Family Links for {selectedMember?.first_name} {selectedMember?.surname}</DialogTitle>
        <DialogContent>
          {selectedMember && <MemberFamilyList memberId={selectedMember.id} allMembers={members} />}
        </DialogContent>
      </Dialog>

      <Dialog open={openCellGroupDialog} onClose={() => setOpenCellGroupDialog(false)} fullWidth maxWidth="md">
        <DialogTitle>Cell Group for {selectedMember?.first_name} {selectedMember?.surname}</DialogTitle>
        <DialogContent>
          {selectedMember && (
            <MemberCellGroupList memberId={selectedMember.id} cellGroups={cellGroups} />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={openMilestoneDialog} onClose={() => setOpenMilestoneDialog(false)} fullWidth maxWidth="md">
        <DialogTitle>Milestones for {selectedMember?.first_name} {selectedMember?.surname}</DialogTitle>
        <DialogContent>
          {selectedMember && (
            <MemberMilestoneChecklist
              memberId={selectedMember.id}
              onAddClick={() => setShowAddMilestoneDialog(true)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={openNotificationDialog} onClose={() => setOpenNotificationDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Send Notification to {selectedMember?.first_name} {selectedMember?.surname}</DialogTitle>
        <DialogContent>
          {selectedMember && (
            <MemberCreateNotificationForm
              defaultMemberId={selectedMember.id}
              onSubmit={() => {
                setOpenNotificationDialog(false);
                showSnackbar('Notification sent!', 'success');
              }}
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
          setMilestoneRefreshTrigger(prev => prev + 1);
        }}
      />

      <SnackbarAlert
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        severity={snackbar.severity}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ width: '100%' }}
      >
        {snackbar.message}
      </SnackbarAlert>
    </Container>
  );
};

export default MemberPage;
