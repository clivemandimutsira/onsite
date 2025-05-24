import React, { useEffect, useState, useContext } from 'react';
import {
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { Plus } from 'lucide-react';

import { EditIcon, DeleteIcon } from '../../common/ActionIcons'; // Import ActionIcons
import SnackbarAlert from '../../common/SnackbarAlert'; // Import SnackbarAlert
import ConfirmDialog from '../../common/ConfirmDialog'; // Import ConfirmDialog

import {
  getFamilyLinksByMemberId,
  deleteFamilyLink,
} from '../../../api/memberFamilyService';
import { getAllMembers } from '../../../api/memberService';

import MemberFamilyForm from '../../../components/memberFamily/MemberFamilyForm';
import { AuthContext } from '../../../contexts/AuthContext';

const MemberFamilyList = ({ memberId }) => {
  const theme = useTheme(); // Access the current theme
  const [list, setList] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allMembers, setAllMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, onConfirm: null });

  const { permissions } = useContext(AuthContext);

  const canAdd =
    permissions.includes('add_member_family') || permissions.includes('manage_member_family');
  const canDelete =
    permissions.includes('delete_member_family') || permissions.includes('manage_member_family');

  const loadLinks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getFamilyLinksByMemberId(memberId);
      setList(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load family links');
    } finally {
      setLoading(false);
    }
  };

  const loadAllMembers = async () => {
    setMembersLoading(true);
    try {
      const data = await getAllMembers();
      setAllMembers(data);
    } catch (err) {
      console.error('Failed to load all members', err);
      setError('Failed to load members for family link.');
    } finally {
      setMembersLoading(false);
    }
  };

  useEffect(() => {
    if (memberId) {
      loadLinks();
      loadAllMembers();
    }
  }, [memberId]);

  const handleDelete = async (id) => {
    try {
      await deleteFamilyLink(id);
      setSnackbar({ open: true, message: 'Family link deleted successfully.', severity: 'success' });
      loadLinks();
    } catch (err) {
      console.error('Error deleting family link:', err);
      setSnackbar({ open: true, message: 'Failed to delete family link.', severity: 'error' });
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
      {/* Add button */}
      {canAdd && (
        <Button
          startIcon={<Plus size={18} />}
          onClick={() => setOpenForm(true)}
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

      {/* Loading state for links */}
      {loading ? (
        <Box textAlign="center" mt={4}>
          <Typography>Loading family links...</Typography>
        </Box>
      ) : (
        <>
          {error && (
            <Box textAlign="center" mt={2}>
              <Typography color={theme.palette.error.main}>{error}</Typography>
            </Box>
          )}

          {list.length === 0 ? (
            <Typography>No family links yet.</Typography>
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
                    {relative
                      ? `${relative.first_name} ${relative.surname}`
                      : 'Unknown'}{' '}
                    — {rel.relationship}
                  </Typography>

                  {canDelete && (
                    <DeleteIcon
                      onClick={() => openConfirmDialog(rel.id)}
                      sx={{
                        color: theme.palette.error.main,
                        '&:hover': {
                          backgroundColor: theme.palette.error.light,
                        },
                      }}
                    />
                  )}
                </Box>
              );
            })
          )}
        </>
      )}

      {/* Family Form Dialog */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} fullWidth maxWidth="sm">
        <DialogTitle
          sx={{
            backgroundColor: theme.palette.background.default,
            color: theme.palette.text.primary,
          }}
        >
          Link a Family Member
        </DialogTitle>
        <DialogContent>
          {membersLoading ? (
            <Box textAlign="center" py={3}>
              <CircularProgress />
            </Box>
          ) : (
            <MemberFamilyForm
              memberId={memberId}
              allMembers={allMembers}
              onClose={() => {
                setOpenForm(false);
                loadLinks();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title="Confirm Deletion"
        content="Are you sure you want to delete this family link?"
        onClose={() => setConfirmDialog({ open: false, onConfirm: null })}
        onConfirm={confirmDialog.onConfirm}
      />

      {/* Snackbar Alert */}
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
