// api.js

const API_URL = process.env.REACT_APP_API_URL;

function authHeaders() {
  const token = localStorage.getItem('token');
  return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
}

async function safeJsonParse(res) {
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

// Get all users
export async function getUsers() {
  const res = await fetch(`${API_URL}/users`, { headers: authHeaders() });
  return await safeJsonParse(res);
}

// Update user information
export async function updateUser(userId, data) {
  const res = await fetch(`${API_URL}/users/${userId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return await safeJsonParse(res);
}

// Delete user
export async function deleteUser(userId) {
  const res = await fetch(`${API_URL}/users/${userId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return await safeJsonParse(res);
}

// Assign role to user
export async function assignRoleToUser(userId, roleId) {
  const res = await fetch(`${API_URL}/users/${userId}/roles`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ roleId }),
  });
  return await safeJsonParse(res);
}

// Remove role from user
export async function removeRoleFromUser(userId, roleId) {
  const res = await fetch(`${API_URL}/users/${userId}/roles`, {
    method: 'DELETE',
    headers: authHeaders(),
    body: JSON.stringify({ roleId }),
  });
  return await safeJsonParse(res);
}

// Reset temporary password
export async function resetTempPassword(userId) {
  const res = await fetch(`${API_URL}/users/${userId}/reset-password`, {
    method: 'POST',
    headers: authHeaders()
  });
  const body = await safeJsonParse(res);
  if (!res.ok) throw new Error(body.message || 'Reset failed');
  return body.tempPassword;
}

// Unlock user account
export async function unlockUser(userId) {
  const res = await fetch(`${API_URL}/users/${userId}/unlock`, {
    method: 'POST',
    headers: authHeaders()
  });
  if (!res.ok) throw new Error('Unlock failed');
}

// Toggle active status
export async function toggleActive(userId, active) {
  const res = await fetch(`${API_URL}/users/${userId}/active`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ active })
  });
  if (!res.ok) throw new Error('Toggle active failed');
}

export const registerUser = async ({ email }) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to register user');
  }

  return data;
};
