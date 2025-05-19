const BASE = `${process.env.REACT_APP_API_URL}/counseling`;

export const getAllCounselingSessions = async () => {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error('Failed to fetch counseling sessions');
  return res.json();
};

export const getCounselingSession = async (id) => {
  const res = await fetch(`${BASE}/${id}`);
  if (!res.ok) throw new Error('Failed to fetch session');
  return res.json();
};

export const createCounselingSession = async (data) => {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create session');
  return res.json();
};

export const updateCounselingSession = async (id, data) => {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update session');
  return res.json();
};

export const deleteCounselingSession = async (id) => {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete session');
  // DELETE returns 204 No Content, so we can just return true
  return true;
};
