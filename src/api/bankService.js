const BASE = process.env.REACT_APP_API_URL + '/settings/banks';
export const fetchBanks  = async () => {
  const r = await fetch(BASE);
  if (!r.ok) throw new Error('Failed');
  return r.json();
};
export const createBank  = d => fetch(BASE, {
  method:'POST', headers:{'Content-Type':'application/json'},
  body:JSON.stringify(d)
}).then(r=>r.ok? r.json(): Promise.reject());
export const updateBank = (id,d) => fetch(`${BASE}/${id}`, {
  method:'PUT', headers:{'Content-Type':'application/json'},
  body:JSON.stringify(d)
}).then(r=>r.ok? r.json(): Promise.reject());
export const deleteBank = id => fetch(`${BASE}/${id}`,{method:'DELETE'})
  .then(r=>r.ok? r.json(): Promise.reject());
