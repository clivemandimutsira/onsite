import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, List, ListItem, ListItemText,
  CircularProgress, IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import MemberPrayerRequestForm from '../../memberPrayerRequest/MemberPrayerRequestForm';
import {
  getMemberPrayerRequests,
  deletePrayerRequest,
  createPrayerRequest,
  updatePrayerRequest
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

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await getMemberPrayerRequests(memberId);
      setRequests(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load prayer requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (memberId) fetchRequests();
  }, [memberId]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this prayer request?')) return;
    try {
      await deletePrayerRequest(memberId, id);
      fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Prayer Requests</Typography>
        <Button
          variant="contained"
          onClick={() => {
            setEditing(null);
            setOpenForm(true);
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
                    setEditing(r);
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

      <MemberPrayerRequestForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        memberId={memberId}
        initialData={editing}
        onSaved={fetchRequests}
      />
    </Box>
  );
}
