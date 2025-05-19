// src/components/member/SummaryCards.jsx
import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Stack, CircularProgress, Box } from '@mui/material';
import { fetchMemberStats } from '../../api/memberStatsService';

export default function SummaryCards({ memberId }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchMemberStats(memberId).then(setStats).catch(console.error);
  }, [memberId]);

  if (!stats) return <CircularProgress sx={{ mb: 4 }} />;

  const items = [
    { label: 'Total Given', value: `$${stats.totalGiven.toFixed(2)}` },
    { label: 'Gifts Made', value: stats.giftCount },
    { label: 'Avg. Gift', value: `$${stats.avgGift.toFixed(2)}` },
    { label: 'Pledge Fulfilled', value: `${stats.pledgePct}%` },
  ];

  return (
    <Stack direction="row" spacing={2} sx={{ mb: 4 }} useFlexGap flexWrap="wrap">
      {items.map((item, i) => (
        <Card key={i} variant="outlined" sx={{ minWidth: 180, flex: 1 }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {item.label}
            </Typography>
            <Typography variant="h5">{item.value}</Typography>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
