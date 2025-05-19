const BASE = `${process.env.REACT_APP_API_URL}/import-columns`;

export const fetchImportColumns = async () => {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error('Failed to fetch import columns');
  return res.json();
};

export const createImportColumn = async (data) => {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create column');
  return res.json();
};

export const updateImportColumn = async (id, data) => {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update column');
  return res.json();
};

export const deleteImportColumn = async (id) => {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete column');
  return res.json();
};

export const downloadTemplate = async (table = 'members') => {
  const res = await fetch(`${process.env.REACT_APP_API_URL}/import-columns/template/${table}`);
  if (!res.ok) throw new Error('Failed to download template');
  return res.blob(); // You can use this blob to trigger a download
};
