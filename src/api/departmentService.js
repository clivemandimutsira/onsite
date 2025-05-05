// src/api/departmentService.js

const API_URL = process.env.REACT_APP_API_URL + '/departments';

export const getAllDepartments = async () => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Failed to fetch departments');
  return res.json();
};

export const createDepartment = async (data) => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create department');
  return res.json();
};

export const updateDepartment = async (id, data) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update department');
  return res.json();
};

export const deleteDepartment = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete department');
  return res.json();
};

export const getDepartmentsWithMembers = async () => {
  const res = await fetch(`${API_URL}/with-members`);
  if (!res.ok) throw new Error('Failed to fetch departments with members');
  return res.json();
};
