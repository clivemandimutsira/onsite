// src/services/expenseService.js
const BASE = process.env.REACT_APP_API_URL;

export async function fetchExpenses({ limit=50, offset=0 } = {}) {
  const r = await fetch(`${BASE}/expenses?limit=${limit}&offset=${offset}`);
  if (!r.ok) throw new Error('Failed to fetch expenses');
  return r.json();
}

export async function fetchExpense(id) {
  const r = await fetch(`${BASE}/expenses/${id}`);
  if (!r.ok) throw new Error('Failed to fetch expense');
  return r.json();
}

export async function createExpense(data) {
  const r = await fetch(`${BASE}/expenses`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(data)
  });
  if (!r.ok) throw new Error('Failed to create expense');
  return r.json();
}

export async function updateExpense(id, data) {
  const r = await fetch(`${BASE}/expenses/${id}`, {
    method: 'PUT',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(data)
  });
  if (!r.ok) throw new Error('Failed to update expense');
  return r.json();
}

export async function deleteExpense(id) {
  const r = await fetch(`${BASE}/expenses/${id}`, { method: 'DELETE' });
  if (!r.ok) throw new Error('Failed to delete expense');
  return r.json();
}
