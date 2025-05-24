const BASE = process.env.REACT_APP_API_URL + '/settings/currencies';

export async function fetchCurrencies() {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error('Failed to fetch currencies');
  return res.json(); // now each has {id,code,name,symbol}
}

export function createCurrency(data) {
  return fetch(BASE, {
    method: 'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify(data)
  }).then(r => r.ok ? r.json() : Promise.reject());
}

export function updateCurrency(id, data) {
  return fetch(`${BASE}/${id}`, {
    method: 'PUT', headers:{'Content-Type':'application/json'},
    body: JSON.stringify(data)
  }).then(r => r.ok ? r.json() : Promise.reject());
}

export function deleteCurrency(id) {
  return fetch(`${BASE}/${id}`, { method: 'DELETE' })
    .then(r => r.ok ? r.json() : Promise.reject());
}
