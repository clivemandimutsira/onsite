const API_URL = process.env.REACT_APP_API_URL;

function authHeaders() {
  const token = localStorage.getItem('token');
  return { 
    'Authorization': `Bearer ${token}`, 
    'Content-Type': 'application/json' 
  };
}

// Helper to safely parse JSON
async function safeJsonParse(res) {
  const text = await res.text();
  return text ? JSON.parse(text) : {}; // ✅ If empty response, return {}
}

// Function to get all permissions
export async function getPermissions() {
  const res = await fetch(`${API_URL}/permissions`, { headers: authHeaders() });
  return await safeJsonParse(res);
}

// Function to create a new permission
export async function createPermission(data) {
  const res = await fetch(`${API_URL}/permissions`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return await safeJsonParse(res);
}

// Function to update a permission
export async function updatePermission(id, data) {
  const res = await fetch(`${API_URL}/permissions/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return await safeJsonParse(res);
}

// Function to delete a permission
export async function deletePermission(id) {
  const res = await fetch(`${API_URL}/permissions/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return await safeJsonParse(res); // ✅ Safely handle empty delete response
}
