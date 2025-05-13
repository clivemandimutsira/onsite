// src/pages/EventForm.jsx
import React, { useState, useEffect, useContext } from 'react';
import { TextField, Button } from '@mui/material';
import { DateTimePicker, LocalizationProvider } from '@mui/lab';
import DateAdapter from '@mui/lab/AdapterDateFns';
import { createEvent, fetchEventById, updateEvent } from '../../api/eventService';
import { useNavigate, useParams } from 'react-router-dom';

export default function EventForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const nav = useNavigate();
  const [data, setData] = useState({
    name: '', description: '', event_date: new Date(), location: '', qr_token: '', latitude: '', longitude: '', geofence_radius: ''
  });

  useEffect(() => {
    if (editing) {
      fetchEventById(id).then(e => setData({
        name: e.name,
        description: e.description,
        event_date: new Date(e.event_date),
        location: e.location,
        qr_token: e.qr_token || '',
        latitude: e.latitude || '',
        longitude: e.longitude || '',
        geofence_radius: e.geofence_radius || ''
      }));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (dt) => {
    setData(prev => ({ ...prev, event_date: dt }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) await updateEvent(id, data);
    else await createEvent(data);
    nav('/events');
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', maxWidth: 400, margin: '0 auto' }}>
      <TextField label="Name" name="name" value={data.name} onChange={handleChange} required />
      <TextField label="Description" name="description" multiline rows={4} value={data.description} onChange={handleChange} />
      <LocalizationProvider dateAdapter={DateAdapter}>
        <DateTimePicker
          label="Date & Time"
          value={data.event_date}
          onChange={handleDateChange}
          renderInput={(props) => <TextField {...props} fullWidth />}
        />
      </LocalizationProvider>
      <TextField label="Location" name="location" value={data.location} onChange={handleChange} />
      <TextField label="QR Token" name="qr_token" value={data.qr_token} onChange={handleChange} />
      <TextField label="Latitude" name="latitude" value={data.latitude} onChange={handleChange} />
      <TextField label="Longitude" name="longitude" value={data.longitude} onChange={handleChange} />
      <TextField label="Geofence Radius (m)" name="geofence_radius" value={data.geofence_radius} onChange={handleChange} />
      <Button type="submit" variant="contained">{editing ? 'Update' : 'Create'} Event</Button>
      <Button onClick={() => nav('/events')}>Cancel</Button>
    </form>
  );
}