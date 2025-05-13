// src/api/eventService.js

const BASE = `${process.env.REACT_APP_API_URL}/events`;

/**
 * Helper function to parse API responses
 */
async function parseResponse(res) {
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`API Error ${res.status}: ${text}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    console.warn('Response was not JSON:', text);
    return text;
  }
}

/**
 * Fetch all events
 */
export async function fetchEvents() {
  try {
    const res = await fetch(BASE);
    return await parseResponse(res);
  } catch (err) {
    console.error('Error fetching events:', err);
    throw err;
  }
}

/**
 * Fetch event by ID
 * Always fetches all events and returns the one with matching ID
 */
export async function fetchEventById(id) {
  const numId = Number(id);
  try {
    const all = await fetchEvents();
    if (!Array.isArray(all)) {
      throw new Error('Expected array from fetchEvents');
    }
    const found = all.find(ev => ev.id === numId || String(ev.id) === id);
    if (!found) {
      throw new Error(`No event found for ID ${id}`);
    }
    return found;
  } catch (err) {
    console.error('Error in fetchEventById:', err);
    throw err;
  }
}

/**
 * Delete an event
 */
export async function deleteEvent(id) {
  try {
    const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
    return await parseResponse(res);
  } catch (err) {
    console.error('Error deleting event:', err);
    throw err;
  }
}

/**
 * Fetch events by member ID
 */
export async function fetchEventsByMember(memberId) {
  try {
    const res = await fetch(`${BASE}/member/${memberId}`);
    return await parseResponse(res);
  } catch (err) {
    console.error('Error fetching events by member:', err);
    throw err;
  }
}

/**
 * Create a new event
 */
export async function createEvent(data) {
  try {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await parseResponse(res);
  } catch (err) {
    console.error('Error creating event:', err);
    throw err;
  }
}

/**
 * Update an existing event
 */
export async function updateEvent(id, data) {
  try {
    const res = await fetch(`${BASE}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await parseResponse(res);
  } catch (err) {
    console.error('Error updating event:', err);
    throw err;
  }
}

/**
 * ✅ Fixed: Fetch upcoming events with registration status for a member
 */
export async function fetchUpcomingEventsWithStatus(memberId) {
  try {
    const res = await fetch(`${BASE}/member/${memberId}/upcoming`);
    return await parseResponse(res);
  } catch (err) {
    console.error('Error fetching upcoming events:', err);
    throw err;
  }
}

// Fetch upcoming events not yet registered
export async function fetchUpcomingEvents(memberId) {
  const res = await fetch(`${BASE}/member/${memberId}/upcoming`);
  return await parseResponse(res);
}

// Register a member for an event (creates registration entry)
export async function registerForEvent(memberId, eventId) {
  const res = await fetch(`${BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ memberId, eventId }),
  });
  return await parseResponse(res);
}



