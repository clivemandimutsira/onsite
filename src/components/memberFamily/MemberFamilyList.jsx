import React, { useEffect, useState, useContext } from 'react';
import {
  Typography,
  Box,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  useTheme,
} from '@mui/material';
import { Plus } from 'lucide-react'; // Use Plus icon
import { EditIcon, DeleteIcon } from '../../components/common/ActionIcons'; // Use ActionIcons
import {
  getFamilyLinksByMemberId,
  deleteFamilyLink,
} from '../../api/memberFamilyService';
import MemberFamilyForm from './MemberFamilyForm';
import { AuthContext } from '../../contexts/AuthContext';
import ConfirmDialog from '../../components/common/ConfirmDialog'; // Use ConfirmDialog
import SnackbarAlert from '../../components/common/SnackbarAlert'; // Use SnackbarAlert

const MemberFamilyList = ({ memberId, allMembers }) => {
  const theme = useTheme(); // Access the current theme
  const [list, setList] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [editingLink, setEditingLink] = useState(null); // Editing state
  const [confirmDialog, setConfirmDialog] = useState({ open: false, onConfirm: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const { permissions } = useContext(AuthContext);

  // Permissions for Add, Edit, Delete actions
  const canAdd = permissions.includes('add_member_family') || permissions.includes('manage_member_family');
  const canDelete = permissions.includes('delete_member_family') || permissions.includes('manage_member_family');
  const canEdit = permissions.includes('edit_member_family') || permissions.includes('manage_member_family');

  const loadLinks = async () => {
    try {
      const data = await getFamilyLinksByMemberId(memberId);
      setList(data);
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Failed to load family links.', severity: 'error' });
    }
  };

  useEffect(() => {
    if (memberId) loadLinks();
  }, [memberId]);

  const handleDelete = (id) => {
    setConfirmDialog({
      open: true,
      onConfirm: async () => {
        try {
          await deleteFamilyLink(id);
          setSnackbar({ open: true, message: 'Family link deleted successfully.', severity: 'success' });
          loadLinks();
        } catch (err) {
          console.error(err);
          setSnackbar({ open: true, message: 'Failed to delete family link.', severity: 'error' });
        } finally {
          setConfirmDialog({ open: false, onConfirm: null });
        }
      },
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: '', severity: 'success' });
  };

  return (
    <Box>
      {/* Add Button for members who have permission to add */}
      {canAdd && (
        <Button
          startIcon={<Plus size={18} />}
          onClick={() => {
            setEditingLink(null); // Reset editing on add
            setOpenForm(true);
          }}
          sx={{
            mb: 2,
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            },
          }}
        >
          Add Family Link
        </Button>
      )}

      {/* Display family links or show no data message */}
      {list.length === 0 ? (
        <Typography color={theme.palette.text.secondary}>No family links yet.</Typography>
      ) : (
        list.map((rel) => {
          const relative = allMembers.find((m) => m.id === rel.relative_id);
          return (
            <Box
              key={rel.id}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: `1px solid ${theme.palette.divider}`,
                py: 1,
              }}
            >
              <Typography color={theme.palette.text.primary}>
                {relative ? `${relative.first_name} ${relative.surname}` : 'Unknown'} — {rel.relationship}
              </Typography>

              {/* Buttons for Edit and Delete */}
              <Box display="flex" alignItems="center">
                {canEdit && (
                  <IconButton
                    onClick={() => {
                      setEditingLink(rel); // Set link for editing
                      setOpenForm(true);
                    }}
                    sx={{
                      color: theme.palette.info.main,
                      '&:hover': {
                        backgroundColor: theme.palette.info.light,
                      },
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                )}
                {canDelete && (
                  <IconButton
                    onClick={() => handleDelete(rel.id)}
                    sx={{
                      color: theme.palette.error.main,
                      '&:hover': {
                        backgroundColor: theme.palette.error.light,
                      },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
            </Box>
          );
        })
      )}

      {/* Dialog for adding or editing a family link */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} fullWidth maxWidth="sm">
        <DialogTitle
          sx={{
            backgroundColor: theme.palette.background.default,
            color: theme.palette.text.primary,
          }}
        >
          {editingLink ? 'Edit Family Link' : 'Link a Family Member'}
        </DialogTitle>
        <DialogContent>
          <MemberFamilyForm
            memberId={memberId}
            allMembers={allMembers}
            existingLink={editingLink} // Pass link for editing
            onClose={() => {
              setOpenForm(false);
              setEditingLink(null);
              loadLinks();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Confirm Deletion Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title="Confirm Deletion"
        content="Are you sure you want to delete this family link?"
        onClose={() => setConfirmDialog({ open: false, onConfirm: null })}
        onConfirm={confirmDialog.onConfirm}
      />

      {/* Snackbar for success and error messages */}
      <SnackbarAlert
        open={snackbar.open}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Box>
  );
};

export default MemberFamilyList;
