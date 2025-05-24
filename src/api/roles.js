const API_URL = process.env.REACT_APP_API_URL;

function authHeaders() {
  const token = localStorage.getItem('token');
  return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
}

// Utility function to safely parse JSON
async function safeJsonParse(res) {
  const text = await res.text();
  return text ? JSON.parse(text) : {}; // ✅ if empty, return {}
}

// Function to get all roles
export async function getRoles() {
  const res = await fetch(`${API_URL}/roles`, { headers: authHeaders() });
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function createRole(data) {
  const res = await fetch(`${API_URL}/roles`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return await safeJsonParse(res); // ✅ Safe
}

export async function updateRole(roleId, data) {
  const res = await fetch(`${API_URL}/roles/${roleId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return await safeJsonParse(res); // ✅ Safe
}

export async function deleteRole(roleId) {
  await fetch(`${API_URL}/roles/${roleId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
}

export async function addPermissionToRole(roleId, permissionId) {
  const res = await fetch(`${API_URL}/roles/${roleId}/permissions`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ permissionId }),
  });
  return await safeJsonParse(res); // ✅ SAFE
}

export async function removePermissionFromRole(roleId, permissionId) {
  const res = await fetch(`${API_URL}/roles/${roleId}/permissions`, {
    method: 'DELETE',
    headers: authHeaders(),
    body: JSON.stringify({ permissionId }),
  });
  return await safeJsonParse(res); // ✅ SAFE
}
