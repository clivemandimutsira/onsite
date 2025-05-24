// src/components/member/UploadProofDialog.jsx
import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, CircularProgress
} from '@mui/material';
import { uploadProof } from '../../api/contributionService';

export default function UploadProofDialog({ open, contribution, onClose, onUploaded }) {
  const [file, setFile]       = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      await uploadProof(contribution.id, file);
      onUploaded();
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Upload Proof for {contribution?.type}</DialogTitle>
      <DialogContent dividers>
        <Typography gutterBottom>
          Amount: {contribution?.amount}
        </Typography>
        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileChange}
          style={{ marginTop: 16 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!file || loading}
          startIcon={loading && <CircularProgress size={16} />}
        >
          {loading ? 'Uploading…' : 'Upload'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
