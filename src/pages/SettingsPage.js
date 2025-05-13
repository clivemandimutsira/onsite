import React, { useState } from 'react';
import { Tabs, Tab, Box, Typography } from '@mui/material';

import Users from './Users';
import Roles from './Roles';
import Permissions from './Permissions';
import CellRules from './AdminCellRules'; // rename if needed
import Milestones from './MilestoneTemplateManager'; // rename if needed
import FinanceSettingsPage from './FinanceSettingsPage';

export default function SettingsPage() {
  const [tab, setTab] = useState(0);

  const handleTabChange = (event, newValue) => setTab(newValue);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Settings
      </Typography>

      <Tabs
        value={tab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2 }}
      >
        <Tab label="Users" />
        <Tab label="Roles" />
        <Tab label="Permissions" />
        <Tab label="Cell Rules" />
        <Tab label="Milestone Templates" />
        <Tab label="Finance Settings" />
      </Tabs>

      <Box>
        {tab === 0 && <Users />}
        {tab === 1 && <Roles />}
        {tab === 2 && <Permissions />}
        {tab === 3 && <CellRules />}
        {tab === 4 && <Milestones />}
        {tab === 5 && <FinanceSettingsPage />}
      </Box>
    </Box>
  );
}
