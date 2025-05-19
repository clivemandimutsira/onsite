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
import { EditIcon, DeleteIcon } from '../../common/ActionIcons'; // Import custom ActionIcons

import MemberCounselingForm from '../../memberCounseling/MemberCounselingForm';
import { getMemberCounselings, deleteMemberCounseling } from '../../../api/memberCounselingApi';
import { useAuth } from '../../../contexts/AuthContext';
import ConfirmDialog from '../../common/ConfirmDialog';
import SnackbarAlert from '../../common/SnackbarAlert';

export default function MemberCounselingList({ memberId: propMemberId }) {
  const theme = useTheme(); // Access the current theme
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
        <Typography color={theme.palette.error.main}>{error}</Typography>
        <Button
          onClick={fetchList}
          sx={{
            mt: 2,
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            },
          }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" color={theme.palette.text.primary}>
          Your Counseling Bookings
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            setEditing(null);
            setOpenForm(true);
          }}
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            },
          }}
        >
          New Booking
        </Button>
      </Box>

      {sessions.length === 0 ? (
        <Typography color={theme.palette.text.secondary}>You have no bookings yet.</Typography>
      ) : (
        <List>
          {sessions.map((s) => (
            <ListItem
              key={s.member_counseling_id}
              secondaryAction={
                <>
                  <EditIcon
                    onClick={() => {
                      setEditing(s);
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
                    onClick={() => openConfirmDialog(s.member_counseling_id)}
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
                primary={`${s.date} ${s.time} — ${s.counselor_name}`}
                secondary={`Mode: ${s.mode}, Status: ${s.status}`}
                sx={{ color: theme.palette.text.primary }}
              />
            </ListItem>
          ))}
        </List>
      )}

      <MemberCounselingForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        memberId={memberId}
        initialData={editing}
        onSaved={fetchList}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        title="Confirm Deletion"
        content="Are you sure you want to delete this counseling session?"
        onClose={() => setConfirmDialog({ open: false, onConfirm: null })}
        onConfirm={confirmDialog.onConfirm}
      />

      <SnackbarAlert
        open={snackbar.open}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Box>
  );
}
