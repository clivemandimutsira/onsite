import React, { useEffect, useState, useMemo } from 'react';
import {
  Container, Typography, Grid, Paper, Box, Button, Modal, TextField, useTheme
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Legend
} from 'recharts';
import {
  format, parseISO, subDays, isAfter, isBefore, getMonth, getDay
} from 'date-fns';

import { getUsers } from '../api/users';
import { getRoles } from '../api/roles';
import { getPermissions } from '../api/permissions';

const API = process.env.REACT_APP_API_URL;
const COLOR_PALETTE = ['#1976d2', '#00C49F', '#FFBB28', '#FF8042'];

export default function Dashboard() {
  const theme = useTheme();
  const [counts, setCounts] = useState({});
  const [data, setData] = useState({
    members: [],
    prayers: [],
    sessions: [],
    foundations: [],
    baptisms: [],
    firstTimers: [],
    newConverts: []
  });
  const [dateRange, setDateRange] = useState([subDays(new Date(), 6), new Date()]);
  const [drillData, setDrillData] = useState({ title: '', items: [] });

  const loadData = async () => {
    try {
      const [users, roles, permissions] = await Promise.all([
        getUsers(), getRoles(), getPermissions()
      ]);

      const endpoints = [
        'members', 'prayer-requests', 'counseling',
        'milestones', 'new-converts?baptism_scheduled=true',
        'first-timers', 'new-converts'
      ].map(path => fetch(`${API}/${path}`));

      const responses = await Promise.all(endpoints);
      const jsons = await Promise.all(responses.map(res => res.json()));

      const [members, prayers, sessionsRaw, foundations, baptisms, fts, ncs] = jsons;

      // Ensure sessions is an array, or fallback to empty array
      const sessions = Array.isArray(sessionsRaw) ? sessionsRaw : [];
      if (!Array.isArray(sessionsRaw)) {
        console.warn('Expected array for sessions, got:', sessionsRaw);
      }

      setData({ members, prayers, sessions, foundations, baptisms, firstTimers: fts, newConverts: ncs });

      setCounts({
        users: users.length,
        roles: roles.length,
        permissions: permissions.length,
        members: members.length,
        prayers: prayers.length,
        sessions: sessions.length,
        baptisms: baptisms.length,
        foundations: foundations.filter(f => f.milestone_name?.toLowerCase().includes('foundation')).length,
        firstTimers: fts.length,
        newConverts: ncs.length
      });
    } catch (err) {
      console.error('Dashboard load error:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const weeklyData = useMemo(() => {
    const counts = Array(7).fill(0);
    data.members.forEach(({ joined_at }) => {
      const d = new Date(joined_at);
      if (isAfter(d, dateRange[0]) && isBefore(d, dateRange[1])) {
        counts[getDay(d)]++;
      }
    });
    return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((day, i) => ({ day, count: counts[i] }));
  }, [data.members, dateRange]);

  const monthlyPrayers = useMemo(() => {
    const counts = Array(12).fill(0);
    data.prayers.forEach(({ created_at }) => counts[getMonth(new Date(created_at))]++);
    return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m,i) => ({ month: m, count: counts[i] }));
  }, [data.prayers]);

  const sessionModes = useMemo(() => {
    const map = {};
    const sessions = Array.isArray(data.sessions) ? data.sessions : [];

    sessions.forEach(s => {
      const mode = s.mode || 'Unknown';
      map[mode] = (map[mode] || 0) + 1;
    });

    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [data.sessions]);

  const handleDrill = (items, title) => {
    setDrillData({ items, title });
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
          <Typography>Filter by:</Typography>
          <TextField
            label="Start"
            type="date"
            value={format(dateRange[0], 'yyyy-MM-dd')}
            onChange={e => setDateRange([parseISO(e.target.value), dateRange[1]])}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="End"
            type="date"
            value={format(dateRange[1], 'yyyy-MM-dd')}
            onChange={e => setDateRange([dateRange[0], parseISO(e.target.value)])}
            InputLabelProps={{ shrink: true }}
          />
          <Button variant="outlined" onClick={loadData}>Refresh</Button>
        </Box>
      </LocalizationProvider>

      <Grid container spacing={2}>
        {Object.entries(counts).map(([key, val]) => (
          <Grid item xs={12} sm={6} md={3} key={key}>
            <Paper sx={{ p:2, textAlign:'center' }} elevation={2}>
              <Typography variant="subtitle2">{key.replace(/([A-Z])/g,' $1')}</Typography>
              <Typography variant="h5">{val}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h5" sx={{ mt:4, mb:2 }}>Insights</Typography>
      <Grid container spacing={4}>
        {/* Weekly Bar Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="subtitle1">New Members / Week</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={weeklyData} onClick={({ activeLabel }) => {
                if (!activeLabel) return;
                const items = data.members.filter(m => {
                  const d = new Date(m.joined_at);
                  return isAfter(d, dateRange[0]) && isBefore(d, dateRange[1]) && getDay(d) === ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(activeLabel);
                });
                handleDrill(items, `Joined on ${activeLabel}`);
              }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/> 
                    <stop offset="100%" stopColor={theme.palette.primary.main} stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="url(#barGradient)" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Monthly Line Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="subtitle1">Prayer Requests / Month</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={monthlyPrayers}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke={theme.palette.secondary.main} strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Session Modes Pie Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="subtitle1">Counseling Modes</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie data={sessionModes} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {sessionModes.map((_, i) => (
                    <Cell key={i} fill={COLOR_PALETTE[i % COLOR_PALETTE.length]} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" height={36} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Session Mode Breakdown */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="subtitle1">Session Modes Breakdown</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={sessionModes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" stackId="a" fill={COLOR_PALETTE[0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Drilldown Modal */}
      <Modal open={Boolean(drillData.items.length)} onClose={() => setDrillData({ items: [], title: '' })}>
        <Paper sx={{ p:3, m:'10vh auto', width:'70%', maxHeight:'70vh', overflow:'auto' }}>
          <Typography variant="h6" gutterBottom>{drillData.title}</Typography>
          {drillData.items.length ? drillData.items.map((item,i) => (
            <Box key={i} sx={{ mb:1 }}>
              <Typography>{item.first_name || item.name} {item.last_name || ''}</Typography>
            </Box>
          )) : <Typography>No data.</Typography>}
        </Paper>
      </Modal>
    </Container>
  );
}
