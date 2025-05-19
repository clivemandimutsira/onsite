// src/services/incomeService.js
const BASE = process.env.REACT_APP_API_URL;

export async function fetchIncomes({ limit=50, offset=0 } = {}) {
  const resp = await fetch(`${BASE}/income?limit=${limit}&offset=${offset}`);
  if (!resp.ok) throw new Error('Failed to fetch incomes');
  return resp.json();
}

export async function fetchIncome(id) {
  const resp = await fetch(`${BASE}/income/${id}`);
  if (!resp.ok) throw new Error('Failed to fetch income');
  return resp.json();
}

export async function createIncome(data) {
  const resp = await fetch(`${BASE}/income`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(data)
  });
  if (!resp.ok) throw new Error('Failed to create income');
  return resp.json();
}

export async function updateIncome(id, data) {
  const resp = await fetch(`${BASE}/income/${id}`, {
    method: 'PUT',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(data)
  });
  if (!resp.ok) throw new Error('Failed to update income');
  return resp.json();
}

export async function deleteIncome(id) {
  const resp = await fetch(`${BASE}/income/${id}`, { method: 'DELETE' });
  if (!resp.ok) throw new Error('Failed to delete income');
  return resp.json();
}
