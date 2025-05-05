const API_URL = `${process.env.REACT_APP_API_URL}/members`;

export const createMember = async (formData) => {
  const res = await fetch(API_URL, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to create member');
  return await res.json();
};

export const getMembers = async () => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Failed to fetch members');
  return await res.json();
};

export const deleteMember = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete member');
  return await res.json();
};

export const getMemberById = async (id) => {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error('Failed to fetch member');
  return await res.json();
};

export const updateMember = async (id, formData) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to update member');
  return await res.json();
};

export const checkDuplicateField = async (field, value) => {
  const res = await fetch(`${API_URL}/check-duplicate?field=${field}&value=${encodeURIComponent(value)}`);
  if (!res.ok) throw new Error('Failed to check duplicate');
  return await res.json(); // returns { exists: true/false }
};