import React, { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';

import CounselingSessionList from '../../components/memberProfile/tabs/MemberCounselingList';
import PrayerRequestList from './tabs/MemberPrayerRequestList';
import MemberFamilyList from './tabs/MemberFamilyList';
import NextOfKinList from './tabs/NextOfKinList';
import MemberCellGroupList from './tabs/MemberCellGroupList';
import MemberMilestoneChecklist from './tabs/MemberMilestoneChecklist';
import MemberAttendanceList from './tabs/MemberAttendanceList';

const MemberTabs = ({ member }) => {
  const [tab, setTab] = useState(0);
  const handleChange = (_, newTab) => setTab(newTab);

  const tabs = [
    { label: 'Counseling',      component: <CounselingSessionList memberId={member.id} /> },
    { label: 'Prayer Requests', component: <PrayerRequestList    memberId={member.id} /> },
    { label: 'Family Links',    component: <MemberFamilyList      memberId={member.id} allMembers={[member]} /> },
    { label: 'Next of Kin',     component: <NextOfKinList         memberId={member.id} /> },
    { label: 'Cell Group',      component: <MemberCellGroupList   memberId={member.id} cellGroups={[]} /> },
    { label: 'Milestones',      component: <MemberMilestoneChecklist memberId={member.id} /> },
    { label: 'Attendance',      component: <MemberAttendanceList  memberId={member.id} /> },
    // Removed: { label: 'Events', component: <MemberEventList memberId={member.id} /> },
  ];

  return (
    <Box>
      <Tabs
        value={tab}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
      >
        {tabs.map((t, i) => <Tab key={i} label={t.label} />)}
      </Tabs>
      <Box sx={{ mt: 2 }}>
        {tabs[tab].component}
      </Box>
    </Box>
  );
};

export default MemberTabs;
