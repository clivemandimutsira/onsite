const API_URL = process.env.REACT_APP_API_URL;

export async function loginAPI({ email, password }) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const contentType = res.headers.get('content-type');
  const raw = await res.text(); // Always read the raw response

  if (!res.ok) {
    // Try to extract error message from body if possible
    try {
      const data = JSON.parse(raw);
      throw new Error(data.message || 'Login failed');
    } catch {
      console.error('Server returned non-JSON error:', raw);
      throw new Error(raw || 'Login failed');
    }
  }

  try {
    if (contentType && contentType.includes('application/json')) {
      return JSON.parse(raw);
    } else {
      throw new Error('Unexpected server response: not JSON');
    }
  } catch (e) {
    console.error('Failed to parse JSON:', raw);
    throw new Error('Invalid response from server');
  }
}
