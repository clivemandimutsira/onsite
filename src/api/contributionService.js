// src/api/contributionService.js
const BASE = process.env.REACT_APP_API_URL;

export async function fetchContributions(memberId) {
  const res = await fetch(`${BASE}/members/${memberId}/contributions`);
  if (!res.ok) throw new Error('Failed to fetch contributions');
  return res.json();
}

export async function uploadProof(contribId, file) {
  const form = new FormData();
  form.append('proof', file);
  const res = await fetch(`${BASE}/contributions/${contribId}/proof`, {
    method: 'POST',
    body: form
  });
  if (!res.ok) throw new Error('Failed to upload proof');
  return res.json();
}

export async function makePayment(memberId, { amount, type }) {
  const res = await fetch(`${BASE}/contributions/pay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ member_id: memberId, amount, type })
  });
  if (!res.ok) throw new Error('Payment failed');
  return res.json();
}
