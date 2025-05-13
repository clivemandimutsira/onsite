const API_URL = process.env.REACT_APP_API_URL + '/member-departments';

export const getMembershipsByMemberId = async (memberId) => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Failed to fetch member departments');
  const all = await res.json();
  return all.filter((item) => item.member_id === memberId);
};

export const createMembership = async (data) => {
  console.log("Sending membership payload:", data); // ← Add logging for debugging
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to create membership');
  }
  return res.json();
};

export const deleteMembership = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete membership');
  return res.json();
};

export const updateMembership = async (id, data) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update membership');
  return res.json();
};
