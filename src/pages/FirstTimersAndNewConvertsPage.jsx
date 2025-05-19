import React, { useEffect, useState, useCallback } from 'react';
import {
  Container, Typography, Box, Button, Dialog, DialogTitle, DialogContent, Slide, MenuItem,
  Paper, Tabs, Tab, TextField, Stack, Chip, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton
} from '@mui/material';
import { Plus, Download, FileText, File } from 'lucide-react';
import { parseISO, format, isWithinInterval } from 'date-fns';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

import ConfirmDialog from '../components/common/ConfirmDialog';
import SnackbarAlert from '../components/common/SnackbarAlert';
import Autocomplete from '@mui/material/Autocomplete';
import Pagination from '@mui/material/Pagination';
import { EditIcon, DeleteIcon } from '../components/common/ActionIcons';

import {
  getAllFirstTimers, createFirstTimer, updateFirstTimer, deleteFirstTimer
} from '../api/ftService';
import {
  getAllNewConverts, createNewConvert, deleteNewConvert, updateNewConvert
} from '../api/ncService';
import { getMembers } from '../api/memberService';
import { useTheme } from '@mui/material/styles';

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));

export default function FirstTimersAndNewConvertsPage() {
  const theme = useTheme();
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
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null, type: '' });
  const [searchText, setSearchText] = useState('');
  const [activeChips, setActiveChips] = useState([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 9;

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

  useEffect(() => { fetchData(); }, [fetchData]);

  const showSnackbar = (message, severity = 'success') =>
    setSnackbar({ open: true, message, severity });

  const resetForm = () => setForm({
    member_name: '', member_id: '',
    registration_date: '', how_heard: '',
    conversion_date: '', conversion_type: '',
    baptism_scheduled: false, baptism_date: ''
  });

  const handleTabChange = (e, newVal) => {
    setTab(newVal);
    resetForm(); setEditMode(false); setSelected(null);
    setSearchText(''); setActiveChips([]);
    setFromDate(''); setToDate('');
    setPage(1);
  };

  const handleDialogOpen = (item = null) => {
    setEditMode(!!item);
    setSelected(item);
    if (tab === 0) {
      setForm(item ? {
        member_id: item.member_id,
        member_name: item.member_name || '',
        registration_date: item.registration_date ? format(parseISO(item.registration_date), 'yyyy-MM-dd') : '',
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
        baptism_scheduled: !!item.baptism_scheduled,
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
      setForm({});
    } catch {
      showSnackbar('Failed to save', 'error');
    }
  };

  const handleDelete = id => setConfirmDialog({ open: true, id, type: tab===0?'First Timer':'New Convert' });
  const confirmDeletion = async () => {
    try {
      if (tab===0) await deleteFirstTimer(confirmDialog.id);
      else await deleteNewConvert(confirmDialog.id);
      showSnackbar('Deleted successfully'); fetchData();
    } catch {
      showSnackbar('Delete failed', 'error');
    } finally { setConfirmDialog({ open:false,id:null,type:'' }); }
  };

  // Reset page on search/filter change
  const handleSearchChange = e => {
    setSearchText(e.target.value);
    setPage(1);
  };
  const handleFromDateChange = e => {
    setFromDate(e.target.value);
    setPage(1);
  };
  const handleToDateChange = e => {
    setToDate(e.target.value);
    setPage(1);
  };

  const list = (tab===0?firstTimers:newConverts)
    .filter(r => r.member_name.toLowerCase().includes(searchText.toLowerCase()))
    .filter(r => activeChips.length===0 || (tab===0?activeChips.includes(r.how_heard):activeChips.includes(r.conversion_type)))
    .filter(r => {
      if (!fromDate&&!toDate) return true;
      const d = parseISO(tab===0?r.registration_date:r.conversion_date);
      return isWithinInterval(d, { start: fromDate?parseISO(fromDate):new Date('1970-01-01'), end: toDate?parseISO(toDate):new Date() });
    });

  const paginatedList = list.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const chipOptions = tab===0?Array.from(new Set(firstTimers.map(r=>r.how_heard))):Array.from(new Set(newConverts.map(r=>r.conversion_type)));

  return (
    <Container maxWidth="lg" sx={{ mt:4 }}>
      <Tabs value={tab} onChange={handleTabChange} sx={{ mb:3 }}>
        <Tab label="First Timers"/>
        <Tab label="New Converts"/>
      </Tabs>
      <Paper sx={{ p:2, mb:2, display:'flex',alignItems:'center',gap:2 }}>
        <TextField
          placeholder="Search…"
          size="small"
          value={searchText}
          onChange={handleSearchChange}
          sx={{ width: 260 }} // increased width
        />
        <TextField
          label="From"
          type="date"
          size="small"
          value={fromDate}
          onChange={handleFromDateChange}
          InputLabelProps={{ shrink:true }}
          sx={{ width: 180 }} // increased width
        />
        <TextField
          label="To"
          type="date"
          size="small"
          value={toDate}
          onChange={handleToDateChange}
          InputLabelProps={{ shrink:true }}
          sx={{ width: 180 }} // increased width
        />
        <Box flexGrow={1}/>
        <Button variant="contained" onClick={()=>handleDialogOpen()} startIcon={<Plus/>}>
          Add {tab===0?'First Timer':'New Convert'}
        </Button>
      </Paper>
      <Stack direction="row" spacing={1} sx={{ mb:2 }}>
        {chipOptions.map(opt => (
          <Chip
            key={opt}
            label={opt}
            color={activeChips.includes(opt)? 'primary':'default'}
            onClick={() => setActiveChips(c=> c.includes(opt)? c.filter(x=>x!==opt): [...c,opt])}
          />
        ))}
      </Stack>
      <List
        sx={{
          bgcolor: 'background.paper',
           borderRadius: theme.shape.borderRadius * 0.25, // more roundness
          boxShadow: 'none', // optional: subtle shadow
        }}
      >
        {paginatedList.map(item => (
          <ListItem key={item.id} divider>
            <ListItemText
              primary={item.member_name}
              secondary={
                tab===0
                  ? `Heard via ${item.how_heard} on ${format(parseISO(item.registration_date),'MMM d, yyyy')}`
                  : `Converted ${format(parseISO(item.conversion_date),'MMM d, yyyy')} (${item.conversion_type})` +
                    (item.baptism_scheduled ? `, Baptism: ${format(parseISO(item.baptism_date),'MMM d, yyyy')}` : '')
              }
            />
            <ListItemSecondaryAction>
              <IconButton edge="end" onClick={() => handleDialogOpen(item)} aria-label="edit">
                <EditIcon />
              </IconButton>
              <IconButton edge="end" onClick={() => handleDelete(item.id)} aria-label="delete">
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 3, mb: 2, justifyContent: { xs: 'center', sm: 'flex-end' } }}>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<Download />}
          onClick={() => exportToCsv(list, tab === 0 ? 'first_timers.csv' : 'new_converts.csv')}
        >
          Download CSV
        </Button>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<File />}
          onClick={() => exportToExcel(list, tab === 0 ? 'FT' : 'NC', tab === 0 ? 'first_timers.xlsx' : 'new_converts.xlsx')}
        >
          Download Excel
        </Button>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<FileText />}
          onClick={() => exportToPdf(list, tab === 0 ? 'First Timers' : 'New Converts', tab === 0 ? 'first_timers.pdf' : 'new_converts.pdf')}
        >
          Download PDF
        </Button>
      </Box>
      <Box display="flex" justifyContent="center" mt={4}>
        <Pagination
          count={Math.ceil(list.length / itemsPerPage)}
          page={page}
          onChange={(e, value) => setPage(value)}
          color="primary"
        />
      </Box>
      <Dialog open={dialogOpen} onClose={handleDialogClose} TransitionComponent={Transition} fullWidth maxWidth="sm">
        <DialogTitle>
          {editMode ? `Edit ${tab === 0 ? 'First Timer' : 'New Convert'}` : `Add ${tab === 0 ? 'First Timer' : 'New Convert'}`}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Autocomplete
            freeSolo
            options={members.map((m) => `${m.first_name} ${m.surname}`)}
            value={form.member_name}
            onChange={(e, newValue) => {
              const matched = members.find((m) => `${m.first_name} ${m.surname}` === newValue);
              setForm(prev => ({
                ...prev,
                member_name: newValue || '',
                member_id: matched ? matched.id : ''
              }));
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
                onChange={(e, newValue) => setForm(prev => ({ ...prev, how_heard: newValue || '' }))
                }
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
                onChange={(e, newValue) => setForm(prev => ({ ...prev, conversion_type: newValue || '' }))
                }
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
      <ConfirmDialog open={confirmDialog.open} onClose={()=>setConfirmDialog({...confirmDialog,open:false})} onConfirm={confirmDeletion} title="Confirm Deletion" description={`Are you sure you want to delete this ${confirmDialog.type}?`}/>
      <SnackbarAlert open={snackbar.open} onClose={()=>setSnackbar({...snackbar,open:false})} severity={snackbar.severity} message={snackbar.message}/>
    </Container>
  );
}

// CSV Export helper
const exportToCsv = (rows, filename) => {
  if (!rows.length) return;
  const header = Object.keys(rows[0]).join(',');
  const data = rows.map(r => Object.values(r).join(',')).join('\n');
  const blob = new Blob([header + '\n' + data], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, filename);
};

// Excel export helper
const exportToExcel = (rows, sheetName, filename) => {
  if (!rows.length) return;
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  saveAs(blob, filename);
};

// PDF export helper
const exportToPdf = (rows, title, filename) => {
  if (!rows.length) return;
  const doc = new jsPDF();
  doc.text(title, 14, 20);
  const columns = Object.keys(rows[0]).map(key => ({ header: key, dataKey: key }));
  doc.autoTable({ startY: 30, columns, body: rows });
  doc.save(filename);
};
