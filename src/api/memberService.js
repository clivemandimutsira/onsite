// src/api/memberService.js

const API_URL = `${process.env.REACT_APP_API_URL}/members`;

/**
 * Create a new member.
 * Expects a FormData instance (fields + optional profile_photo file).
 */
export const createMember = async (formData) => {
  const res = await fetch(API_URL, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to create member');
  return res.json();
};

/**
 * Fetch all members.
 */
export const getMembers = async () => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Failed to fetch members');
  return res.json();
};

/**
 * Alias for getMembers, if you want to call it getAllMembers in your code.
 */
export const getAllMembers = async () => {
  return getMembers();
};

/**
 * Delete a member by ID.
 */
export const deleteMember = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete member');
  return res.json();
};

/**
 * Fetch a single member by ID.
 */
export const getMemberById = async (id) => {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error('Failed to fetch member');
  return res.json();
};

/**
 * Update a member by ID.
 * Expects a FormData instance (updated fields + optional new profile_photo file).
 */
export const updateMember = async (id, formData) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to update member');
  return res.json();
};

/**
 * Check for duplicate values in a given field.
 * Query params: ?field=<email|contact_primary>&value=<value>
 * Returns { exists: boolean }
 */
export const checkDuplicateField = async (field, value) => {
  const res = await fetch(
    `${API_URL}/check-duplicate?field=${encodeURIComponent(field)}&value=${encodeURIComponent(value)}`
  );
  if (!res.ok) throw new Error('Failed to check duplicate');
  return res.json();
};

/**
 * Export all members as a CSV file download.
 * Returns a Blob which you can download via URL.createObjectURL().
 */
export const exportMembers = async () => {
  const res = await fetch(`${API_URL}/export`);
  if (!res.ok) throw new Error('Failed to export members');
  return res.blob();
};

/**
 * Import members from CSV.
 * Expects a FormData with:
 * - 'file': the CSV file
 * - 'columns': JSON.stringify([list of CSV column names to import])
 */
export const importMembers = async (formData) => {
  const res = await fetch(`${API_URL}/import`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || 'Failed to import members');
  }
  return res.json();
};

/**
 * Fetch summary finance/gamification stats for a member.
 */
export const getMemberStats = async (memberId) => {
  const res = await fetch(`${API_URL}/${memberId}/stats`);
  if (!res.ok) throw new Error('Failed to fetch member stats');
  return res.json();
};

/**
 * Fetch giving-heatmap data for a member.
 */
export const getGivingHeatmap = async (memberId) => {
  const res = await fetch(`${API_URL}/${memberId}/heatmap`);
  if (!res.ok) throw new Error('Failed to fetch heatmap data');
  return res.json();
};

/**
 * Fetch monthly giving totals for a member.
 */
export const getMonthlyGiving = async (memberId) => {
  const res = await fetch(`${API_URL}/${memberId}/monthly-giving`);
  if (!res.ok) throw new Error('Failed to fetch monthly giving');
  return res.json();
};

/**
 * Fetch badges earned by a member.
 */
export const getMemberBadges = async (memberId) => {
  const res = await fetch(`${API_URL}/${memberId}/badges`);
  if (!res.ok) throw new Error('Failed to fetch member badges');
  return res.json();
};
