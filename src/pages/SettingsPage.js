import React, { useState } from 'react';
import { Tabs, Tab, Box, Typography } from '@mui/material';

import Users from './Users';
import Roles from './Roles';
import Permissions from './Permissions';
import CellRules from './AdminCellRules'; // rename if needed
import Milestones from './MilestoneTemplateManager'; // rename if needed
import FinanceSettingsPage from './FinanceSettingsPage';
import BadgeSettingsPage from './BadgeSettingsPage';
import PledgeSettingsPage from './PledgeSettingsPage';
import ImportColumnSettingsPage from './ImportColumnSettingsPage';

export default function SettingsPage() {
  const [tab, setTab] = useState(0);

  const handleTabChange = (event, newValue) => setTab(newValue);

  return (
    <Box sx={{ p: 2 }}>
      
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
        <Tab label="Cell" />
        <Tab label="Milestones" />
        <Tab label="Finance" />
        <Tab label="Badges" />
        <Tab label="Pledges" />
        <Tab label="Import Columns" />
        
      </Tabs>

      <Box>
        {tab === 0 && <Users />}
        {tab === 1 && <Roles />}
        {tab === 2 && <Permissions />}
        {tab === 3 && <CellRules />}
        {tab === 4 && <Milestones />}
        {tab === 5 && <FinanceSettingsPage />}
        {tab === 6 && <BadgeSettingsPage />}
        {tab === 7 && <PledgeSettingsPage />}
        {tab === 8 && <ImportColumnSettingsPage />}
      </Box>
    </Box>
  );
}
