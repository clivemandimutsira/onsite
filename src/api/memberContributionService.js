const BASE = `${process.env.REACT_APP_API_URL}/donations`;

/** Get all contributions for a member */
export async function fetchMemberContributions(memberId) {
  const res = await fetch(`${BASE}?member_id=${memberId}`);
  if (!res.ok) throw new Error('Failed to fetch contributions');
  return res.json();
}

/** Upload proof image for a donation */
export async function uploadProof(donationId, formData) {
  const res = await fetch(`${BASE}/${donationId}/proof`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) throw new Error('Failed to upload proof');
  return res.json();
}

/** Start an online payment */
export async function makeOnlinePayment({ member_id, amount }) {
  const res = await fetch(`${BASE}/pay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ member_id, amount })
  });
  if (!res.ok) throw new Error('Payment initiation failed');
  return res.json(); // { paymentUrl }
}
