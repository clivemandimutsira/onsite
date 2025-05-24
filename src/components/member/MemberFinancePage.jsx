// src/components/member/MemberFinancePage.jsx
import React from 'react';
import { Box } from '@mui/material';
import SummaryCards from './SummaryCards';
import GivingHeatmap from './GivingHeatmap';
import Badges from './Badges';
import PledgeProgressList from './MemberPledgeList';
import MemberContributionList from './MemberContributionList';

export default function MemberFinancePage({ memberId }) {
  return (
    <Box sx={{ p: 3 }}>
      <SummaryCards memberId={memberId} />
      <GivingHeatmap memberId={memberId} />
      <Badges memberId={memberId} />
      <PledgeProgressList memberId={memberId} />
      <MemberContributionList memberId={memberId} />
    </Box>
  );
}
