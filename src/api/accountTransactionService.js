// src/services/accountTransactionService.js
const BASE = process.env.REACT_APP_API_URL;

export async function fetchTxns({ limit=50, offset=0 } = {}) {
  const r = await fetch(`${BASE}/account-transactions?limit=${limit}&offset=${offset}`);
  if (!r.ok) throw new Error('Failed to fetch transactions');
  return r.json();
}
export async function fetchTxn(id) {
  const r = await fetch(`${BASE}/account-transactions/${id}`);
  if (!r.ok) throw new Error('Failed to fetch transaction');
  return r.json();
}
export async function createTxn(data) {
  const r = await fetch(`${BASE}/account-transactions`, {
    method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data)
  });
  if (!r.ok) throw new Error('Failed to create transaction');
  return r.json();
}
export async function updateTxn(id,data) {
  const r = await fetch(`${BASE}/account-transactions/${id}`, {
    method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data)
  });
  if (!r.ok) throw new Error('Failed to update transaction');
  return r.json();
}
export async function deleteTxn(id) {
  const r = await fetch(`${BASE}/account-transactions/${id}`, { method:'DELETE' });
  if (!r.ok) throw new Error('Failed to delete transaction');
  return r.json();
}
