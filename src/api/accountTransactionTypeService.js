const BASE = process.env.REACT_APP_API_URL + '/settings/account-transaction-types';

export const fetchTransactionTypes = async () => {
  const r = await fetch(BASE);
  if (!r.ok) throw new Error('Failed to fetch');
  return r.json();
};
export const createTransactionType = d => fetch(BASE, {
  method:'POST', headers:{'Content-Type':'application/json'},
  body:JSON.stringify(d)
}).then(r=>r.ok? r.json(): Promise.reject());
export const updateTransactionType = (id,d) => fetch(`${BASE}/${id}`, {
  method:'PUT', headers:{'Content-Type':'application/json'},
  body:JSON.stringify(d)
}).then(r=>r.ok? r.json(): Promise.reject());
export const deleteTransactionType = id => fetch(`${BASE}/${id}`,{method:'DELETE'})
  .then(r=>r.ok? r.json(): Promise.reject());
