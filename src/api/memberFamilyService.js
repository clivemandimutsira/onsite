// src/services/memberFamilyService.js

const API_URL = process.env.REACT_APP_API_URL + '/member-family';

export const getFamilyLinksByMemberId = async (memberId) => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Failed to fetch family links');
  const all = await res.json();
  return all.filter(link => link.member_id === memberId);
};

export const createFamilyLink = async (data) => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create family link');
  return res.json();
};

export const deleteFamilyLink = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete family link');
  return res.json();
};
