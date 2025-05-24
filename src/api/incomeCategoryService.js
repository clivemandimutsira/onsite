const BASE = process.env.REACT_APP_API_URL + '/settings/income-categories';

export async function fetchIncomeCategories() {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error('Failed to fetch income categories');
  return res.json();
}

export function createIncomeCategory(data) {
  return fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.ok ? res.json() : Promise.reject());
}

export function updateIncomeCategory(id, data) {
  return fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.ok ? res.json() : Promise.reject());
}

export function deleteIncomeCategory(id) {
  return fetch(`${BASE}/${id}`, { method: 'DELETE' })
    .then(res => res.ok ? res.json() : Promise.reject());
}
