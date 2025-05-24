// Modernized MemberInteractionPage with Tabs for Counseling Sessions and Prayer Requests
import React, { useState } from 'react';
import {
  Box, Tabs, Tab, Typography, Container, Paper
} from '@mui/material';
import CounselingSessionManager from '../pages/CounselingSessionManager';
import PrayerRequestList from './PrayerRequestList';

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index} role="tabpanel">
    {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
  </div>
);

const MemberInteractionPage = ({ memberId }) => {
  const [tabIndex, setTabIndex] = useState(0);

  const handleChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Member Interactions
      </Typography>

      <Paper elevation={3} sx={{ mb: 3 }}>
        <Tabs
          value={tabIndex}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Counseling Sessions" />
          <Tab label="Prayer Requests" />
        </Tabs>
      </Paper>

      <TabPanel value={tabIndex} index={0}>
        <CounselingSessionManager memberId={memberId} />
      </TabPanel>

      <TabPanel value={tabIndex} index={1}>
        <PrayerRequestList memberId={memberId} />
      </TabPanel>
    </Container>
  );
};

export default MemberInteractionPage;
