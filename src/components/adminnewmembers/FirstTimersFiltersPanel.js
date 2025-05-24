import React from 'react';
import {
  Box,
  Button,
  Tabs,
  Tab,
  Card,
  CardContent,
  Typography,
  useTheme,
  Divider,
} from '@mui/material';
import { Plus, RefreshCcwDot, Download } from 'lucide-react';

export default function FirstTimersFiltersPanel({
  currentTab,
  onTabChange,
  onAddClick,
  onManualUpdate,
  onExport,
}) {
  const theme = useTheme();

  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: theme.shadows[3],
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Quick Actions
        </Typography>

        <Tabs
          value={currentTab}
          onChange={(e, newVal) => onTabChange(newVal)}
          variant="fullWidth"
          sx={{ borderRadius: 1, backgroundColor: theme.palette.background.default }}
        >
          <Tab label="First Timers" />
          <Tab label="New Converts" />
        </Tabs>

        <Divider sx={{ my: 1 }} />

        <Button
          variant="contained"
          startIcon={<Plus />}
          onClick={onAddClick}
          fullWidth
          disabled={!onAddClick}
        >
          Add {currentTab === 0 ? 'First Timer' : 'New Convert'}
        </Button>

        <Button
          variant="outlined"
          startIcon={<RefreshCcwDot />}
          onClick={onManualUpdate}
          fullWidth
        >
          Run Manual Update
        </Button>

        <Button
          variant="outlined"
          startIcon={<Download />}
          onClick={onExport}
          fullWidth
        >
          Export to Excel
        </Button>
      </CardContent>
    </Card>
  );
}