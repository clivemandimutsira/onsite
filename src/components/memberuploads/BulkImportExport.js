import React, { useState, useEffect } from 'react';
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Alert, List, ListItem
} from '@mui/material';
import Papa from 'papaparse';
import { exportMembers, importMembers } from '../api/memberService';

export default function BulkImportExport({ onImported }) {
  const [open, setOpen]       = useState(false);
  const [file, setFile]       = useState(null);
  const [errors, setErrors]   = useState([]);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [colsMeta, setColsMeta]   = useState([]);

  // Fetch import-column settings
  useEffect(() => {
    fetch('/api/import-columns?table=members')
      .then(r => r.json())
      .then(setColsMeta)
      .catch(console.error);
  }, []);

  // Validate CSV on file select
  useEffect(() => {
    if (!file) return setErrors([]);
    setParsing(true);
    const reader = new FileReader();
    reader.onload = ({ target }) => {
      Papa.parse(target.result, {
        header: true, skipEmptyLines: true,
        complete: results => {
          const hdrs = results.meta.fields;
          const required = colsMeta.filter(c=>c.required).map(c=>c.column_name);
          const allowed  = colsMeta.map(c=>c.column_name);
          const missing = required.filter(c=>!hdrs.includes(c));
          const invalid = hdrs.filter(h=>!allowed.includes(h));

          const rowErrs = [];
          results.data.slice(0,5).forEach((row,i)=>{
            required.forEach(col=>{
              if (!row[col]?.trim())
                rowErrs.push(`Row ${i+2}: ${col} required`);
            });
            if (row.email && !/^[^@]+@[^@]+\.[^@]+$/.test(row.email))
              rowErrs.push(`Row ${i+2}: invalid email`);
          });

          setErrors([
            missing.length && `Missing: ${missing.join(', ')}`,
            invalid.length && `Invalid: ${invalid.join(', ')}`,
            ...rowErrs
          ].filter(Boolean));
          setParsing(false);
        },
        error: err => {
          setErrors([err.message]);
          setParsing(false);
        }
      });
    };
    reader.readAsText(file);
  }, [file, colsMeta]);

  const handleExport = async () => {
    try {
      const blob = await exportMembers();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = 'members.csv'; a.click();
      URL.revokeObjectURL(url);
    } catch (e) { console.error(e); }
  };

  const handleImport = async () => {
    if (errors.length || !file) return;
    setImporting(true);
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await importMembers(form);
      onImported && onImported(res.importedCount);
      handleClose();
    } catch (e) {
      alert(e.message);
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFile(null);
    setErrors([]);
  };

  return (
    <>
      <Button onClick={handleExport} variant="outlined">Export Members</Button>
      <Button onClick={()=>setOpen(true)} sx={{ ml:2 }} variant="outlined">Import Members</Button>

      <Dialog open={open} onClose={handleClose} fullWidth>
        <DialogTitle>Import CSV</DialogTitle>
        <DialogContent>
          <input type="file" accept=".csv" onChange={e=>setFile(e.target.files[0])} />

          {parsing && <CircularProgress size={24} sx={{ mt:2 }} />}

          {errors.length > 0 && (
            <Alert severity="error" sx={{ mt:2 }}>
              <List dense>
                {errors.map((e,i)=><ListItem key={i}>{e}</ListItem>)}
              </List>
            </Alert>
          )}

          {!parsing && !errors.length && file && (
            <Alert severity="success" sx={{ mt:2 }}>CSV validated. Ready to import.</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={importing}>Cancel</Button>
          <Button
            onClick={handleImport}
            disabled={!file || parsing || errors.length>0 || importing}
          >
            {importing ? 'Importing…' : 'Import'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
