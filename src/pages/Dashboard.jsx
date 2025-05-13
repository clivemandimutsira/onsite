import React, { useEffect, useState, useContext } from 'react';
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

import { AuthContext } from '../contexts/AuthContext'; // Import AuthContext

const API = process.env.REACT_APP_API_URL;
const COLOR_PALETTE = ['#1976d2', '#00C49F', '#FFBB28', '#FF8042'];

export default function Dashboard() {
  const theme = useTheme();
  const { permissions } = useContext(AuthContext); // Access permissions from AuthContext

  // Define permission checks
  const canViewDashboard = permissions.includes('view_dashboard') || permissions.includes('manage_dashboard');
  const canEditDashboard = permissions.includes('edit_dashboard') || permissions.includes('manage_dashboard');

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
      const endpoints = [
        'members', 'prayer-requests', 'counseling',
        'milestones', 'new-converts?baptism_scheduled=true',
        'first-timers', 'new-converts'
      ].map(path => fetch(`${API}/${path}`));

      const responses = await Promise.all(endpoints);
      const jsons = await Promise.all(responses.map(res => {
        if (!res.ok) {
          console.error(`Failed to fetch ${res.url}: ${res.statusText}`);
          return [];
        }
        return res.json();
      }));

      const [members, prayers, sessionsRaw, foundations, baptisms, fts, ncs] = jsons;

      const sessions = Array.isArray(sessionsRaw) ? sessionsRaw : [];
      setData({ members, prayers, sessions, foundations, baptisms, firstTimers: fts, newConverts: ncs });

      setCounts({
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
    if (canViewDashboard) {
      loadData();
    }
  }, [canViewDashboard]);

  useEffect(() => {
    console.log('Date Range:', dateRange);
  }, [dateRange]);

  if (!canViewDashboard) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h6">You do not have permission to view the dashboard.</Typography>
      </Container>
    );
  }

  // Remove useMemo and calculate data directly
  const weeklyData = () => {
    const counts = Array(7).fill(0);
    data.members.forEach(({ joined_at }) => {
      const d = new Date(joined_at);
      if (isAfter(d, dateRange[0]) && isBefore(d, dateRange[1])) {
        counts[getDay(d)]++;
      }
    });
    return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((day, i) => ({ day, count: counts[i] }));
  };

  const monthlyPrayers = () => {
    const counts = Array(12).fill(0);
    data.prayers.forEach(({ created_at }) => counts[getMonth(new Date(created_at))]++);
    return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m,i) => ({ month: m, count: counts[i] }));
  };

  const sessionModes = () => {
    const map = {};
    const sessions = Array.isArray(data.sessions) ? data.sessions : [];

    sessions.forEach(s => {
      const mode = s.mode || 'Unknown';
      map[mode] = (map[mode] || 0) + 1;
    });

    return Object.entries(map).map(([name, value]) => ({ name, value }));
  };

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
            value={dateRange[0] instanceof Date && !isNaN(dateRange[0]) ? format(dateRange[0], 'yyyy-MM-dd') : ''}
            onChange={e => setDateRange([parseISO(e.target.value), dateRange[1]])}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="End"
            type="date"
            value={dateRange[1] instanceof Date && !isNaN(dateRange[1]) ? format(dateRange[1], 'yyyy-MM-dd') : ''}
            onChange={e => setDateRange([dateRange[0], parseISO(e.target.value)])}
            InputLabelProps={{ shrink: true }}
          />
          {canEditDashboard && (
            <Button variant="outlined" onClick={loadData}>Refresh</Button>
          )}
        </Box>
      </LocalizationProvider>

      <Grid container spacing={2}>
        {Object.entries(counts).map(([key, val]) => (
          <Grid item xs={12} sm={6} md={3} key={key}>
            <Paper sx={{ p: 2, textAlign: 'center' }} elevation={2}>
              <Typography variant="subtitle2">{key.replace(/([A-Z])/g, ' $1')}</Typography>
              <Typography variant="h5">{val}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>Insights</Typography>
      <Grid container spacing={4} sx={{ width: '100%' }}>
        {/* Weekly Bar Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 450, width: '100%' }}>
            <Typography variant="subtitle1">New Members / Week</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={weeklyData()}>
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
          <Paper sx={{ p: 3, height: 450, width: '100%' }}>
            <Typography variant="subtitle1">Prayer Requests / Month</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={monthlyPrayers()}>
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

        {/* Session Mode Breakdown */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 450, width: '100%' }}>
            <Typography variant="subtitle1">Session Modes Breakdown</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={sessionModes()}>
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
