// src/services/nextOfKinService.js

const API_URL = process.env.REACT_APP_API_URL + '/next-of-kin';

export const getNextOfKinByMemberId = async (memberId) => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Failed to fetch next of kin');
  const allKin = await res.json();
  return allKin.filter(k => k.member_id === memberId);
};

export const createNextOfKin = async (data) => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create next of kin');
  return res.json();
};

export const updateNextOfKin = async (id, data) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update next of kin');
  return res.json();
};

export const deleteNextOfKin = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete next of kin');
  return res.json();
};
