// src/components/member/MonthlyGivingChart.jsx
import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { Typography, CircularProgress, Box } from '@mui/material';
import { fetchMonthlyGiving } from '../../api/memberStatsService';

export default function MonthlyGivingChart({ memberId }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchMonthlyGiving(memberId).then(setData).catch(console.error);
  }, [memberId]);

  if (!data) return <CircularProgress />;

  return (
    <Box sx={{ height: 250, mb: 4 }}>
      <Typography variant="h6" gutterBottom>Monthly Giving</Typography>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={v => `$${v}`} />
          <Line type="monotone" dataKey="amount" stroke="#1976d2" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}
