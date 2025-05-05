// src/services/cellGroupService.js

const API_URL = process.env.REACT_APP_API_URL + '/cell-groups';

export const getAllCellGroups = async () => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Failed to fetch cell groups');
  return res.json();
};

export const createCellGroup = async (data) => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create cell group');
  return res.json();
};

export const updateCellGroup = async (id, data) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update cell group');
  return res.json();
};

export const deleteCellGroup = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete cell group');
  return res.json();
};

