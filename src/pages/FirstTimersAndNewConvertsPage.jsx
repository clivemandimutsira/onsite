import React, { useEffect, useState, useCallback } from 'react';
import {
  Container, Typography, Box, Button, Dialog, DialogTitle,
  DialogContent, IconButton, Snackbar, Alert, TextField, MenuItem,
  Tabs, Tab
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Edit, Trash, Plus } from 'lucide-react';
import CloseIcon from '@mui/icons-material/Close';
import Autocomplete from '@mui/material/Autocomplete';
import { parseISO, format } from 'date-fns';

import {
  getAllFirstTimers, createFirstTimer, updateFirstTimer, deleteFirstTimer
} from '../api/ftService';
import {
  getAllNewConverts, createNewConvert, deleteNewConvert, updateNewConvert
} from '../api/ncService';
import { getMembers } from '../api/memberService';
import { runManualStatusUpdate } from '../api/adminService';

const FirstTimersAndNewConvertsPage = () => {
  const [tab, setTab] = useState(0);
  const [firstTimers, setFirstTimers] = useState([]);
  const [newConverts, setNewConverts] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [ftData, ncData, memberData] = await Promise.all([
        getAllFirstTimers(), getAllNewConverts(), getMembers()
      ]);
      setFirstTimers(ftData);
      setNewConverts(ncData);
      setMembers(memberData);
    } catch {
      showSnackbar('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleDialogOpen = (item = null) => {
    setEditMode(!!item);
    setSelected(item);
    if (tab === 0) {
      setForm(item ? {
        member_id: item.member_id,
        member_name: item.member_name || '',
        registration_date: item.registration_date || '',
        how_heard: item.how_heard || ''
      } : {
        member_id: '',
        member_name: '',
        registration_date: '',
        how_heard: ''
      });
    } else {
      setForm(item ? {
        member_id: item.member_id,
        member_name: item.member_name || '',
        conversion_date: item.conversion_date ? format(parseISO(item.conversion_date), 'yyyy-MM-dd') : '',
        conversion_type: item.conversion_type || '',
        baptism_scheduled: item.baptism_scheduled || false,
        baptism_date: item.baptism_date ? format(parseISO(item.baptism_date), 'yyyy-MM-dd') : ''
      } : {
        member_id: '',
        member_name: '',
        conversion_date: '',
        conversion_type: '',
        baptism_scheduled: false,
        baptism_date: ''
      });
    }
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelected(null);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async () => {
    try {
      const matched = members.find(
        (m) => `${m.first_name} ${m.surname}`.toLowerCase() === form.member_name.toLowerCase()
      );

      if (tab === 0) {
        const payload = {
          member_id: matched ? matched.id : form.member_id,
          registration_date: form.registration_date,
          how_heard: form.how_heard
        };
        if (editMode && selected?.id) {
          await updateFirstTimer(selected.id, payload);
          showSnackbar('First timer updated!');
        } else {
          await createFirstTimer(payload);
          showSnackbar('First timer added!');
        }
      } else {
        const payload = {
          member_id: matched ? matched.id : form.member_id,
          conversion_date: form.conversion_date,
          conversion_type: form.conversion_type,
          baptism_scheduled: form.baptism_scheduled,
          baptism_date: form.baptism_scheduled ? form.baptism_date : null
        };
        if (editMode && selected?.id) {
          await updateNewConvert(selected.id, payload);
          showSnackbar('New convert updated!');
        } else {
          await createNewConvert(payload);
          showSnackbar('New convert added!');
        }
      }
      fetchData();
      handleDialogClose();
    } catch {
      showSnackbar('Failed to save', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      if (tab === 0) {
        await deleteFirstTimer(id);
      } else {
        await deleteNewConvert(id);
      }
      showSnackbar('Deleted successfully');
      fetchData();
    } catch {
      showSnackbar('Delete failed', 'error');
    }
  };

  const handleManualTrigger = async () => {
    try {
      await runManualStatusUpdate();
      showSnackbar('Manual update complete!');
      fetchData();
    } catch {
      showSnackbar('Manual update failed', 'error');
    }
  };

  const columnsFirstTimers = [
    { field: 'member_name', headerName: 'Member Name', flex: 1.5 },
    { field: 'how_heard', headerName: 'How Heard', flex: 1.5 },
    { field: 'registration_date', headerName: 'Date', flex: 1 },
    {
      field: 'actions', headerName: 'Actions', flex: 1, sortable: false,
      renderCell: ({ row }) => (
        <Box>
          <IconButton onClick={() => handleDialogOpen(row)} color="primary">
            <Edit size={18} />
          </IconButton>
          <IconButton onClick={() => handleDelete(row.id)} color="error">
            <Trash size={18} />
          </IconButton>
        </Box>
      )
    }
  ];

  const columnsNewConverts = [
    { field: 'member_name', headerName: 'Member Name', flex: 1.5 },
    { field: 'conversion_type', headerName: 'Type', flex: 1 },
    { field: 'conversion_date', headerName: 'Converted', flex: 1 },
    {
      field: 'baptism_scheduled', headerName: 'Baptism Scheduled?', flex: 1,
      renderCell: (params) => (params.value ? 'Yes' : 'No')
    },
    { field: 'baptism_date', headerName: 'Baptism Date', flex: 1 },
    {
      field: 'actions', headerName: 'Actions', flex: 1, sortable: false,
      renderCell: ({ row }) => (
        <Box>
          <IconButton onClick={() => handleDialogOpen(row)} color="primary">
            <Edit size={18} />
          </IconButton>
          <IconButton onClick={() => handleDelete(row.id)} color="error">
            <Trash size={18} />
          </IconButton>
        </Box>
      )
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Tabs value={tab} onChange={(e, newVal) => setTab(newVal)} sx={{ mb: 2 }}>
        <Tab label="First Timers" />
        <Tab label="New Converts" />
      </Tabs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">{tab === 0 ? 'First Timers' : 'New Converts'}</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button onClick={handleManualTrigger} variant="outlined">
            Run Manual Update
          </Button>
          <Button startIcon={<Plus />} variant="contained" onClick={() => handleDialogOpen()}>
            Add {tab === 0 ? 'First Timer' : 'New Convert'}
          </Button>
        </Box>
      </Box>

      <Box sx={{ height: 500 }}>
        <DataGrid
          rows={tab === 0 ? firstTimers : newConverts}
          columns={tab === 0 ? columnsFirstTimers : columnsNewConverts}
          getRowId={(row) => row.id}
          loading={loading}
          pageSize={10}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Box>

      <Dialog open={dialogOpen} onClose={handleDialogClose} fullWidth maxWidth="sm">
        <DialogTitle>
          {editMode ? `Edit ${tab === 0 ? 'First Timer' : 'New Convert'}` : `Add ${tab === 0 ? 'First Timer' : 'New Convert'}`}
          <IconButton onClick={handleDialogClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Autocomplete
            freeSolo
            options={members.map((m) => `${m.first_name} ${m.surname}`)}
            value={form.member_name}
            onChange={(e, newValue) => {
              const matched = members.find((m) => `${m.first_name} ${m.surname}` === newValue);
              setForm(prev => ({ ...prev, member_name: newValue || '', member_id: matched ? matched.id : '' }));
            }}
            onInputChange={(e, newInputValue) => setForm(prev => ({ ...prev, member_name: newInputValue }))}
            renderInput={(params) => <TextField {...params} label="Member Name" fullWidth />}
          />

          {tab === 0 ? (
            <>
              <TextField
                label="Registration Date"
                type="date"
                name="registration_date"
                value={form.registration_date}
                onChange={handleFormChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <Autocomplete
                freeSolo
                options={['Google', 'Friend', 'Flyer', 'Social Media', 'Other']}
                value={form.how_heard}
                onChange={(e, newValue) => setForm(prev => ({ ...prev, how_heard: newValue || '' }))}
                onInputChange={(e, newInputValue) => setForm(prev => ({ ...prev, how_heard: newInputValue }))}
                renderInput={(params) => <TextField {...params} label="How Heard" fullWidth />}
              />
            </>
          ) : (
            <>
              <TextField
                label="Conversion Date"
                type="date"
                name="conversion_date"
                value={form.conversion_date}
                onChange={handleFormChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <Autocomplete
                freeSolo
                options={['Salvation', 'Rededication', 'Water Baptism', 'Holy Spirit Baptism']}
                value={form.conversion_type}
                onChange={(e, newValue) => setForm(prev => ({ ...prev, conversion_type: newValue || '' }))}
                onInputChange={(e, newInputValue) => setForm(prev => ({ ...prev, conversion_type: newInputValue }))}
                renderInput={(params) => <TextField {...params} label="Conversion Type" fullWidth />}
              />
              <TextField
                label="Baptism Scheduled"
                name="baptism_scheduled"
                select
                value={form.baptism_scheduled ? 'yes' : 'no'}
                onChange={(e) => setForm(prev => ({ ...prev, baptism_scheduled: e.target.value === 'yes' }))}
                fullWidth
              >
                <MenuItem value="yes">Yes</MenuItem>
                <MenuItem value="no">No</MenuItem>
              </TextField>
              {form.baptism_scheduled && (
                <TextField
                  label="Baptism Date"
                  type="date"
                  name="baptism_date"
                  value={form.baptism_date}
                  onChange={handleFormChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              )}
            </>
          )}

          <Button variant="contained" onClick={handleSubmit}>
            {editMode ? 'Update' : 'Add'} {tab === 0 ? 'First Timer' : 'New Convert'}
          </Button>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default FirstTimersAndNewConvertsPage;