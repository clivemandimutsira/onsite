const API_URL = process.env.REACT_APP_API_URL;

// Handle login and surface force‐reset flag
export async function loginAPI({ email, password }) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Login failed');
  }

  return {
    token:              data.token,
    roles:              data.roles,
    permissions:        data.permissions,
    userRole:           data.userRole,
    memberId:           data.memberId,
    forcePasswordReset: data.forcePasswordReset,   // <— new
  };
}

// Request a reset link be emailed
export async function requestResetAPI({ email }) {
  const res = await fetch(`${API_URL}/auth/request-reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Reset request failed');
  }
  return data;
}

// Actually reset via the token
export async function resetPasswordAPI({ token, newPassword }) {
  const res = await fetch(`${API_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Reset failed');
  }
  return data;
}

// Activate new account or force-reset user
export async function activateAccountAPI({ token, newPassword }) {
  const res = await fetch(`${API_URL}/auth/activate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Account activation failed');
  }

  return data;
}
export async function verifyEmailAPI({ token, newPassword }) {
  const res = await fetch(`${API_URL}/auth/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Verification failed');
  }
  return data;
}
