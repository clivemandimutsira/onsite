const BASE_URL = `${process.env.REACT_APP_API_URL}/notifications`;

export const getNotifications = async (memberId) => {
  const res = await fetch(`${BASE_URL}/${memberId}`);
  if (!res.ok) throw new Error('Failed to load notifications');
  return await res.json();
};

export const markAsRead = async (id) => {
  await fetch(`${BASE_URL}/read/${id}`, { method: 'PUT' });
};

export const markAllAsRead = async (memberId) => {
  await fetch(`${BASE_URL}/read-all/${memberId}`, { method: 'PUT' });
};
