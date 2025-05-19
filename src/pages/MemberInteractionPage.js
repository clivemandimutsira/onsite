import React, { useState, useEffect } from 'react';
import {
  Box, Tabs, Tab, Typography, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Autocomplete, List, ListItem, ListItemText,
  ListItemSecondaryAction, IconButton, Container, Stack, Paper
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { Plus, Download, FileText, File } from 'lucide-react';
import { EditIcon, DeleteIcon } from '../components/common/ActionIcons';
import ConfirmDialog from '../components/common/ConfirmDialog';
import SnackbarAlert from '../components/common/SnackbarAlert';
import MemberAutoComplete from '../components/common/MemberAutoComplete';
import Pagination from '@mui/material/Pagination';
import { format } from 'date-fns';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

import {
  getPrayerRequests,
  createPrayerRequest,
  updatePrayerRequest,
  deletePrayerRequest
} from '../api/prayerRequestService';

import {
  getAllCounselingSessions,
  createCounselingSession,
  updateCounselingSession,
  deleteCounselingSession,
} from '../api/counselingService';

import { getMembers } from '../api/memberService';
import Chip from '@mui/material/Chip';

const prayerStatusOptions = ['pending', 'answered'];
const counselingStatusOptions = ['Pending', 'Completed', 'Cancelled'];
const counselingModeOptions = ['Online', 'In-person'];

const itemsPerPage = 10;

const CombinedMinistryPage = () => {
  const [tab, setTab] = useState(0);
  const [members, setMembers] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null, type: null });

  // PRAYER REQUEST STATE
  const [requests, setRequests] = useState([]);
  const [prayerForm, setPrayerForm] = useState({ member_id: '', request: '', status: 'pending' });
  const [prayerDialogOpen, setPrayerDialogOpen] = useState(false);
  const [editPrayerData, setEditPrayerData] = useState(null);

  // COUNSELING SESSION STATE
  const [sessions, setSessions] = useState([]);
  const [sessionForm, setSessionForm] = useState({
    date: '', time: '', counselor_id: '', mode: '', status: '', notes: '', member_id: '',
  });
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [editSessionId, setEditSessionId] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);

  // Search
  const [searchText, setSearchText] = useState('');
  const [activeChips, setActiveChips] = useState([]);
  const [activeModeChips, setActiveModeChips] = useState([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const showSnackbar = (message, severity = 'success') =>
    setSnackbar({ open: true, message, severity });

  useEffect(() => {
    fetchPrayerRequests();
    fetchCounselingSessions();
    getMembers().then(setMembers).catch(() => showSnackbar('Failed to fetch members', 'error'));
  }, []);

  const fetchPrayerRequests = async () => {
    try {
      const data = await getPrayerRequests();
      setRequests(data);
    } catch {
      showSnackbar('Failed to fetch prayer requests', 'error');
    }
  };

  const fetchCounselingSessions = async () => {
    try {
      const data = await getAllCounselingSessions();
      setSessions(data);
    } catch {
      showSnackbar('Failed to fetch sessions', 'error');
    }
  };

  const openPrayerDialog = (row = null) => {
    if (row) {
      setPrayerForm({ member_id: row.member_id, request: row.request, status: row.status });
      setEditPrayerData(row);
    } else {
      setPrayerForm({ member_id: '', request: '', status: 'pending' });
      setEditPrayerData(null);
    }
    setPrayerDialogOpen(true);
  };

  const submitPrayer = async () => {
    if (!prayerForm.member_id || !prayerForm.request) {
      showSnackbar('Please complete all fields', 'error');
      return;
    }
    try {
      if (editPrayerData) {
        await updatePrayerRequest(editPrayerData.id, prayerForm);
        showSnackbar('Prayer request updated');
      } else {
        await createPrayerRequest(prayerForm);
        showSnackbar('Prayer request created');
      }
      fetchPrayerRequests();
      setPrayerDialogOpen(false);
    } catch {
      showSnackbar('Failed to save', 'error');
    }
  };

  const deletePrayer = async () => {
    try {
      await deletePrayerRequest(confirmDialog.id);
      showSnackbar('Prayer request deleted');
      fetchPrayerRequests();
    } catch {
      showSnackbar('Delete failed', 'error');
    } finally {
      setConfirmDialog({ open: false, id: null, type: null });
    }
  };

  const openSessionDialog = (row = null) => {
    if (row) {
      setSessionForm({ ...row });
      setEditSessionId(row.id);
    } else {
      setSessionForm({ date: '', time: '', counselor_id: '', mode: '', status: '', notes: '', member_id: '' });
      setEditSessionId(null);
    }
    setSessionDialogOpen(true);
  };

  const submitSession = async () => {
    if (!sessionForm.member_id || !sessionForm.counselor_id) {
      showSnackbar('Select both counselor and member', 'error');
      return;
    }
    try {
      if (editSessionId) {
        await updateCounselingSession(editSessionId, sessionForm);
        showSnackbar('Session updated');
      } else {
        await createCounselingSession(sessionForm);
        showSnackbar('Session created');
      }
      fetchCounselingSessions();
      setSessionDialogOpen(false);
    } catch {
      showSnackbar('Failed to save session', 'error');
    }
  };

  const deleteSession = async () => {
    try {
      await deleteCounselingSession(confirmDialog.id);
      showSnackbar('Session deleted');
      fetchCounselingSessions();
    } catch {
      showSnackbar('Delete failed', 'error');
    } finally {
      setConfirmDialog({ open: false, id: null, type: null });
    }
  };

  const getMemberName = (id) => {
    const member = members.find((m) => m.id === id);
    return member ? `${member.first_name} ${member.surname}` : 'Unknown';
  };

  // Filtering logic
  const filteredRequests = requests
    .filter(
      (req) =>
        getMemberName(req.member_id).toLowerCase().includes(searchText.toLowerCase()) ||
        req.request.toLowerCase().includes(searchText.toLowerCase())
    )
    .filter(
      (req) =>
        activeChips.length === 0 || activeChips.includes(req.status)
    )
    .filter((req) => {
      if (!fromDate && !toDate) return true;
      const reqDate = req.created_at ? new Date(req.created_at) : null;
      if (!reqDate) return true;
      const start = fromDate ? new Date(fromDate) : new Date('1970-01-01');
      const end = toDate ? new Date(toDate) : new Date();
      return reqDate >= start && reqDate <= end;
    });

  const filteredSessions = sessions
    .filter(
      (s) =>
        getMemberName(s.member_id).toLowerCase().includes(searchText.toLowerCase()) ||
        getMemberName(s.counselor_id).toLowerCase().includes(searchText.toLowerCase()) ||
        (s.notes || '').toLowerCase().includes(searchText.toLowerCase())
    )
    .filter(
      (s) =>
        (activeChips.length === 0 || activeChips.includes(s.status)) &&
        (activeModeChips.length === 0 || activeModeChips.includes(s.mode))
    )
    .filter((s) => {
      if (!fromDate && !toDate) return true;
      const sessionDate = s.date ? new Date(s.date) : null;
      if (!sessionDate) return true;
      const start = fromDate ? new Date(fromDate) : new Date('1970-01-01');
      const end = toDate ? new Date(toDate) : new Date();
      return sessionDate >= start && sessionDate <= end;
    });

  const paginatedRequests = filteredRequests.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const paginatedSessions = filteredSessions.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // Export helpers
  const exportToCsv = (rows, filename) => {
    if (!rows.length) return;
    const header = Object.keys(rows[0]).join(',');
    const data = rows.map(r => Object.values(r).join(',')).join('\n');
    const blob = new Blob([header + '\n' + data], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, filename);
  };

  const exportToExcel = (rows, sheetName, filename) => {
    if (!rows.length) return;
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, filename);
  };

  const exportToPdf = (rows, title, filename) => {
    if (!rows.length) return;
    const doc = new jsPDF();
    doc.text(title, 14, 20);
    const columns = Object.keys(rows[0]).map(key => ({ header: key, dataKey: key }));
    doc.autoTable({ startY: 30, columns, body: rows });
    doc.save(filename);
  };

  return (
    <Container sx={{ mt: 4 }}>
      
      <Tabs value={tab} onChange={(_, val) => { setTab(val); setPage(1); setSearchText(''); setActiveChips([]); setActiveModeChips([]); setFromDate(''); setToDate(''); }} sx={{ mb: 3 }}>
        <Tab label="Prayer Requests" />
        <Tab label="Counseling Sessions" />
      </Tabs>

      <Paper sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search…"
          size="small"
          value={searchText}
          onChange={e => { setSearchText(e.target.value); setPage(1); }}
          sx={{ width: 220 }}
        />
        <TextField
          label="From"
          type="date"
          size="small"
          value={fromDate}
          onChange={e => { setFromDate(e.target.value); setPage(1); }}
          InputLabelProps={{ shrink: true }}
          sx={{ width: 150 }}
        />
        <TextField
          label="To"
          type="date"
          size="small"
          value={toDate}
          onChange={e => { setToDate(e.target.value); setPage(1); }}
          InputLabelProps={{ shrink: true }}
          sx={{ width: 150 }}
        />
        <Box flexGrow={1} />
        <Button
          variant="contained"
          onClick={() => tab === 0 ? openPrayerDialog() : openSessionDialog()}
          startIcon={<Plus />}
        >
          Add {tab === 0 ? 'Prayer Request' : 'Session'}
        </Button>
      </Paper>

      {/* Filter Chips */}
      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
        {(tab === 0 ? prayerStatusOptions : counselingStatusOptions).map(opt => (
          <Chip
            key={opt}
            label={opt.charAt(0).toUpperCase() + opt.slice(1)}
            color={activeChips.includes(opt) ? 'primary' : 'default'}
            onClick={() =>
              setActiveChips(c =>
                c.includes(opt) ? c.filter(x => x !== opt) : [...c, opt]
              )
            }
          />
        ))}
        {tab === 1 && counselingModeOptions.map(opt => (
          <Chip
            key={opt}
            label={opt}
            color={activeModeChips.includes(opt) ? 'primary' : 'default'}
            onClick={() =>
              setActiveModeChips(c =>
                c.includes(opt) ? c.filter(x => x !== opt) : [...c, opt]
              )
            }
          />
        ))}
      </Stack>

      <List
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 1,
          boxShadow: 'none',
        }}
      >
        {tab === 0
          ? paginatedRequests.map((req) => (
              <ListItem key={req.id} divider>
                <ListItemText
                  primary={getMemberName(req.member_id)}
                  secondary={`Request: ${req.request} | Status: ${req.status}`}
                />
                <ListItemSecondaryAction>
                  <IconButton onClick={() => openPrayerDialog(req)}><EditIcon /></IconButton>
                  <IconButton onClick={() => setConfirmDialog({ open: true, id: req.id, type: 'prayer' })}><DeleteIcon /></IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))
          : paginatedSessions.map((s) => (
              <ListItem key={s.id} divider>
                <ListItemText
                  primary={`${getMemberName(s.member_id)} — ${format(new Date(s.date), 'MMM d')} at ${s.time}`}
                  secondary={`Counselor: ${getMemberName(s.counselor_id)} | Mode: ${s.mode} | Status: ${s.status}`}
                />
                <ListItemSecondaryAction>
                  <IconButton onClick={() => openSessionDialog(s)}><EditIcon /></IconButton>
                  <IconButton onClick={() => setConfirmDialog({ open: true, id: s.id, type: 'session' })}><DeleteIcon /></IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
      </List>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 3, mb: 2, justifyContent: { xs: 'center', sm: 'flex-end' } }}>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<Download />}
          onClick={() =>
            tab === 0
              ? exportToCsv(filteredRequests, 'prayer_requests.csv')
              : exportToCsv(filteredSessions, 'counseling_sessions.csv')
          }
        >
          Download CSV
        </Button>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<File />}
          onClick={() =>
            tab === 0
              ? exportToExcel(filteredRequests, 'PrayerRequests', 'prayer_requests.xlsx')
              : exportToExcel(filteredSessions, 'CounselingSessions', 'counseling_sessions.xlsx')
          }
        >
          Download Excel
        </Button>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<FileText />}
          onClick={() =>
            tab === 0
              ? exportToPdf(filteredRequests, 'Prayer Requests', 'prayer_requests.pdf')
              : exportToPdf(filteredSessions, 'Counseling Sessions', 'counseling_sessions.pdf')
          }
        >
          Download PDF
        </Button>
      </Box>

      <Box display="flex" justifyContent="center" mt={4}>
        <Pagination
          count={Math.ceil((tab === 0 ? filteredRequests.length : filteredSessions.length) / itemsPerPage)}
          page={page}
          onChange={(_, value) => setPage(value)}
          color="primary"
        />
      </Box>

      {/* Dialogs */}
      <Dialog open={prayerDialogOpen} onClose={() => setPrayerDialogOpen(false)} fullWidth>
        <DialogTitle>{editPrayerData ? 'Edit' : 'New'} Prayer Request</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <MemberAutoComplete
            value={prayerForm.member_id}
            onChange={(val) => setPrayerForm({ ...prayerForm, member_id: val })}
          />
          <TextField
            label="Request"
            multiline minRows={3}
            fullWidth
            value={prayerForm.request}
            onChange={(e) => setPrayerForm({ ...prayerForm, request: e.target.value })}
          />
          <TextField
            select
            label="Status"
            value={prayerForm.status}
            onChange={(e) => setPrayerForm({ ...prayerForm, status: e.target.value })}
            SelectProps={{ native: true }}
          >
            <option value="pending">Pending</option>
            <option value="answered">Answered</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPrayerDialogOpen(false)}>Cancel</Button>
          <Button onClick={submitPrayer} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={sessionDialogOpen} onClose={() => setSessionDialogOpen(false)} fullWidth>
        <DialogTitle>{editSessionId ? 'Edit' : 'New'} Counseling Session</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Date"
            type="date"
            value={sessionForm.date}
            onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Time"
            type="time"
            value={sessionForm.time}
            onChange={(e) => setSessionForm({ ...sessionForm, time: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <MemberAutoComplete
            label="Member"
            value={sessionForm.member_id}
            onChange={(val) => setSessionForm({ ...sessionForm, member_id: val })}
          />
          <MemberAutoComplete
            label="Counselor"
            value={sessionForm.counselor_id}
            onChange={(val) => setSessionForm({ ...sessionForm, counselor_id: val })}
          />
          <Autocomplete
            options={counselingModeOptions}
            value={sessionForm.mode}
            onChange={(_, val) => setSessionForm({ ...sessionForm, mode: val })}
            renderInput={(params) => <TextField {...params} label="Mode" />}
          />
          <Autocomplete
            options={counselingStatusOptions}
            value={sessionForm.status}
            onChange={(_, val) => setSessionForm({ ...sessionForm, status: val })}
            renderInput={(params) => <TextField {...params} label="Status" />}
          />
          <TextField
            label="Notes"
            multiline minRows={2}
            value={sessionForm.notes}
            onChange={(e) => setSessionForm({ ...sessionForm, notes: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSessionDialogOpen(false)}>Cancel</Button>
          <Button onClick={submitSession} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, id: null, type: null })}
        onConfirm={confirmDialog.type === 'prayer' ? deletePrayer : deleteSession}
        title="Confirm Deletion"
        content="Are you sure you want to delete this item?"
      />

      <SnackbarAlert
        open={snackbar.open}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Container>
  );
};

export default CombinedMinistryPage;
