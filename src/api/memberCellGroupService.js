const API_URL = process.env.REACT_APP_API_URL + '/member-cell-groups';

// Fetch all memberships (not recommended for large datasets)
export const getAllMemberships = async () => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Failed to fetch all memberships');
  return res.json();
};

// 🔍 Fetch all members in a specific cell group
export const getMembershipsByCellGroupId = async (cellGroupId) => {
  const res = await fetch(`${API_URL}/by-group/${cellGroupId}`);
  if (!res.ok) throw new Error('Failed to fetch members for cell group');
  return res.json();
};

// 🔍 Fetch memberships for a specific member
export const getCellGroupMembershipsByMemberId = async (memberId) => {
  const res = await fetch(`${API_URL}/by-member/${memberId}`);
  if (!res.ok) throw new Error('Failed to fetch member’s cell groups');
  return res.json();
};

// ➕ Create new member–cell group relationship
export const createMembership = async (data) => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create membership');
  return res.json();
};

// 📝 Update an existing membership
export const updateMembership = async (id, data) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update membership');
  return res.json();
};

// ❌ Remove a member from a cell group
export const deleteMembership = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete membership');
  return res.json();
};
