import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { EditIcon, DeleteIcon } from '../../common/ActionIcons'; // Use ActionIcons
import SnackbarAlert from '../../common/SnackbarAlert'; // Use SnackbarAlert
import ConfirmDialog from '../../common/ConfirmDialog'; // Use ConfirmDialog

import MemberPrayerRequestForm from '../../memberPrayerRequest/MemberPrayerRequestForm';
import {
  getMemberPrayerRequests,
  deletePrayerRequest,
} from '../../../api/memberPrayerRequestApi';
import { useAuth } from '../../../contexts/AuthContext';

export default function MemberPrayerRequestList({ memberId: propMemberId }) {
  const theme = useTheme(); // Access the current theme
  const { user } = useAuth();
  const memberId = propMemberId || user?.id;

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, onConfirm: null });

  // Fetch prayer requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await getMemberPrayerRequests(memberId);
      setRequests(data);
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to load prayer requests.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch prayer requests on mount or when memberId changes
  useEffect(() => {
    if (memberId) {
      fetchRequests();
    }
  }, [memberId]);

  // Handle deleting prayer request
  const handleDelete = async (id) => {
    setConfirmDialog({
      open: true,
      onConfirm: async () => {
        try {
          await deletePrayerRequest(memberId, id);
          setSnackbar({ open: true, message: 'Prayer request deleted successfully.', severity: 'success' });
          fetchRequests(); // Refresh the list after deleting
        } catch (err) {
          setSnackbar({ open: true, message: 'Failed to delete prayer request.', severity: 'error' });
        } finally {
          setConfirmDialog({ open: false, onConfirm: null });
        }
      },
    });
  };

  // Handle closing snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: '', severity: 'success' });
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" color={theme.palette.text.primary}>
          Prayer Requests
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            setEditing(null); // Reset editing state
            setOpenForm(true); // Open form for a new request
          }}
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            },
          }}
        >
          New Request
        </Button>
      </Box>

      {loading ? (
        <Box textAlign="center">
          <CircularProgress />
        </Box>
      ) : requests.length === 0 ? (
        <Typography color={theme.palette.text.secondary}>No prayer requests found.</Typography>
      ) : (
        <List>
          {requests.map((r) => (
            <ListItem
              key={r.id}
              secondaryAction={
                <>
                  <EditIcon
                    onClick={() => {
                      setEditing(r); // Set the request to edit
                      setOpenForm(true);
                    }}
                    sx={{
                      color: theme.palette.info.main,
                      '&:hover': {
                        backgroundColor: theme.palette.info.light,
                      },
                    }}
                  />
                  <DeleteIcon
                    onClick={() => handleDelete(r.id)}
                    sx={{
                      color: theme.palette.error.main,
                      '&:hover': {
                        backgroundColor: theme.palette.error.light,
                      },
                    }}
                  />
                </>
              }
            >
              <ListItemText
                primary={r.request}
                secondary={`Status: ${r.status || 'Pending'} | Created: ${new Date(r.created_at).toLocaleDateString()}`}
                sx={{ color: theme.palette.text.primary }}
              />
            </ListItem>
          ))}
        </List>
      )}

      {/* Prayer request form */}
      <MemberPrayerRequestForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        memberId={memberId}
        initialData={editing} // Pass the editing data if available
        onSaved={() => {
          setOpenForm(false);
          fetchRequests(); // Refresh the list after saving
        }}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title="Confirm Deletion"
        content="Are you sure you want to delete this prayer request?"
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
}
