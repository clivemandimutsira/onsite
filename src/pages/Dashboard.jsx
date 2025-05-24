import React, { useEffect, useState, useContext } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Button,
  Modal,
  TextField,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers';
import { Line, Pie, Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Tooltip as ChartTooltip, Legend as ChartLegend } from 'chart.js';
import { subDays, getMonth } from 'date-fns';
import { AuthContext } from '../contexts/AuthContext';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
  TimelineOppositeContent
} from '@mui/lab';
import { useTheme } from '@mui/material/styles';
import { Chart as ChartJS } from 'chart.js';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import CelebrationIcon from '@mui/icons-material/Celebration';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, ChartTooltip, ChartLegend);
ChartJS.defaults.elements.bar.borderRadius = 12;
ChartJS.defaults.elements.bar.borderSkipped = false;

const API = process.env.REACT_APP_API_URL;

const neumorphicCard = (theme) => ({
  backgroundColor: theme.palette.mode === 'light' ? '#fefefe' : theme.palette.background.paper,
  padding: theme.spacing(3),
  borderRadius: 16,
  boxShadow: theme.palette.mode === 'light'
    ? '4px 4px 10px rgba(0,0,0,0.1), -4px -4px 10px rgba(255,255,255,0.8)'
    : '4px 4px 10px rgba(0,0,0,0.3), -4px -4px 10px rgba(60,60,60,0.1)',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-6px)',
    boxShadow: theme.palette.mode === 'light'
      ? '6px 6px 12px rgba(0,0,0,0.1), -6px -6px 12px rgba(255,255,255,0.8)'
      : '6px 6px 12px rgba(0,0,0,0.4), -6px -6px 12px rgba(60,60,60,0.2)',
  },
});

const statColors = [
  'linear-gradient(135deg, #42a5f5 0%, #478ed1 100%)', // blue
  'linear-gradient(135deg, #66bb6a 0%, #43a047 100%)', // green
  'linear-gradient(135deg, #ffa726 0%, #fb8c00 100%)', // orange
  'linear-gradient(135deg, #ab47bc 0%, #8e24aa 100%)', // purple
  'linear-gradient(135deg, #ec407a 0%, #d81b60 100%)', // pink
  'linear-gradient(135deg, #ff7043 0%, #d84315 100%)', // deep orange
  'linear-gradient(135deg, #26c6da 0%, #00838f 100%)', // cyan
  'linear-gradient(135deg, #cfd8dc 0%, #607d8b 100%)', // blue grey
];

const StatCard = ({ title, value, colorIdx = 0 }) => {
  const theme = useTheme();
  const icons = [
    <PeopleAltIcon fontSize="large" />,
    <VolunteerActivismIcon fontSize="large" />,
    <EventAvailableIcon fontSize="large" />,
    <CelebrationIcon fontSize="large" />,
    <EmojiEventsIcon fontSize="large" />,
    <PersonAddAltIcon fontSize="large" />,
    <TrendingUpIcon fontSize="large" />,
    <ErrorOutlineIcon fontSize="large" />,
  ];
  return (
    <Box
      sx={{
        ...neumorphicCard(theme),
        textAlign: 'center',
        background: statColors[colorIdx % statColors.length],
        color: theme.palette.common.white,
        position: 'relative',
        overflow: 'hidden',
        minHeight: 120,
        boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)',
      }}
    >
      <Box sx={{ position: 'absolute', top: 16, right: 16, opacity: 0.18, fontSize: 80 }}>
        {icons[colorIdx % icons.length]}
      </Box>
      <Typography variant="subtitle2" textTransform="uppercase" gutterBottom sx={{ position: 'relative', zIndex: 1 }}>
        {title}
      </Typography>
      <Typography variant="h4" fontWeight="bold" sx={{ position: 'relative', zIndex: 1 }}>
        {value}
      </Typography>
    </Box>
  );
};

