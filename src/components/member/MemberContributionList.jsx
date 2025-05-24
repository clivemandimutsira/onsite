// src/components/member/MemberContributionList.jsx
import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Stack,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
} from '@mui/material';
import { fetchContributions } from '../../api/contributionService';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import Papa from 'papaparse';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

dayjs.extend(isBetween);

export default function MemberContributionList({ memberId }) {
  const [contributions, setContributions] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    fetchContributions(memberId)
      .then((data) => setContributions(data))
      .catch(console.error);
  }, [memberId]);

  const today = dayjs();

  const filteredByDate = useMemo(() => {
    if (!contributions) return [];

    return contributions.filter((c) => {
      const txDate = dayjs(c.transaction_date);

      switch (dateFilter) {
        case '30days':
          return txDate.isAfter(today.subtract(30, 'day'));
        case 'thisYear':
          return txDate.isSame(today, 'year');
        default:
          return true;
      }
    });
  }, [contributions, dateFilter]);

  const filtered = useMemo(() => {
    if (!filteredByDate) return [];
    return filterType === 'all'
      ? filteredByDate
      : filteredByDate.filter(
          (c) => c.type.toLowerCase() === filterType.toLowerCase()
        );
  }, [filteredByDate, filterType]);

  const totalThisYear = useMemo(() => {
    if (!contributions) return 0;
    return contributions
      .filter((c) =>
        dayjs(c.transaction_date).isSame(dayjs(), 'year')
      )
      .reduce((sum, c) => sum + Number(c.amount || 0), 0);
  }, [contributions]);

  const monthlyData = useMemo(() => {
    const map = {};
    filtered.forEach((c) => {
      const m = dayjs(c.transaction_date).format('MMM YYYY');
      map[m] = (map[m] || 0) + Number(c.amount);
    });
    return Object.entries(map).map(([month, amount]) => ({
      month,
      amount,
    }));
  }, [filtered]);

  const exportCSV = (data) => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'contributions.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!contributions) return <CircularProgress sx={{ mb: 4 }} />;
  if (contributions.length === 0) return <Typography>No contributions yet.</Typography>;

  return (
    <Box sx={{ mb: 4 }}>
      {/* Giving History Card */}
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Giving History
          </Typography>

          {/* Total Given This Year */}
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
            Total this year: <strong>${totalThisYear.toFixed(2)}</strong>
          </Typography>

          {/* Filters */}
          <Stack direction="row" spacing={2} sx={{ mb: 2 }} flexWrap="wrap">
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Type</InputLabel>
              <Select
                label="Type"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="recurring">Recurring</MenuItem>
                <MenuItem value="one-time">One-Time</MenuItem>
                <MenuItem value="pledge">Pledge</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Date Range</InputLabel>
              <Select
                label="Date Range"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <MenuItem value="all">All Time</MenuItem>
                <MenuItem value="30days">Last 30 Days</MenuItem>
                <MenuItem value="thisYear">This Year</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              size="small"
              onClick={() => exportCSV(filtered)}
            >
              Export CSV
            </Button>
          </Stack>

          {/* Monthly Bar Chart */}
          <Box sx={{ height: 250, mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Monthly Giving Summary
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(v) => `$${v}`} />
                <Bar dataKey="amount" fill="#1976d2" />
              </BarChart>
            </ResponsiveContainer>
          </Box>

          {/* Contribution Cards */}
          <Stack spacing={2}>
            {filtered.map((contribution) => {
              const amount = Number(contribution.amount).toFixed(2);
              const isRecurring = contribution.type.toLowerCase() === 'recurring';
              const date = dayjs(contribution.transaction_date).format('MMM D, YYYY');

              return (
                <Card key={contribution.id} variant="outlined">
                  <CardContent>
                    <Stack spacing={1}>
                      <Typography variant="h6">${amount}</Typography>
                      <Typography variant="body2" color="text.secondary">{date}</Typography>
                      <Divider />
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Chip label={contribution.method} size="small" />
                        <Chip label={contribution.type} size="small" color={isRecurring ? 'success' : 'default'} />
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
