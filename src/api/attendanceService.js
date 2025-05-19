// src/api/attendanceService.js

const BASE = `${process.env.REACT_APP_API_URL}/attendances`;

/** Helper to parse JSON only on success, otherwise throw with text */
async function parseResponse(res) {
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${text}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    // If it's empty or not JSON, just return the raw text
    return text;
  }
}

// Check-in endpoints
export const checkInManual = data =>
  fetch(`${BASE}/manual`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(parseResponse);

export const checkInQR = data =>
  fetch(`${BASE}/qr`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(parseResponse);

export const checkInGeofence = data =>
  fetch(`${BASE}/geofence`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(parseResponse);

export const checkInPush = data =>
  fetch(`${BASE}/push`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(parseResponse);

export const checkInRFID = data =>
  fetch(`${BASE}/rfid`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(parseResponse);

export const checkInBeacon = data =>
  fetch(`${BASE}/beacon`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(parseResponse);

export const checkInCode = data =>
  fetch(`${BASE}/code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(parseResponse);

// Attendance history endpoints
export const fetchByMember = memberId =>
  fetch(`${BASE}/member/${memberId}`).then(parseResponse);

export const fetchByEvent = eventId =>
  fetch(`${BASE}/event/${eventId}`).then(parseResponse);

// (Kept for compatibility, but 'fetchByMember' covers this)
export const fetchEventsByMember = memberId =>
  fetchByMember(memberId);
