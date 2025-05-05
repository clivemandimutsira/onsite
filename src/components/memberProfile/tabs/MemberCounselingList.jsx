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
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import MemberCounselingForm from '../../memberCounseling/MemberCounselingForm';
import { getMemberCounselings, deleteMemberCounseling } from '../../../api/memberCounselingApi';
import { useAuth } from '../../../contexts/AuthContext';

export default function MemberCounselingList({ memberId: propMemberId }) {
  const { user } = useAuth();
  const memberId = propMemberId || user?.id;

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [error, setError] = useState(null);

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
            setEditing(null);
            setOpenForm(true);
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
                      setEditing(s);
                      setOpenForm(true);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() =>
                      deleteMemberCounseling(memberId, s.member_counseling_id, s.id).then(fetchList)
                    }
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
        onClose={() => setOpenForm(false)}
        memberId={memberId}
        initialData={editing}
        onSaved={fetchList}
      />
    </Box>
  );
}



