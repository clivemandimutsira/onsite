const BASE = process.env.REACT_APP_API_URL + '/settings/pledges';

export const fetchPledges = async () => {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error('Failed to fetch pledges');
  return res.json();
};

export const createPledge = async (data) => {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create pledge');
  return res.json();
};

export const updatePledge = async (id, data) => {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update pledge');
  return res.json();
};

export const deletePledge = async (id) => {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete pledge');
};