const DailyActivitiesCard = () => {
  const theme = useTheme();
  const [activities, setActivities] = useState([
    { time: '09:30 am', text: 'Payment received from John Doe of $385.90', color: theme.palette.primary.main },
    { time: '10:00 am', text: 'New sale recorded #ML-3467', color: theme.palette.success.main },
    { time: '12:00 am', text: 'Payment was made of $64.95 to Michael', color: theme.palette.warning.main },
    { time: '09:30 am', text: 'New arrival recorded', color: theme.palette.info.main },
  ]);

  useEffect(() => {
    const ws = new WebSocket('wss://your-websocket-url');
    ws.onmessage = (event) => {
      const newActivity = JSON.parse(event.data);
      setActivities((prev) => [
        { time: new Date(newActivity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: newActivity.text, color: theme.palette.secondary.main },
        ...prev
      ]);
    };
    return () => ws.close();
  }, [theme.palette.secondary.main]);

  return (
    <Box
      sx={{
        background: theme.palette.background.paper,
        borderRadius: 2,
        p: 3,
        boxShadow: 3,
        mb: 4,
        color: theme.palette.text.primary,
      }}
    >
      <Typography variant="h6" fontWeight={500} sx={{ mb: 1 }}>📅 Daily Activities</Typography>
      <Divider sx={{ mb: 2 }} />
      <Timeline>
        {activities.map((activity, index) => (
          <TimelineItem key={index}>
            <TimelineOppositeContent sx={{ flex: 0.2, fontSize: '0.875rem', color: theme.palette.text.secondary, textAlign: 'right' }}>
              {activity.time}
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot sx={{ backgroundColor: activity.color }} />
              {index < activities.length - 1 && <TimelineConnector sx={{ backgroundColor: theme.palette.divider }} />}
            </TimelineSeparator>
            <TimelineContent>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>{activity.text.split(' ')[0]}</Typography>
              <Typography variant="body2" color="text.secondary">{activity.text.slice(activity.text.indexOf(' ') + 1)}</Typography>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Box>
  );
};

const TopGiversCard = () => {
  const theme = useTheme();
  const [selectedMonth, setSelectedMonth] = useState('March 2025');

  const giversByMonth = {
    'January 2025': [
      { name: 'John Doe', category: 'Platinum Donor', amount: '$3,500', color: '#9C27B0' }, // purple
      { name: 'Jane Smith', category: 'Gold Donor', amount: '$2,800', color: '#FF9800' },   // orange
    ],
    'February 2025': [
      { name: 'Michael Brown', category: 'Silver Donor', amount: '$1,200', color: '#00B8D4' }, // cyan
      { name: 'Emily Davis', category: 'Bronze Donor', amount: '$950', color: '#F44336' },     // red
    ],
    'March 2025': [
      { name: 'Chris Green', category: 'Platinum Donor', amount: '$3,200', color: '#8BC34A' }, // light green
      { name: 'Anna White', category: 'Gold Donor', amount: '$2,500', color: '#FFD600' },      // yellow
    ],
  };

  const topGivers = giversByMonth[selectedMonth] || [];

  return (
    <Box
      sx={{
        background: theme.palette.background.paper,
        borderRadius: 2,
        p: 3,
        boxShadow: 3,
        color: theme.palette.text.primary,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" fontWeight={500}>💎 Top Givers</Typography>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="month-select-label">Month</InputLabel>
          <Select
            labelId="month-select-label"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            label="Month"
            sx={{
              background: theme.palette.mode === 'light' ? '#f8f9fa' : theme.palette.background.default,
              color: theme.palette.text.primary,
            }}
          >
            {Object.keys(giversByMonth).map((month) => (
              <MenuItem key={month} value={month}>{month}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      {topGivers.map((giver, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            py: 1.2,
            borderBottom: index < topGivers.length - 1 ? `1px solid ${theme.palette.divider}` : 'none'
          }}
        >
          <Typography variant="body2" sx={{ width: '30%' }}>{giver.name}</Typography>
          <Typography
            variant="body2"
            sx={{
              width: '40%',
              bgcolor: theme.palette.mode === 'light' ? '#f1f1f1' : theme.palette.action.selected,
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              fontWeight: 500,
              color: theme.palette.text.primary,
            }}
          >
            {giver.category}
          </Typography>
          <Typography variant="body2" sx={{ width: '30%', textAlign: 'right', fontWeight: 600, color: giver.color }}>
            {giver.amount}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

const RecentActivityFeed = ({ activities }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        background: theme.palette.background.paper,
        borderRadius: 2,
        p: 3,
        boxShadow: 3,
        mt: 4,
        color: theme.palette.text.primary,
        border: `2px solid ${theme.palette.pink ? theme.palette.pink.main : '#ec407a'}`, // Use theme pink or fallback
      }}
    >
      <Typography variant="h6" fontWeight={500} sx={{ mb: 2 }}>🕒 Recent Activity</Typography>
      <Divider sx={{ mb: 2 }} />
      {activities.length === 0 ? (
        <Typography color="text.secondary">No recent activity.</Typography>
      ) : (
        activities.slice(0, 6).map((a, i) => (
          <Box key={i} sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {a.text}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(a.timestamp).toLocaleString()}
            </Typography>
          </Box>
        ))
      )}
    </Box>
  );
};

export default function Dashboard() {
  const theme = useTheme();
  const { permissions } = useContext(AuthContext);
  const canViewDashboard = permissions.includes('view_dashboard') || permissions.includes('manage_dashboard');
  const canEditDashboard = permissions.includes('edit_dashboard') || permissions.includes('manage_dashboard');

  const [counts, setCounts] = useState({});
  const [data, setData] = useState({ members: [], prayers: [], sessions: [], foundations: [], baptisms: [], firstTimers: [], newConverts: [] });
  const [dateRange, setDateRange] = useState([subDays(new Date(), 6), new Date()]);
  const [drillData, setDrillData] = useState({ title: '', items: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const endpoints = [
        'members', 'prayer-requests', 'counseling',
        'milestones', 'new-converts?baptism_scheduled=true',
        'first-timers', 'new-converts'
      ].map(path => fetch(`${API}/${path}`));

      const responses = await Promise.all(endpoints);
      const jsons = await Promise.all(responses.map(res => res.ok ? res.json() : []));
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
    } catch (e) {
      setError('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (canViewDashboard) loadData(); }, [canViewDashboard]);

  useEffect(() => {
    console.log('Loaded members:', data.members);
  }, [data.members]);

  const monthlyData = (array, dateField) => {
    const counts = Array(12).fill(0);
    const currentYear = new Date().getFullYear();
    array.forEach(item => {
      const date = new Date(item[dateField]);
      if (
        date instanceof Date &&
        !isNaN(date) &&
        date.getFullYear() === currentYear
      ) {
        counts[getMonth(date)]++;
      }
    });
    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      .map((month, i) => ({ month, count: counts[i] }));
  };

  const sessionModes = () => {
    const map = {};
    data.sessions.forEach(s => {
      const mode = s.mode || 'Unknown';
      map[mode] = (map[mode] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  };

  if (!canViewDashboard) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h6">🚫 You do not have permission to view the dashboard.</Typography>
      </Container>
    );
  }

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    theme.palette.secondary.main,
    theme.palette.error.main,
    '#9C27B0', // purple
    '#FF9800', // orange
    '#00B8D4', // cyan
    '#F44336', // red
    '#8BC34A', // light green
    '#FFD600', // yellow
    '#795548', // brown
    '#607D8B', // blue grey
  ];

  const chartCardBorder = [
    'linear-gradient(135deg, #ec407a 0%, #42a5f5 100%)', // pink to blue
    'linear-gradient(135deg, #ff9800 0%, #66bb6a 100%)', // orange to green
    'linear-gradient(135deg, #ab47bc 0%, #ffd600 100%)', // purple to yellow
  ];

  const chartBlocks = [
    {
      title: "📈 New Members",
      chart: (
        <Line
          data={{
            labels: monthlyData(data.members, 'date_joined_church').map(d => d.month),
            datasets: [{
              label: 'New Members',
              data: monthlyData(data.members, 'date_joined_church').map(d => d.count),
              fill: true,
              backgroundColor: 'rgba(236,64,122,0.18)', // pink
              borderColor: '#ec407a',
              tension: 0.4,
              pointBackgroundColor: '#ec407a',
            }]
          }}
          options={{
            responsive: true,
            plugins: {
              legend: { display: false },
              tooltip: { mode: 'index', intersect: false }
            },
            scales: {
              x: { grid: { color: theme.palette.divider } },
              y: { beginAtZero: true, grid: { color: theme.palette.divider } }
            }
          }}
          height={250}
        />
      )
    },
    {
      title: "🙏 Prayer Requests",
      chart: (
        <Bar
          data={{
            labels: monthlyData(data.prayers, 'created_at').map(d => d.month),
            datasets: [{
              label: 'Prayer Requests',
              data: monthlyData(data.prayers, 'created_at').map(d => d.count),
              backgroundColor: [
                '#ec407a', '#42a5f5', '#ff9800', '#ab47bc', '#ffd600', '#66bb6a',
                '#00bcd4', '#8bc34a', '#f44336', '#607d8b', '#ff7043', '#cfd8dc'
              ],
              borderColor: '#fff',
              borderWidth: 1,
              borderRadius: 16,
              borderSkipped: false,
            }]
          }}
          options={{
            responsive: true,
            plugins: {
              legend: { display: false },
              tooltip: { mode: 'index', intersect: false }
            },
            scales: {
              x: { grid: { color: theme.palette.divider } },
              y: { beginAtZero: true, grid: { color: theme.palette.divider } }
            },
            elements: {
              bar: {
                borderRadius: 16,
                borderSkipped: false,
              }
            }
          }}
          height={250}
        />
      )
    },
    {
      title: "🧑‍💼 Session Modes",
      chart: (
        <Pie
          data={{
            labels: sessionModes().map(d => d.name),
            datasets: [{
              data: sessionModes().map(d => d.value),
              backgroundColor: [
                '#ec407a', '#42a5f5', '#ff9800', '#ab47bc', '#ffd600', '#66bb6a',
                '#00bcd4', '#8bc34a', '#f44336', '#607d8b', '#ff7043', '#cfd8dc'
              ],
              borderWidth: 1,
            }]
          }}
          options={{
            responsive: true,
            plugins: {
              legend: { position: 'bottom' },
              tooltip: { mode: 'index', intersect: false }
            }
          }}
          height={250}
        />
      )
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            mb: 5,
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <DatePicker
            label="Start Date"
            value={dateRange[0]}
            onChange={(newValue) => setDateRange([newValue, dateRange[1]])}
            renderInput={(params) => <TextField {...params} size="small" />}
          />
          <DatePicker
            label="End Date"
            value={dateRange[1]}
            onChange={(newValue) => setDateRange([dateRange[0], newValue])}
            renderInput={(params) => <TextField {...params} size="small" />}
          />
          {canEditDashboard && (
            <Button variant="contained" size="medium" onClick={loadData}>
              Refresh
            </Button>
          )}
        </Box>
      </LocalizationProvider>

      {loading ? (
        <CircularProgress sx={{ display: 'block', margin: '0 auto' }} />
      ) : error ? (
        <Typography color="error" sx={{ textAlign: 'center' }}>{error}</Typography>
      ) : (
        <>
          <Grid container spacing={3}>
            {Object.entries(counts).map(([key, val], idx) => (
              <Grid item xs={12} sm={6} md={3} key={key}>
                <StatCard title={key.replace(/([A-Z])/g, ' $1')} value={val} colorIdx={idx} />
              </Grid>
            ))}
          </Grid>

          <Typography variant="h5" sx={{ mt: 5, mb: 2 }}>📊 Insights</Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {chartBlocks.map(({ title, chart }, i) => (
              <Box
                key={i}
                sx={{
                  ...neumorphicCard(theme),
                  backgroundColor: theme.palette.background.paper,
                  width: '100%',
                  maxWidth: 400,
                  flexGrow: 1,
                  flexBasis: '30%',
                  minWidth: 280,
                  textAlign: 'center',
                  border: `3px solid transparent`,
                  backgroundImage: `${neumorphicCard(theme).backgroundColor}, ${chartCardBorder[i % chartCardBorder.length]}`,
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'padding-box, border-box',
                  boxShadow: '0 4px 24px 0 rgba(236,64,122,0.08)',
                }}
              >
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                  {title}
                </Typography>
                {chart}
              </Box>
            ))}
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 5 }}>
            <Box sx={{ flex: 1, minWidth: 300 }}>
              <DailyActivitiesCard />
            </Box>
            <Box sx={{ flex: 1, minWidth: 300 }}>
              <TopGiversCard />
            </Box>
          </Box>

          <RecentActivityFeed activities={data.activities || []} />
        </>
      )}

      <Modal open={!!drillData.items.length} onClose={() => setDrillData({ title: '', items: [] })}>
        <Box
          sx={{
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            p: 4,
            m: 'auto',
            mt: 10,
            borderRadius: 2,
            width: '90%',
            maxWidth: 600
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>{drillData.title}</Typography>
          {drillData.items.map((item, index) => (
            <Typography key={index} variant="body2" sx={{ mb: 1 }}>{JSON.stringify(item)}</Typography>
          ))}
          <Button onClick={() => setDrillData({ title: '', items: [] })}>Close</Button>
        </Box>
      </Modal>
    </Container>
  );
}
