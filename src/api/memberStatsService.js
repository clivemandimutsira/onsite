// src/api/memberStatsService.js
const BASE = process.env.REACT_APP_API_URL;

// 1. Summary stats: totalGiven, giftCount, avgGift, pledgePct
export async function fetchMemberStats(memberId) {
  const res = await fetch(`${BASE}/members/${memberId}/stats`);
  if (!res.ok) throw new Error(`Failed to fetch stats: ${res.status}`);
  return res.json();
}

// 2. Heatmap data: [{ date, count }]
export async function fetchGivingHeatmap(memberId) {
  const res = await fetch(`${BASE}/members/${memberId}/heatmap`);
  if (!res.ok) throw new Error(`Failed to fetch heatmap: ${res.status}`);
  return res.json();
}

// 3. Monthly giving: [{ month, amount }]
export async function fetchMonthlyGiving(memberId) {
  const res = await fetch(`${BASE}/members/${memberId}/monthly-giving`);
  if (!res.ok) throw new Error(`Failed to fetch monthly giving: ${res.status}`);
  return res.json();
}

// 4. Badges: [{ label, icon_name }]
export async function fetchMemberBadges(memberId) {
  const res = await fetch(`${BASE}/members/${memberId}/badges`);
  if (!res.ok) throw new Error(`Failed to fetch badges: ${res.status}`);
  return res.json();
}

export const unassignBadge = async (id) => {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to remove badge');
};


export const fetchAssignments = async () => {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error('Failed to fetch assignments');
  return res.json(); // [{id, member_id, badge_id, awarded_at, label}, …]
};