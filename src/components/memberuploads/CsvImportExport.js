import React, { useState } from 'react';

const CsvImportExport = ({ selectedTable }) => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');

  const downloadTemplate = async () => {
    try {
      const response = await fetch(`/api/import-columns/template/${selectedTable}`);
      if (!response.ok) throw new Error('Failed to download template');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${selectedTable}_template.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Template download failed:', error);
    }
  };

  const handleUpload = async () => {
    if (!file) return setStatus('Please select a CSV file.');

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Adjust route for each table if needed
      const uploadUrl =
        selectedTable === 'members'
          ? '/api/members/import'
          : `/api/${selectedTable}/import`; // dynamic fallback

      const res = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setStatus('✅ Import successful!');
      } else {
        setStatus(`❌ Import failed: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setStatus('Server error during upload.');
    }
  };

  return (
    <div>
      <h4>Bulk Import for: {selectedTable}</h4>

      <button onClick={downloadTemplate}>📥 Download CSV Template</button>

      <br /><br />
      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button onClick={handleUpload}>📤 Upload CSV</button>

      {status && <p>{status}</p>}
    </div>
  );
};

export default CsvImportExport;
