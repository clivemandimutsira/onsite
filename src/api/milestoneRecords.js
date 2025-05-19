const API_URL = process.env.REACT_APP_API_URL + '/milestones';

// Fetch milestones by member ID
export const getMilestonesByMember = async (memberId) => {
  try {
    const res = await fetch(`${API_URL}/${memberId}`);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('[getMilestonesByMember] Error response:', errorText);
      throw new Error(`Failed to fetch milestones: ${res.statusText}`);
    }

    return res.json();
  } catch (error) {
    console.error('[getMilestonesByMember] Error:', error);
    throw new Error('Error occurred while fetching milestones.');
  }
};

// Assign a milestone to a member
export const assignMilestone = async ({ member_id, template_id }) => {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ member_id, template_id })
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('[assignMilestone] Error response:', errorText);
      throw new Error(`Failed to assign milestone: ${res.statusText}`);
    }

    return res.json();
  } catch (error) {
    console.error('[assignMilestone] Error:', error);
    throw new Error('Error occurred while assigning milestone.');
  }
};

// Delete a milestone by its ID
export const deleteMilestone = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('[deleteMilestone] Error response:', errorText);
      throw new Error(`Failed to delete milestone: ${res.statusText}`);
    }

    return res.json();
  } catch (error) {
    console.error('[deleteMilestone] Error:', error);
    throw new Error('Error occurred while deleting milestone.');
  }
};
