const BASE = process.env.REACT_APP_API_URL + '/settings/badges';

export const fetchBadges = async () => {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error('Failed to fetch badges');
  return res.json();
};

export const createBadge = async (data) => {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create badge');
  return res.json();
};

export const updateBadge = async (id, data) => {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update badge');
  return res.json();
};

export const deleteBadge = async (id) => {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete badge');
};
