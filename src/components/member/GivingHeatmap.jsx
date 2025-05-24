// src/components/member/GivingHeatmap.jsx
import React, { useEffect, useState } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Typography, CircularProgress, Box, Paper, Tooltip } from '@mui/material';
import { fetchGivingHeatmap } from '../../api/memberStatsService';
import { Tooltip as ReactTooltip } from 'react-tooltip';

export default function GivingHeatmap({ memberId }) {
  const [values, setValues] = useState(null);

  useEffect(() => {
    fetchGivingHeatmap(memberId).then(setValues).catch(console.error);
  }, [memberId]);

  const endDate = new Date().toISOString().slice(0, 10);
  const startDate = new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().slice(0, 10);

  if (!values) return <CircularProgress sx={{ mb: 4 }} />;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>Giving Activity</Typography>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <CalendarHeatmap
          startDate={startDate}
          endDate={endDate}
          values={values.map(v => ({ date: v.date, count: v.count }))}
          classForValue={v =>
            !v?.count
              ? 'color-empty'
              : `color-github-${Math.min(4, Math.ceil(v.count / 50))}`
          }
          tooltipDataAttrs={v =>
            v.date ? { 'data-tip': `${v.date}: $${v.count}` } : {}
          }
        />
        <ReactTooltip />
      </Paper>
    </Box>
  );
}
