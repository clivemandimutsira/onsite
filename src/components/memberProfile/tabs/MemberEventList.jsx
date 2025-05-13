import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Divider,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  fetchEventsByMember,
  fetchUpcomingEventsWithStatus,
  registerForEvent,
} from '../../../api/eventService';
import AttendanceWidget from '../../../pages/AttendanceWidget';
import ConfirmDialog from '../../common/ConfirmDialog';
import SnackbarAlert from '../../common/SnackbarAlert'; // Import your SnackbarAlert component

export default function MemberEventList({ memberId }) {
  const [pastEvents, setPastEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, onConfirm: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const past = await fetchEventsByMember(memberId);
        const upcoming = await fetchUpcomingEventsWithStatus(memberId);

        setPastEvents(past || []);
        setUpcomingEvents(upcoming || []);
      } catch (err) {
        console.error('Error loading events:', err);
        setPastEvents([]);
        setUpcomingEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [memberId]);

  const handleRegister = async (eventId) => {
    try {
      await registerForEvent(memberId, eventId);

      const registeredEvent = upcomingEvents.find((event) => event.id === eventId);
      if (registeredEvent) {
        // Update status instead of moving it to past
        setUpcomingEvents((prev) =>
          prev.map((ev) =>
            ev.id === eventId ? { ...ev, is_registered: true } : ev
          )
        );
      }

      setConfirmDialog({ open: false, onConfirm: null });
      setSnackbar({ open: true, message: 'Successfully registered for the event!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to register: ' + err.message, severity: 'error' });
    }
  };

  const openConfirmDialog = (eventId) => {
    setConfirmDialog({
      open: true,
      onConfirm: () => handleRegister(eventId),
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const pastRows = pastEvents.map((ev) => ({
    id: ev.id,
    name: ev.name,
    date: new Date(ev.event_date).toLocaleString(),
    location: ev.location,
  }));

  const columns = [
    { field: 'name', headerName: 'Event Name', flex: 1 },
    { field: 'date', headerName: 'Date', flex: 1 },
    { field: 'location', headerName: 'Location', flex: 1 },
  ];

  if (loading) return <div>Loading events...</div>;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Upcoming Events
      </Typography>
      <List>
        {upcomingEvents.length === 0 ? (
          <ListItem>
            <ListItemText primary="No upcoming events." />
          </ListItem>
        ) : (
          upcomingEvents.map((event) => (
            <Box key={event.id} sx={{ mb: 3 }}>
              <ListItem>
                <ListItemText
                  primary={event.name}
                  secondary={new Date(event.event_date).toLocaleString()}
                />
                {!event.is_registered && !event.has_attended && (
                  <Button
                    onClick={() => openConfirmDialog(event.id)}
                    variant="outlined"
                  >
                    Register
                  </Button>
                )}
              </ListItem>
              {event.is_registered && !event.has_attended && (
                <Box sx={{ px: 2 }}>
                  <AttendanceWidget
                    memberId={memberId}
                    eventId={event.id}
                    qrToken={event.qr_token}
                  />
                </Box>
              )}
              <Divider sx={{ my: 2 }} />
            </Box>
          ))
        )}
      </List>

      <Typography variant="h5" gutterBottom sx={{ mt: 5 }}>
        Past Events
      </Typography>
      <Box sx={{ height: 400 }}>
        <DataGrid rows={pastRows} columns={columns} />
      </Box>

      <ConfirmDialog
        open={confirmDialog.open}
        title="Confirm Registration"
        content="Are you sure you want to register for this event?"
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