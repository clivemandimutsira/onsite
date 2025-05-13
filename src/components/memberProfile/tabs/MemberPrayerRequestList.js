import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, List, ListItem, ListItemText,
  CircularProgress, IconButton, Snackbar
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import MemberPrayerRequestForm from '../../memberPrayerRequest/MemberPrayerRequestForm';
import {
  getMemberPrayerRequests,
  deletePrayerRequest,
} from '../../../api/memberPrayerRequestApi';
import { useAuth } from '../../../contexts/AuthContext';

export default function MemberPrayerRequestList({ memberId: propMemberId }) {
  const { user } = useAuth();
  const memberId = propMemberId || user?.id;

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch prayer requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await getMemberPrayerRequests(memberId);
      setRequests(data);
    } catch (err) {
      setError('Failed to load prayer requests.');
      setSuccessMessage('');
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
    if (!window.confirm('Delete this prayer request?')) return;

    try {
      await deletePrayerRequest(memberId, id);
      setSuccessMessage('Prayer request deleted successfully.');
      fetchRequests(); // Refresh the list after deleting
    } catch (err) {
      setError('Failed to delete prayer request.');
      setSuccessMessage('');
    }
  };

  // Handle closing snackbar
  const handleCloseSnackbar = () => {
    setError('');
    setSuccessMessage('');
  };

  // Render the list of prayer requests
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Prayer Requests</Typography>
        <Button
          variant="contained"
          onClick={() => {
            setEditing(null);  // Reset editing state
            setOpenForm(true);  // Open form for a new request
          }}
        >
          New Request
        </Button>
      </Box>

      {loading ? (
        <Box textAlign="center"><CircularProgress /></Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : requests.length === 0 ? (
        <Typography>No prayer requests found.</Typography>
      ) : (
        <List>
          {requests.map(r => (
            <ListItem
              key={r.id}
              secondaryAction={
                <>
                  <IconButton onClick={() => {
                    setEditing(r);  // Set the request to edit
                    setOpenForm(true);
                  }}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(r.id)}>
                    <DeleteIcon />
                  </IconButton>
                </>
              }
            >
              <ListItemText
                primary={r.request}
                secondary={`Status: ${r.status || 'Pending'} | Created: ${new Date(r.created_at).toLocaleDateString()}`}
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
        initialData={editing}  // Pass the editing data if available
        onSaved={() => {
          setOpenForm(false);
          fetchRequests();  // Refresh the list after saving
        }}  
      />

      {/* Snackbar for success and error messages */}
      <Snackbar
        open={!!error || !!successMessage}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={error || successMessage}
        severity={error ? 'error' : 'success'}
      />
    </Box>
  );
}
