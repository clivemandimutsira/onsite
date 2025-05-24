const API = `${process.env.REACT_APP_API_URL}/donations`;

export const fetchDonations = async () => {
  const res = await fetch(API);
  if (!res.ok) throw new Error('Failed to load donations');
  return res.json();
};

export const fetchDonation = async (id) => {
  const res = await fetch(`${API}/${id}`);
  if (!res.ok) throw new Error('Failed to load donation');
  return res.json();
};

export const createDonation = async (data) => {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create donation');
  return res.json();
};

export const updateDonation = async (id, data) => {
  const res = await fetch(`${API}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update donation');
  return res.json();
};

export const deleteDonation = async (id) => {
  const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete donation');
  return;
};


/** Upload proof image for a donation */
export const uploadDonationProof = async (id, formData) => {
  const res = await fetch(`${API}/${id}/proof`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) throw new Error('Failed to upload proof');
  return res.json();
};

/** Start online payment */
export const startOnlinePayment = async ({ amount, member_id }) => {
  const res = await fetch(`${API}/pay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, member_id })
  });
  if (!res.ok) throw new Error('Payment initiation failed');
  return res.json(); // { paymentUrl }
};
