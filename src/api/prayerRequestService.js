const API_URL = `${process.env.REACT_APP_API_URL}/prayer-requests`;

export const getPrayerRequests = async () => {
  const res = await fetch(API_URL);

  const text = await res.text(); // get raw response
  console.log('RAW response from prayer-requests:', text);

  try {
    return JSON.parse(text); // attempt to parse
  } catch (err) {
    console.error('Failed to parse JSON:', err);
    throw new Error('Invalid JSON response:\n' + text);
  }
};


export const createPrayerRequest = async (data) => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create prayer request');
  return await res.json();
};

export const updatePrayerRequest = async (id, data) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update prayer request');
  return await res.json();
};

export const deletePrayerRequest = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete prayer request');
  return await res.json();
};
