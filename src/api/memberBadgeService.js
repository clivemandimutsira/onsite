const BASE = process.env.REACT_APP_API_URL + '/settings/member-badges';

export const fetchAssignments = async () => {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error('Failed to fetch assignments');
  return res.json();
};

export const assignBadge = async (data) => {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to assign badge');
  return res.json();
};

export const unassignBadge = async (id) => {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to unassign badge');
};
