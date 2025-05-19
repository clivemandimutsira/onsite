// src/api/settingService.js

const BASE = `${process.env.REACT_APP_API_URL}/settings`;

/** List all tables */
export const fetchTables = async () => {
  const res = await fetch(`${BASE}/tables`);
  if (!res.ok) throw new Error('Failed to fetch tables');
  return res.json();   // [ 'members', 'income_transactions', … ]
};

/** List columns for a specific table */
export const fetchTableColumns = async (table) => {
  const res = await fetch(`${BASE}/tables/${table}/columns`);
  if (!res.ok) throw new Error('Failed to fetch columns');
  return res.json();   // [ 'id', 'first_name', 'surname', … ]
};
