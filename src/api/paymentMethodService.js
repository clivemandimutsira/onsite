const BASE = process.env.REACT_APP_API_URL + '/settings/payment-methods';
export const fetchPaymentMethods  = async () => {
  const r = await fetch(BASE);
  if (!r.ok) throw new Error('Failed');
  return r.json();
};
export const createPaymentMethod  = data => fetch(BASE, {
  method:'POST', headers:{'Content-Type':'application/json'},
  body:JSON.stringify(data)
}).then(r=>r.ok? r.json(): Promise.reject());
export const updatePaymentMethod = (id,d) => fetch(`${BASE}/${id}`, {
  method:'PUT', headers:{'Content-Type':'application/json'},
  body:JSON.stringify(d)
}).then(r=>r.ok? r.json(): Promise.reject());
export const deletePaymentMethod = id => fetch(`${BASE}/${id}`,{method:'DELETE'})
  .then(r=>r.ok? r.json(): Promise.reject());
