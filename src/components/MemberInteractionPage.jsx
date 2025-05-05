import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography } from '@mui/material';
import CounselingSessionList from '../pages/CounselingSessionManager'; // Adjust path if needed
import PrayerRequestList from './PrayerRequestList'; // Adjust path if needed

const TabPanel = ({ children, value, index }) => {
  return (
    <div hidden={value !== index} role="tabpanel">
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

const MemberInteractionPage = ({ memberId }) => {
  const [tabIndex, setTabIndex] = useState(0);

  const handleChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Member Interactions</Typography>

      <Tabs value={tabIndex} onChange={handleChange} aria-label="Member Interaction Tabs">
        <Tab label="Counseling Sessions" />
        <Tab label="Prayer Requests" />
      </Tabs>

      <TabPanel value={tabIndex} index={0}>
        <CounselingSessionList memberId={memberId} />
      </TabPanel>
      <TabPanel value={tabIndex} index={1}>
        <PrayerRequestList memberId={memberId} />
      </TabPanel>
    </Box>
  );
};

export default MemberInteractionPage;
