// src/pages/EventDetail.jsx

import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchEventById, deleteEvent } from '../api/eventService';
import { fetchByEvent } from '../api/attendanceService';
import { AuthContext } from '../contexts/AuthContext';
import AttendanceWidget from './AttendanceWidget';
import ConfirmDialog from '../components/common/ConfirmDialog'; // Adjust the path as needed
import SnackbarAlert from '../components/common/SnackbarAlert'; // Adjust the path as needed
import {
  Box,
  Typography,
  CircularProgress,
  Chip,
  Grid,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  CheckCircle,
  QrCode,
  MapPin,
  Bell,
  RadioTower,
  Bluetooth,
  Mail,
  Edit,
  Trash2,
} from 'lucide-react';
import { parseISO, format } from 'date-fns';

const methodIcons = {
  manual: <CheckCircle size={16} />,
  qr: <QrCode size={16} />,
  geofence: <MapPin size={16} />,
  push: <Bell size={16} />,
  rfid: <RadioTower size={16} />,
  beacon: <Bluetooth size={16} />,
  code: <Mail size={16} />,
};

export default function EventDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { permissions } = useContext(AuthContext);

  const [event, setEvent] = useState(null);
  const [stats, setStats] = useState({});
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, onConfirm: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Load event info
  useEffect(() => {
    (async () => {
      setLoadingEvent(true);
      try {
        const ev = await fetchEventById(id);
        console.log('Loaded event:', ev);
        setEvent(ev);
      } catch (err) {
        console.error('Failed to load event', err);
        setSnackbar({ open: true, message: 'Failed to load event.', severity: 'error' });
      } finally {
        setLoadingEvent(false);
      }
    })();
  }, [id]);

  // Load attendance stats
  useEffect(() => {
    if (!event) return;
    (async () => {
      setLoadingStats(true);
      try {
        const recs = await fetchByEvent(event.id);
        const counts = recs.reduce((acc, r) => {
          acc[r.method] = (acc[r.method] || 0) + 1;
          return acc;
        }, {});
        setStats(counts);
      } catch (err) {
        console.error('Failed to load attendance stats', err);
        setSnackbar({ open: true, message: 'Failed to load attendance stats.', severity: 'error' });
      } finally {
        setLoadingStats(false);
      }
    })();
  }, [event]);

  const handleDeleteEvent = async () => {
    try {
      await deleteEvent(event.id);
      setSnackbar({ open: true, message: 'Event deleted successfully.', severity: 'success' });
      nav('/events');
    } catch (err) {
      console.error('Failed to delete event', err);
      setSnackbar({ open: true, message: 'Failed to delete event.', severity: 'error' });
    }
  };

  const openConfirmDialog = () => {
    setConfirmDialog({
      open: true,
      onConfirm: () => {
        handleDeleteEvent();
        setConfirmDialog({ open: false, onConfirm: null });
      },
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: '', severity: 'success' });
  };

  if (loadingEvent) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!event) {
    return (
      <Typography color="error" align="center" mt={4}>
        Event not found
      </Typography>
    );
  }

  // Parse and format date
  let formattedDate = 'Date not available';
  if (event.event_date) {
    try {
      const dateObj = typeof event.event_date === 'string'
        ? parseISO(event.event_date)
        : new Date(event.event_date);
      formattedDate = format(dateObj, 'PPPp');
    } catch (e) {
      console.warn('Error parsing date:', event.event_date, e);
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Grid container justifyContent="space-between" alignItems="center" mb={3}>
        <Grid item>
          <Typography variant="h4">{event.name}</Typography>
          <Typography color="text.secondary">{formattedDate}</Typography>
          <Typography color="text.secondary">{event.location}</Typography>
        </Grid>
        {permissions.includes('manage_events') && (
          <Grid item>
            <Tooltip title="Edit Event">
              <IconButton onClick={() => nav(`/events/${event.id}/edit`)}>
                <Edit size={20} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Event">
              <IconButton color="error" onClick={openConfirmDialog}>
                <Trash2 size={20} />
              </IconButton>
            </Tooltip>
          </Grid>
        )}
      </Grid>

      <Typography variant="h6" gutterBottom>
        Attendance by Method
      </Typography>
      {loadingStats ? (
        <CircularProgress />
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
          {Object.entries(methodIcons).map(([method, icon]) => (
            <Chip
              key={method}
              icon={icon}
              label={`${method.charAt(0).toUpperCase() + method.slice(1)}: ${stats[method] || 0}`}
              variant="outlined"
            />
          ))}
        </Box>
      )}

      <Typography variant="h6" gutterBottom>
        Check-In
      </Typography>
      <AttendanceWidget
        memberId={event.member_id}
        eventId={event.id}
        qrToken={event.qr_token}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        title="Confirm Deletion"
        content="Are you sure you want to delete this event?"
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
