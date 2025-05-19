// src/services/budgetService.js
const BASE = process.env.REACT_APP_API_URL;

export async function fetchBudgets({ limit=50, offset=0 } = {}) {
  const r = await fetch(`${BASE}/budgets?limit=${limit}&offset=${offset}`);
  if (!r.ok) throw new Error('Failed to fetch budgets');
  return r.json();
}
export async function fetchBudget(id) {
  const r = await fetch(`${BASE}/budgets/${id}`);
  if (!r.ok) throw new Error('Failed to fetch budget');
  return r.json();
}
export async function createBudget(data) {
  const r = await fetch(`${BASE}/budgets`, {
    method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data)
  });
  if (!r.ok) throw new Error('Failed to create budget');
  return r.json();
}
export async function updateBudget(id,data) {
  const r = await fetch(`${BASE}/budgets/${id}`, {
    method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data)
  });
  if (!r.ok) throw new Error('Failed to update budget');
  return r.json();
}
export async function deleteBudget(id) {
  const r = await fetch(`${BASE}/budgets/${id}`, { method:'DELETE' });
  if (!r.ok) throw new Error('Failed to delete budget');
  return r.json();
}
