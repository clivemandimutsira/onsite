const base = process.env.REACT_APP_API_URL;

async function fetchJson(path) {
  const res = await fetch(`${base}${path}`);
  if (!res.ok) throw new Error(`Error fetching ${path}: ${res.statusText}`);
  return res.json();
}

export default {
  getKpis: () => fetchJson('/dashboard/kpis'),
  getGivingSeries: ({ start = '2025-01-01', end = '2025-05-19' } = {}) =>
    fetchJson(`/reports/giving?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`),
  getTopDonors: () => fetchJson('/reports/top-donors')
};
