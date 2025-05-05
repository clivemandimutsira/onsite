const BASE = `${process.env.REACT_APP_API_URL}/member-prayer-requests`;

export const getMemberPrayerRequests = async (memberId) => {
  const res = await fetch(`${BASE}/${memberId}`);
  if (!res.ok) throw new Error('Failed to load prayer requests');
  return res.json();
};

export const createPrayerRequest = async (memberId, data) => {
  const res = await fetch(`${BASE}/${memberId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create request');
  return res.json();
};

export const updatePrayerRequest = async (memberId, id, data) => {
  const res = await fetch(`${BASE}/${memberId}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update request');
  return res.json();
};

export const deletePrayerRequest = async (memberId, id) => {
  const res = await fetch(`${BASE}/${memberId}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete request');
  return true;
};
