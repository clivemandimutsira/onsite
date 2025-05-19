const API_BASE = `${process.env.REACT_APP_API_URL}/milestone-templates`;

/**
 * Get all milestone templates
 */
export const getMilestoneTemplates = async () => {
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error('Failed to fetch milestone templates');
  return res.json();
};

/**
 * Create a new milestone template
 * @param {Object} template - { name, description, required_for_promotion }
 */
export const createMilestoneTemplate = async (template) => {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(template),
  });
  if (!res.ok) throw new Error('Failed to create milestone template');
  return res.json();
};

/**
 * Update an existing milestone template
 * @param {number|string} id
 * @param {Object} updatedData - { name, description, required_for_promotion }
 */
export const updateMilestoneTemplate = async (id, updatedData) => {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedData),
  });
  if (!res.ok) throw new Error('Failed to update milestone template');
  return res.json();
};

/**
 * Delete a milestone template
 * @param {number|string} id
 */
export const deleteMilestoneTemplate = async (id) => {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete milestone template');
  return res.json();
};
