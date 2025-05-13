import React, { useEffect, useState, useContext } from 'react';
import {
  Typography,
  Box,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import { Plus } from 'lucide-react';
import { EditIcon, DeleteIcon } from '../common/ActionIcons'; // Corrected import
import {
  getCellGroupMembershipsByMemberId,
  deleteMembership,
} from '../../api/memberCellGroupService';
import MemberCellGroupForm from './MemberCellGroupForm';
import { AuthContext } from '../../contexts/AuthContext';
import ConfirmDialog from '../common/ConfirmDialog';
import SnackbarAlert from '../common/SnackbarAlert';

const MemberCellGroupList = ({ memberId, cellGroups }) => {
  const [list, setList] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, onConfirm: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const { permissions } = useContext(AuthContext);

  const canAdd = permissions.includes('assign_cell_group') || permissions.includes('manage_cell_groups');
  const canDelete = permissions.includes('remove_cell_group') || permissions.includes('manage_cell_groups');

  const loadData = async () => {
    try {
      const data = await getCellGroupMembershipsByMemberId(memberId);
      setList(data);
    } catch (err) {
      console.error('Failed to load cell group memberships:', err);
      setSnackbar({ open: true, message: 'Failed to load cell group memberships.', severity: 'error' });
    }
  };

  useEffect(() => {
    if (memberId) loadData();
  }, [memberId]);

  const handleDelete = async (id) => {
    try {
      await deleteMembership(id);
      setSnackbar({ open: true, message: 'Member removed from cell group.', severity: 'success' });
      loadData();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to remove member from cell group.', severity: 'error' });
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

  return (
    <Box>
      {canAdd && (
        <Button
          startIcon={<Plus size={18} />}
          onClick={() => setOpenForm(true)}
          sx={{ mb: 2 }}
        >
          Assign to Cell Group
        </Button>
      )}

      {list.length === 0 ? (
        <Typography>No cell group assignments found.</Typography>
      ) : (
        list.map((item) => {
          const group = cellGroups.find((g) => g.id === item.cell_group_id);
          return (
            <Box
              key={item.id}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #ddd',
                py: 1,
              }}
            >
              <Typography>
                {group?.name || 'Unknown'} — {item.designation} — {item.date_joined}
              </Typography>
              {canDelete && (
                <IconButton onClick={() => openConfirmDialog(item.id)} color="error">
                  <DeleteIcon size={18} />
                </IconButton>
              )}
            </Box>
          );
        })
      )}

      <Dialog open={openForm} onClose={() => setOpenForm(false)} fullWidth maxWidth="sm">
        <DialogTitle>Assign Cell Group</DialogTitle>
        <DialogContent>
          <MemberCellGroupForm
            memberId={memberId}
            cellGroups={cellGroups}
            onClose={() => {
              setOpenForm(false);
              loadData();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title="Confirm Removal"
        content="Are you sure you want to remove this member from the cell group?"
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

export default MemberCellGroupList;
