// src/pages/EventsList.jsx
import React, { useEffect, useState, useContext } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Fab, Tooltip } from '@mui/material';
import { Plus, EyeIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { fetchEvents, deleteEvent } from '../../api/eventService';
import { AuthContext } from '../../contexts/AuthContext';
import ConfirmDialog from '../common/ConfirmDialog';
import SnackbarAlert from '../common/SnackbarAlert';
import { EditIcon, DeleteIcon } from '../common/ActionIcons';

export default function EventsList() {
  const [rows, setRows] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, onConfirm: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const nav = useNavigate();
  const { permissions } = useContext(AuthContext);

  const canCreate = permissions.includes('create_events');

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchEvents();
        setRows(data);
      } catch (err) {
        console.error('Failed to load events:', err);
        setSnackbar({ open: true, message: 'Failed to load events.', severity: 'error' });
      }
    })();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteEvent(id);
      setRows((prev) => prev.filter((r) => r.id !== id));
      setSnackbar({ open: true, message: 'Event deleted successfully.', severity: 'success' });
    } catch (err) {
      console.error('Failed to delete event:', err);
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

  const cols = [
    { field: 'name', headerName: 'Name', flex: 1 },
    {
      field: 'event_date',
      headerName: 'Date',
      flex: 1,
      valueFormatter: ({ value }) =>
        value ? new Date(value).toLocaleString() : '',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      flex: 1,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="View Event">
            <EyeIcon onClick={() => nav(`/events/${row.id}`)} />
          </Tooltip>
          <Tooltip title="Edit Event">
            <EditIcon onClick={() => nav(`/events/${row.id}/edit`)} />
          </Tooltip>
          <Tooltip title="Delete Event">
            <DeleteIcon onClick={() => openConfirmDialog(row.id)} />
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ height: 600, width: '100%', position: 'relative', pb: 6 }}>
      <DataGrid
        rows={rows}
        columns={cols}
        getRowId={(r) => r.id}
      />

      {canCreate && (
        <Tooltip title="Add New Event">
          <Fab
            color="primary"
            onClick={() => nav('/events/new')}
            sx={{ position: 'absolute', bottom: 16, right: 16 }}
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

      {/* Snackbar */}
      <SnackbarAlert
        open={snackbar.open}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Box>
  );
}
