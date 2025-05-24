import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import Papa from 'papaparse';

/**
 * Exports data as a CSV file.
 * @param {Array} data - The data to be exported.
 */
export const exportAsCSV = (data) => {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, 'export.csv');
};

/**
 * Exports data as a PDF file.
 * @param {Array} data - The data to be exported.
 */
export const exportAsPDF = (data) => {
  const doc = new jsPDF();
  const headers = Object.keys(data[0]);
  const rows = data.map(item => Object.values(item));
  
  doc.autoTable({
    head: [headers],
    body: rows,
    theme: 'striped',
  });

  doc.save('export.pdf');
};
