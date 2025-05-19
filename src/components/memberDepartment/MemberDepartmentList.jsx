// src/components/memberDepartment/MemberDepartmentList.jsx

import React, { useEffect, useState } from 'react';
import {
  Typography, Box, IconButton, Button, Dialog, DialogTitle, DialogContent
} from '@mui/material';
import { Plus } from 'lucide-react';
import { DeleteIcon } from '../common/ActionIcons'; // Corrected import
import {
  getMembershipsByMemberId,
  createMembership,
  deleteMembership
} from '../../services/memberDepartmentService';
import MemberDepartmentForm from './MemberDepartmentForm';
import ConfirmDialog from '../common/ConfirmDialog';
import SnackbarAlert from '../common/SnackbarAlert';

const MemberDepartmentList = ({ memberId, departments }) => {
  const [list, setList] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, onConfirm: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const load = async () => {
    try {
      const data = await getMembershipsByMemberId(memberId);
      setList(data);
    } catch (err) {
      console.error('Failed to load department memberships:', err);
      setSnackbar({ open: true, message: 'Failed to load department memberships.', severity: 'error' });
    }
  };

  useEffect(() => {
    if (memberId) load();
  }, [memberId]);

  const handleDelete = async (id) => {
    try {
      await deleteMembership(id);
      setSnackbar({ open: true, message: 'Member removed from department.', severity: 'success' });
      load();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to remove member from department.', severity: 'error' });
    }
  };

  const openConfirmDialog = (id) => {
    setConfirmDialog({
      open: true,
      onConfirm: () => {
        handleDelete(id);
        setConfirmDialog({ open: false, onConfirm: null });
      },
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: '', severity: 'success' });
  };

  const handleAssign = async (data) => {
    try {
      await createMembership(data);
      setSnackbar({ open: true, message: 'Member assigned to department.', severity: 'success' });
      load();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to assign member to department.', severity: 'error' });
    }
  };

  return (
    <Box>
      <Button startIcon={<Plus />} onClick={() => setOpenForm(true)} sx={{ mb: 2 }}>
        Assign to Department
      </Button>

      {list.length === 0 ? (
        <Typography>No department assignments found.</Typography>
      ) : (
        list.map((item) => {
          const dept = departments.find((d) => d.id === item.department_id);
          return (
            <Box
              key={item.id}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                borderBottom: '1px solid #ccc',
                py: 1
              }}
            >
              <Typography>
                {dept?.name || 'Unknown'} — {item.role} — {item.date_joined}
              </Typography>
              <IconButton onClick={() => openConfirmDialog(item.id)} color="error">
                <DeleteIcon size={18} />
              </IconButton>
            </Box>
          );
        })
      )}

      <Dialog open={openForm} onClose={() => setOpenForm(false)} fullWidth maxWidth="sm">
        <DialogTitle>Assign Department</DialogTitle>
        <DialogContent>
          <MemberDepartmentForm
            memberId={memberId}
            departments={departments}
            onClose={() => setOpenForm(false)}
            onSaved={handleAssign}
          />
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title="Confirm Removal"
        content="Are you sure you want to remove this member from the department?"
        onClose={() => setConfirmDialog({ open: false, onConfirm: null })}
        onConfirm={confirmDialog.onConfirm}
      />

      {/* Snackbar */}
      <SnackbarAlert
        open={snackbar.open}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Box>
  );
};

export default MemberDepartmentList;
