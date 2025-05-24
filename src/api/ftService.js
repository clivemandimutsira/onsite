const API_URL = process.env.REACT_APP_API_URL + '/first-timers';

export const getAllFirstTimers = async () => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Failed to fetch first timers');
  return res.json();
};

export const createFirstTimer = async (data) => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create first timer');
  return res.json();
};

export const updateFirstTimer = async (id, data) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update first timer');
  return res.json();
};

export const deleteFirstTimer = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete first timer');
  return res.json();
};
