const API_URL = process.env.REACT_APP_API_URL;

export async function loginAPI({ email, password }) {
  const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Login failed');
  }

  const data = await res.json();
  console.log('API response:', data); // Debugging

  return {
    token: data.token,
    roles: data.roles,
    permissions: data.permissions,
    userRole: data.userRole,     // Ensure this is included
    memberId: data.memberId      // Ensure this is included
  };
}
