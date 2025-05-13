const BASE = `${process.env.REACT_APP_API_URL}/member-counseling`;

export const getMemberCounselings = async (memberId) => {
  const res = await fetch(`${BASE}/${memberId}`);
  if (!res.ok) throw new Error('Failed to fetch your counseling bookings');
  return res.json();
};

export const createMemberCounseling = async (memberId, data) => {
  const res = await fetch(`${BASE}/${memberId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to book counseling session');
  return res.json();
};

export const updateMemberCounseling = async (memberId, sessionId, data) => {
  const res = await fetch(`${BASE}/${memberId}/${sessionId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update booking');
  return res.json();
};

export const deleteMemberCounseling = async (memberId, memberCounselingId, sessionId) => {
  const res = await fetch(
    `${BASE}/${memberId}/${memberCounselingId}/${sessionId}`,
    { method: 'DELETE' }
  );
  if (!res.ok) throw new Error('Failed to delete booking');
  return true;
};