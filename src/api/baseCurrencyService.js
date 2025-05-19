const BASE = process.env.REACT_APP_API_URL + '/settings/base-currency';

export async function fetchBaseCurrency() {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error('Failed to fetch base currency');
  const { base_currency } = await res.json();
  return base_currency;
}

export async function updateBaseCurrency(code) {
  const res = await fetch(BASE, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base_currency: code })
  });
  if (!res.ok) throw new Error('Failed to set base currency');
  return res.json();
}
