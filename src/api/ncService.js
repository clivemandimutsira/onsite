const API_URL = process.env.REACT_APP_API_URL + '/new-converts';

export const getAllNewConverts = async () => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Failed to fetch new converts');
  return res.json();
};

export const createNewConvert = async (data) => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create new convert');
  return res.json();
};

export const updateNewConvert = async (id, data) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update new convert');
  return res.json();
};

export const deleteNewConvert = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete new convert');
  return res.json();
};
