import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  Box,
  Button,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  Chip,
  OutlinedInput,
  CircularProgress,
  Alert,
  List,
  ListItem,
} from '@mui/material';
import { Plus, RefreshCcwDot, CheckCheck, Download, Upload } from 'lucide-react';
import Papa from 'papaparse';
import SnackbarAlert from '../common/SnackbarAlert';
import { AuthContext } from '../../contexts/AuthContext';

const roleOptions = ['Pastor', 'Cell Leader', 'Member', 'Support', 'Admin'];

export default function FiltersPanel({
  typeFilter,
  onTypeChange,
  roleFilter,
  onRoleChange,
  onRunManual,
  onAddMember,
  onSendGroupNotification,
  onExport,
  onImport,
}) {
  const fileInputRef = useRef();
  const { permissions } = useContext(AuthContext);

  const canCreate = permissions.includes('create_members') || permissions.includes('manage_members');
  const canNotify = permissions.includes('send_notifications') || permissions.includes('manage_members');

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [templateDownloaded, setTemplateDownloaded] = useState(false);
  const [colsMeta, setColsMeta] = useState([]);
  const [labelToColumn, setLabelToColumn] = useState({});
  const [requiredLabels, setRequiredLabels] = useState([]);
  const [allowedLabels, setAllowedLabels] = useState([]);
  const [parsing, setParsing] = useState(false);
  const [fileErrors, setFileErrors] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  // 1) load settings and build mappings
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/import-columns?table=members`)
      .then(res => res.json())
      .then(meta => {
        setColsMeta(meta);
        const map = {};
        const req = [];
        meta.forEach(({ column_name, label, required }) => {
          map[label] = column_name;
          if (required) req.push(label);
        });
        setLabelToColumn(map);
        setRequiredLabels(req);
        setAllowedLabels(Object.keys(map));
      })
      .catch(() => setSnackbar({ open: true, message: 'Failed to load import settings', severity: 'error' }));
  }, []);

  const showSnackbar = (message, severity) => setSnackbar({ open: true, message, severity });
  const closeSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

  const handleDownloadTemplate = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/import-columns/template/members`);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'members_template.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTemplateDownloaded(true);
      showSnackbar('Template downloaded!', 'success');
    } catch {
      showSnackbar('Template download failed', 'error');
    }
  };

  const handleExport = () => onExport();

  const handleImportClick = () => {
    if (!templateDownloaded) {
      showSnackbar('Please download the template first!', 'warning');
      return;
    }
    fileInputRef.current.click();
  };

  const validateFile = file => {
    setParsing(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: results => {
        const headers = results.meta.fields || [];
        const missing = requiredLabels.filter(l => !headers.includes(l));
        const invalid = headers.filter(h => !allowedLabels.includes(h));
        const rowErrs = [];
        results.data.slice(0, 5).forEach((row, idx) => {
          requiredLabels.forEach(label => {
            if (!row[label]?.trim()) {
              rowErrs.push(`Row ${idx + 2}: ${label} is required`);
            }
          });
          const emailKey = Object.keys(labelToColumn).find(key => labelToColumn[key] === 'email');
          const emailVal = row[emailKey];
          if (emailVal && !/^[^@]+@[^@]+\.[^@]+$/.test(emailVal)) {
            rowErrs.push(`Row ${idx + 2}: invalid email format`);
          }
        });
        setFileErrors([
          missing.length && `Missing columns: ${missing.join(', ')}`,
          invalid.length && `Invalid columns: ${invalid.join(', ')}`,
          ...rowErrs,
        ].filter(Boolean));
        setParsing(false);
      },
      error: err => {
        setFileErrors([`Parsing error: ${err.message}`]);
        setParsing(false);
      },
    });
  };

  const onFileChosen = e => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setFileErrors([]);
    if (file) validateFile(file);
    e.target.value = null;
  };

  const confirmImport = async () => {
    if (!selectedFile || fileErrors.length) return;
    const form = new FormData();
    form.append('file', selectedFile);
    try {
      await onImport(form);
      showSnackbar('Import successful!', 'success');
      setSelectedFile(null);
      setFileErrors([]);
    } catch (err) {
      showSnackbar(err.message || 'Import failed', 'error');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {canCreate && (
        <Button variant="contained" startIcon={<Plus />} onClick={onAddMember}>
          Add Member
        </Button>
      )}

      {/* Type Filter */}
      <FormControl fullWidth>
        <InputLabel id="type-filter-label">Type</InputLabel>
        <Select
          labelId="type-filter-label"
          value={typeFilter}
          label="Type"
          onChange={e => onTypeChange(e.target.value)}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="member">Member</MenuItem>
          <MenuItem value="first_timer">First Timer</MenuItem>
          <MenuItem value="new_convert">New Convert</MenuItem>
        </Select>
      </FormControl>

      {/* Role Filter */}
      <FormControl fullWidth>
        <InputLabel id="role-filter-label">Role</InputLabel>
        <Select
          labelId="role-filter-label"
          multiple
          value={roleFilter}
          onChange={e => onRoleChange(e.target.value)}
          input={<OutlinedInput label="Role" />}
          renderValue={selected => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map(value => (
                <Chip key={value} label={value} size="small" />
              ))}
            </Box>
          )}
        >
          {roleOptions.map(role => (
            <MenuItem key={role} value={role}>
              {role}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Manual Update & Notifications */}
      <Button variant="outlined" startIcon={<RefreshCcwDot />} onClick={onRunManual}>
        Manual Updates
      </Button>
      {canNotify && (
        <Button variant="contained" color="secondary" startIcon={<CheckCheck />} onClick={onSendGroupNotification}>
          Notifications
        </Button>
      )}

      {/* Bulk CSV Actions */}
      <Button variant="outlined" startIcon={<Download />} onClick={handleDownloadTemplate}>
        Download Template
      </Button>
      <Button variant="outlined" startIcon={<Download />} onClick={handleExport}>
        Export CSV
      </Button>
      <Button variant="outlined" startIcon={<Upload />} onClick={handleImportClick}>
        Import CSV
      </Button>
      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={onFileChosen}
      />

      {/* Validation Feedback */}
      {parsing && <CircularProgress size={24} />}
      {fileErrors.length > 0 && (
        <Alert severity="error">
          <List dense>
            {fileErrors.map((err, idx) => (
              <ListItem key={idx}>{err}</ListItem>
            ))}
          </List>
        </Alert>
      )}
      {!parsing && !fileErrors.length && selectedFile && (
        <Button variant="contained" onClick={confirmImport}>
          Confirm Import
        </Button>
      )}

      <SnackbarAlert
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={closeSnackbar}
        severity={snackbar.severity}
      >
        {snackbar.message}
      </SnackbarAlert>
    </Box>
  );
}
