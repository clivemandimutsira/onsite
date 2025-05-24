// src/components/member/PledgeProgressList.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  LinearProgress,
  Stack
} from '@mui/material';
import { fetchPledges } from '../../api/pledgeService';

export default function PledgeProgressList({ memberId }) {
  const [pledges, setPledges] = useState(null);

  useEffect(() => {
    fetchPledges(memberId)
      .then(setPledges)
      .catch(console.error);
  }, [memberId]);

  if (!pledges) return <CircularProgress sx={{ mb: 4 }} />;
  if (pledges.length === 0) return <Typography>No pledges found.</Typography>;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>Pledge Progress</Typography>
      <Stack spacing={2}>
        {pledges.map((p) => {
          const amount = Number(p.amount) || 0;
          const fulfilled = Number(p.fulfilled) || 0;
          const pct = amount > 0 ? (fulfilled / amount) * 100 : 0;

          return (
            <Card key={p.id} variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  {p.description || 'Pledge'}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {`Goal: $${amount.toFixed(2)} | Fulfilled: $${fulfilled.toFixed(2)} (${pct.toFixed(0)}%)`}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={pct}
                  sx={{ height: 10, borderRadius: 1 }}
                />
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </Box>
  );
}
