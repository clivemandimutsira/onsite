export const runManualStatusUpdate = async () => {
  const res = await fetch(`${process.env.REACT_APP_API_URL}/admin/update-member-statuses`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Manual update failed');
  return res.json();
};



