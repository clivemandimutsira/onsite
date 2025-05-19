import { useEffect, useState, useContext } from 'react';
import {
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  useTheme,
} from '@mui/material';
import { Plus } from 'lucide-react'; // Import Plus icon
import { EditIcon, DeleteIcon } from '../../../components/common/ActionIcons'; // Use ActionIcons
import {
  getNextOfKinByMemberId,
  deleteNextOfKin,
} from '../../../api/nextOfKinService';
import NextOfKinForm from '../../../components/nextOfKin/NextOfKinForm';
import { AuthContext } from '../../../contexts/AuthContext';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import SnackbarAlert from '../../../components/common/SnackbarAlert';

const NextOfKinList = ({ memberId }) => {
  const theme = useTheme(); // Access the current theme
  const [list, setList] = useState([]);
  const [editing, setEditing] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, onConfirm: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const { permissions } = useContext(AuthContext);

  const canAdd = permissions.includes('add_next_of_kin') || permissions.includes('manage_next_of_kin');
  const canEdit = permissions.includes('edit_next_of_kin') || permissions.includes('manage_next_of_kin');
  const canDelete = permissions.includes('delete_next_of_kin') || permissions.includes('manage_next_of_kin');

  // Fetch Next of Kin data
  const loadNextOfKin = async () => {
    try {
      const data = await getNextOfKinByMemberId(memberId);
      setList(data);
    } catch (error) {
      console.error('Failed to load Next of Kin:', error);
      setSnackbar({ open: true, message: 'Failed to load next of kin records.', severity: 'error' });
    }
  };

  useEffect(() => {
    if (memberId) loadNextOfKin();
  }, [memberId]);

  // Handle editing of a Next of Kin record
  const handleEdit = (kin) => {
    setEditing(kin);
    setOpenForm(true);
  };

  // Handle opening the form for adding a new record
  const handleAdd = () => {
    setEditing(null);
    setOpenForm(true);
  };

  // Handle closing the form and refreshing the list
  const handleFormClose = () => {
    setOpenForm(false);
    loadNextOfKin(); // Refresh the list after adding or editing
  };

  // Handle deletion of a Next of Kin record
  const handleDelete = async (id) => {
    setConfirmDialog({
      open: true,
      onConfirm: async () => {
        try {
          await deleteNextOfKin(id);
          setSnackbar({ open: true, message: 'Next of kin deleted successfully.', severity: 'success' });
          loadNextOfKin(); // Refresh the list after deletion
        } catch (error) {
          console.error('Failed to delete next of kin:', error);
          setSnackbar({ open: true, message: 'Failed to delete next of kin.', severity: 'error' });
        } finally {
          setConfirmDialog({ open: false, onConfirm: null });
        }
      },
    });
  };

  // Handle snackbar close
  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: '', severity: 'success' });
  };

  return (
    <Box>
      {canAdd && (
        <Button
          startIcon={<Plus size={18} />} // Use Plus icon
          onClick={handleAdd}
          sx={{
            mb: 2,
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            },
          }}
        >
          Add Next of Kin
        </Button>
      )}

      {list.length === 0 ? (
        <Typography color={theme.palette.text.secondary}>No next of kin records found.</Typography>
      ) : (
        list.map((kin) => (
          <Box
            key={kin.id}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: `1px solid ${theme.palette.divider}`,
              py: 1,
            }}
          >
            <Typography color={theme.palette.text.primary}>
              <strong>{kin.name}</strong> — {kin.relationship} — {kin.contact}
            </Typography>
            <Box>
              {canEdit && (
                <EditIcon
                  onClick={() => handleEdit(kin)}
                  sx={{
                    color: theme.palette.info.main,
                    '&:hover': {
                      backgroundColor: theme.palette.info.light,
                    },
                  }}
                />
              )}
              {canDelete && (
                <DeleteIcon
                  onClick={() => handleDelete(kin.id)}
                  sx={{
                    color: theme.palette.error.main,
                    '&:hover': {
                      backgroundColor: theme.palette.error.light,
                    },
                  }}
                />
              )}
            </Box>
          </Box>
        ))
      )}

      {/* Next of Kin Form Dialog */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} fullWidth maxWidth="sm">
        <DialogTitle
          sx={{
            backgroundColor: theme.palette.background.default,
            color: theme.palette.text.primary,
          }}
        >
          {editing ? 'Edit' : 'Add'} Next of Kin
        </DialogTitle>
        <DialogContent>
          <NextOfKinForm
            memberId={memberId}
            initialData={editing}
            onClose={handleFormClose}
          />
        </DialogContent>
      </Dialog>

      {/* Confirm Deletion Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title="Confirm Deletion"
        content="Are you sure you want to delete this next of kin?"
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

export default NextOfKinList;
