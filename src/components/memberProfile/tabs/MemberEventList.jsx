import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Divider,
  Card,
  CardContent,
  Stack,
  Chip,
  CircularProgress,
} from '@mui/material';
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

  if (loading) return <CircularProgress sx={{ mb: 4 }} />;

  return (
    <Box sx={{ mb: 4 }}>
      {/* Upcoming Events Section */}
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Upcoming Events
          </Typography>

          {upcomingEvents.length === 0 ? (
            <Typography>No upcoming events.</Typography>
          ) : (
            <List>
              {upcomingEvents.map((event) => (
                <Box key={event.id} sx={{ mb: 3 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <ListItem>
                        <ListItemText
                          primary={event.name}
                          secondary={new Date(event.event_date).toLocaleString()}
                        />
                        {!event.is_registered && !event.has_attended && (
                          <Button
                            onClick={() => openConfirmDialog(event.id)}
                            variant="contained"
                            color="primary"
                            sx={{ ml: 2 }}
                          >
                            Register
                          </Button>
                        )}
                      </ListItem>

                      {event.is_registered && !event.has_attended && (
                        <Box sx={{ mt: 2 }}>
                          <AttendanceWidget
                            memberId={memberId}
                            eventId={event.id}
                            qrToken={event.qr_token}
                          />
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                  <Divider sx={{ my: 2 }} />
                </Box>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Past Events Section */}
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Past Events
          </Typography>

          {pastEvents.length === 0 ? (
            <Typography>No past events.</Typography>
          ) : (
            <List>
              {pastEvents.map((event) => (
                <Card variant="outlined" key={event.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <ListItem>
                      <ListItemText
                        primary={event.name}
                        secondary={`${new Date(event.event_date).toLocaleString()} - ${event.location}`}
                      />
                    </ListItem>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Chip label={`Location: ${event.location}`} color="primary" />
                      <Chip label={`Date: ${new Date(event.event_date).toLocaleDateString()}`} color="secondary" />
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Confirm Registration Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title="Confirm Registration"
        content="Are you sure you want to register for this event?"
        onClose={() => setConfirmDialog({ open: false, onConfirm: null })}
        onConfirm={confirmDialog.onConfirm}
      />

      {/* Snackbar Alert for Registration Feedback */}
      <SnackbarAlert
        open={snackbar.open}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Box>
  );
}
