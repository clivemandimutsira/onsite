// src/services/accountService.js
const BASE = process.env.REACT_APP_API_URL;

export async function fetchAccounts({ limit=50, offset=0 } = {}) {
  const r = await fetch(`${BASE}/accounts?limit=${limit}&offset=${offset}`);
  if (!r.ok) throw new Error('Failed to fetch accounts');
  return r.json();
}

export async function fetchAccount(id) {
  const r = await fetch(`${BASE}/accounts/${id}`);
  if (!r.ok) throw new Error('Failed to fetch account');
  return r.json();
}

export async function createAccount(data) {
  const r = await fetch(`${BASE}/accounts`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(data)
  });
  if (!r.ok) throw new Error('Failed to create account');
  return r.json();
}

export async function updateAccount(id, data) {
  const r = await fetch(`${BASE}/accounts/${id}`, {
    method: 'PUT',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(data)
  });
  if (!r.ok) throw new Error('Failed to update account');
  return r.json();
}

export async function deleteAccount(id) {
  const r = await fetch(`${BASE}/accounts/${id}`, { method: 'DELETE' });
  if (!r.ok) throw new Error('Failed to delete account');
  return r.json();
}

export const fetchGlobalBanks = async () => {
  // Static list of global banks
  return [
    'Bank of America',
    'Chase Bank',
    'Wells Fargo',
    'HSBC',
    'Citibank',
    'Barclays',
    'Deutsche Bank',
    'Santander',
    'BNP Paribas',
    'Standard Chartered',
    'Royal Bank of Canada',
    'TD Bank',
    'UBS',
    'Credit Suisse',
    'ING',
    'Goldman Sachs',
    'Morgan Stanley',
    'JP Morgan',
    'Bank of China',
    'ICBC',
  ];
};
