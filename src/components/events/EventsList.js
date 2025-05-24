import React, { useEffect, useState, useMemo, useContext } from 'react';
import {
  Box,
  Typography,
  Stack,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Pagination,
  Grid,
  Card,
  CardContent,
  CardActions,
  Tooltip,
  Fab,
  CircularProgress,
} from '@mui/material';
import { CSVLink } from 'react-csv';
import { Plus, EyeIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchEvents, deleteEvent } from '../../api/eventService';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import ConfirmDialog from '../common/ConfirmDialog';
import SnackbarAlert from '../common/SnackbarAlert';
import { EditIcon, DeleteIcon } from '../common/ActionIcons';
import { AuthContext } from '../../contexts/AuthContext';
import { isAfter, isBefore, startOfDay } from 'date-fns';

export default function EventsList() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;
  const [dateRange, setDateRange] = useState([null, null]);
  const [viewMode, setViewMode] = useState('list'); // list or card view
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, onConfirm: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [eventTimeFilter, setEventTimeFilter] = useState('all'); // 'all' | 'upcoming' | 'past'

  const nav = useNavigate();
  const { permissions } = useContext(AuthContext);
  const canCreate = permissions?.includes('create_events');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await fetchEvents();
        setEvents(data);
      } catch (err) {
        setSnackbar({ open: true, message: 'Failed to load events.', severity: 'error' });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const locations = useMemo(() => [...new Set(events.map(e => e.location).filter(Boolean))], [events]);

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // Search filter
      const nameMatch = event.name.toLowerCase().includes(search.toLowerCase());
      // Location filter
      const locationMatch = locationFilter === '' || event.location === locationFilter;
      // Date Range filter
      const dateMatch =
        (!dateRange[0] || new Date(event.event_date) >= dateRange[0]) &&
        (!dateRange[1] || new Date(event.event_date) <= dateRange[1]);
      // Past/Upcoming filter
      const now = startOfDay(new Date());
      let timeMatch = true;
      if (eventTimeFilter === 'upcoming') {
        timeMatch = isAfter(new Date(event.event_date), now);
      } else if (eventTimeFilter === 'past') {
        timeMatch = isBefore(new Date(event.event_date), now);
      }
      return nameMatch && locationMatch && dateMatch && timeMatch;
    });
  }, [events, search, locationFilter, dateRange, eventTimeFilter]);

  const paginatedEvents = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredEvents.slice(start, start + rowsPerPage);
  }, [filteredEvents, page]);

  const totalPages = Math.ceil(filteredEvents.length / rowsPerPage);

  // For CSV export, include only visible columns
  const csvHeaders = [
    { label: 'Name', key: 'name' },
    { label: 'Date', key: 'event_date' },
    { label: 'Location', key: 'location' },
    { label: 'Attendance', key: 'attendance_count' },
  ];

  // Delete logic
  const handleDelete = async (id) => {
    try {
      await deleteEvent(id);
      setEvents((prev) => prev.filter((event) => event.id !== id));
      setSnackbar({ open: true, message: 'Event deleted successfully.', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete event.', severity: 'error' });
    }
  };

  const openConfirmDialog = (id) => {
    setConfirmDialog({
      open: true,
      onConfirm: () => {
        handleDelete(id);
        setConfirmDialog({ open: false, onConfirm: null });
      },
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: '', severity: 'success' });
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      <Card
        variant="outlined"
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: 3,
          minHeight: '90vh',
          maxWidth: 900,
          mx: 'auto',
          mb: 4,
          border: '0.875px solid',
          borderColor: (theme) =>
            theme.palette.mode === 'dark'
              ? theme.palette.common.white
              : theme.palette.grey[400],
          bgcolor: 'transparent',
          boxShadow: 'none',
          color: 'text.primary',
          transition: 'border-color 0.3s',
        }}
      >
        

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={3}>
          <TextField
            fullWidth
            size="small"
            label="Search events"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <FormControl fullWidth size="small">
            <InputLabel>Filter by Location</InputLabel>
            <Select
              value={locationFilter}
              label="Filter by Location"
              onChange={(e) => {
                setLocationFilter(e.target.value);
                setPage(1);
              }}
            >
              <MenuItem value="">All</MenuItem>
              {locations.map(loc => (
                <MenuItem key={loc} value={loc}>{loc}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Show</InputLabel>
            <Select
              value={eventTimeFilter}
              label="Show"
              onChange={e => {
                setEventTimeFilter(e.target.value);
                setPage(1);
              }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="upcoming">Upcoming</MenuItem>
              <MenuItem value="past">Past</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {/* Date Range Filter + Actions Row */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Box sx={{ flex: 1 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateRangePicker
                startText="Start Date"
                endText="End Date"
                value={dateRange}
                onChange={(newRange) => {
                  setDateRange(newRange);
                  setPage(1);
                }}
                renderInput={(startProps, endProps) => (
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField {...startProps} fullWidth size="small" />
                    <TextField {...endProps} fullWidth size="small" />
                  </Stack>
                )}
              />
            </LocalizationProvider>
          </Box>
          <Button
            variant="outlined"
            onClick={() => setViewMode(viewMode === 'list' ? 'card' : 'list')}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Switch to {viewMode === 'list' ? 'Card' : 'List'} View
          </Button>
          <Button variant="outlined" sx={{ whiteSpace: 'nowrap' }}>
            <CSVLink
              data={paginatedEvents}
              headers={csvHeaders}
              filename="events_page.csv"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              Export This Page to CSV
            </CSVLink>
          </Button>
        </Stack>

        {/* Events Display */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
            <CircularProgress />
          </Box>
        ) : paginatedEvents.length === 0 ? (
          <Typography variant="body1" color="text.secondary" mt={4}>
            No events match your filters.
          </Typography>
        ) : viewMode === 'list' ? (
          <Stack spacing={2} mt={3}>
            {paginatedEvents.map(event => (
              <Box key={event.id} sx={{ border: '1px solid #ddd', borderRadius: 2, p: 2 }}>
                <Typography variant="h6">{event.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(event.event_date).toLocaleString()} | {event.location}
                </Typography>
                {event.attendance_count && (
                  <Typography variant="body2" color="text.primary" sx={{ mt: 1 }}>
                    Attendees: {event.attendance_count}
                  </Typography>
                )}
                <Stack direction="row" spacing={1} mt={1}>
                  <Tooltip title="View Event">
                    <Button size="small" onClick={() => nav(`/events/${event.id}`)}>
                      <EyeIcon size={18} style={{ marginRight: 4 }} />
                    </Button>
                  </Tooltip>
                  <Tooltip title="Edit Event">
                    <Button size="small" onClick={() => nav(`/events/${event.id}/edit`)}>
                      <EditIcon fontSize="small" sx={{ mr: 0.5 }} />
                    </Button>
                  </Tooltip>
                  <Tooltip title="Delete Event">
                    <Button size="small" color="error" onClick={() => openConfirmDialog(event.id)}>
                      <DeleteIcon fontSize="small" sx={{ mr: 0.5 }} />
                    </Button>
                  </Tooltip>
                </Stack>
              </Box>
            ))}
          </Stack>
        ) : (
          <Grid container spacing={2} mt={3}>
            {paginatedEvents.map(event => (
              <Grid item xs={12} sm={6} md={4} key={event.id}>
                <Card
                  sx={{
                    boxShadow: (theme) => theme.shadows[1], // Use theme shadows
                    borderRadius: (theme) => theme.shape.borderRadius, // Use theme border radius
                    backgroundColor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? theme.palette.background.paper
                        : theme.palette.background.default, // Use theme background
                    color: (theme) => theme.palette.text.primary, // Use theme text color
                    paddingX: (theme) => theme.spacing(2), // Use theme spacing
                  }}
                >
                  <CardContent>
                    <Typography variant="h6">{event.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(event.event_date).toLocaleString()} | {event.location}
                    </Typography>
                    {event.attendance_count && (
                      <Typography variant="body2" color="text.primary" sx={{ mt: 1 }}>
                        Attendees: {event.attendance_count}
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions>
                    <Tooltip >
                      <Button size="small" onClick={() => nav(`/events/${event.id}`)}>
                        <EyeIcon size={18} style={{ marginRight: 4 }} />
                      </Button>
                    </Tooltip>
                    <Tooltip >
                      <Button size="small" onClick={() => nav(`/events/${event.id}/edit`)}>
                        <EditIcon fontSize="small" sx={{ mr: 0.5 }} />
                      </Button>
                    </Tooltip>
                    <Tooltip >
                      <Button size="small" color="error" onClick={() => openConfirmDialog(event.id)}>
                        <DeleteIcon fontSize="small" sx={{ mr: 0.5 }} />
                      </Button>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {totalPages > 1 && (
          <Stack alignItems="center" mt={3}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, val) => setPage(val)}
              color="primary"
            />
          </Stack>
        )}

        {/* Floating Add Button */}
        {canCreate && (
          <Tooltip title="Add New Event">
            <Fab
              color="primary"
              onClick={() => nav('/events/new')}
              sx={{ position: 'fixed', bottom: 24, right: 24 }}
            >
              <Plus size={20} />
            </Fab>
          </Tooltip>
        )}

        {/* Confirm Dialog */}
        <ConfirmDialog
          open={confirmDialog.open}
          title="Confirm Deletion"
          content="Are you sure you want to delete this event?"
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
      </Card>
    </Box>
  );
}
