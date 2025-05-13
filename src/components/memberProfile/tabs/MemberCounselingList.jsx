import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'; // Updated import

import MemberCounselingForm from '../../memberCounseling/MemberCounselingForm';
import { getMemberCounselings, deleteMemberCounseling } from '../../../api/memberCounselingApi';
import { useAuth } from '../../../contexts/AuthContext';
import ConfirmDialog from '../../common/ConfirmDialog';
import SnackbarAlert from '../../common/SnackbarAlert';

export default function MemberCounselingList({ memberId: propMemberId }) {
  const { user } = useAuth();
  const memberId = propMemberId || user?.id;

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [error, setError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, onConfirm: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch counseling sessions
  const fetchList = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMemberCounselings(memberId);
      setSessions(data);
    } catch (err) {
      console.error(err);
      setError('Could not load your bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!memberId) return;
    fetchList();
  }, [memberId]);

  const handleDelete = async (sessionId) => {
    try {
      await deleteMemberCounseling(memberId, sessionId);
      setSnackbar({ open: true, message: 'Counseling session deleted successfully.', severity: 'success' });
      fetchList();
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Failed to delete counseling session.', severity: 'error' });
    }
  };

  const openConfirmDialog = (sessionId) => {
    setConfirmDialog({
      open: true,
      onConfirm: () => {
        handleDelete(sessionId);
        setConfirmDialog({ open: false, onConfirm: null });
      },
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: '', severity: 'success' });
  };

  if (!memberId) {
    return <Typography>Loading member info…</Typography>;
  }

  if (loading) {
    return (
      <Box textAlign="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" mt={2}>
        <Typography color="error">{error}</Typography>
        <Button onClick={fetchList}>Retry</Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Your Counseling Bookings</Typography>
        <Button
          variant="contained"
          onClick={() => {
            setEditing(null); // Reset any previous editing session
            setOpenForm(true); // Open the form to add a new session
          }}
        >
          New Booking
        </Button>
      </Box>

      {sessions.length === 0 ? (
        <Typography color="textSecondary">You have no bookings yet.</Typography>
      ) : (
        <List>
          {sessions.map((s) => (
            <ListItem
              key={s.member_counseling_id}
              secondaryAction={
                <>
                  <IconButton
                    edge="end"
                    aria-label="edit"
                    onClick={() => {
                      setEditing(s); // Set the session to edit
                      setOpenForm(true); // Open the form to edit the session
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => openConfirmDialog(s.member_counseling_id)} // Open confirmation for delete
                  >
                    <DeleteIcon />
                  </IconButton>
                </>
              }
            >
              <ListItemText
                primary={`${s.date} ${s.time} — ${s.counselor_name}`}
                secondary={`Mode: ${s.mode}, Status: ${s.status}`}
              />
            </ListItem>
          ))}
        </List>
      )}

      <MemberCounselingForm
        open={openForm}
        onClose={() => setOpenForm(false)} // Close the form
        memberId={memberId}
        initialData={editing} // Pass the session data for editing if any
        onSaved={fetchList} // Reload the list after saving or editing
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title="Confirm Deletion"
        content="Are you sure you want to delete this counseling session?"
        onClose={() => setConfirmDialog({ open: false, onConfirm: null })} // Close the dialog without deleting
        onConfirm={confirmDialog.onConfirm} // Confirm deletion
      />

      {/* Snackbar */}
      <SnackbarAlert
        open={snackbar.open}
        onClose={handleCloseSnackbar} // Close snackbar
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Box>
  );
}
