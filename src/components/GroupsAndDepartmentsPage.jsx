import React, { useState } from 'react';
import { Container, Tabs, Tab, Box } from '@mui/material';
import CellGroupPage from '../pages/CellGroupPage';
import DepartmentPage from '../pages/DepartmentPage';

const GroupsAndDepartmentsPage = () => {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (_, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ borderBottom: 0, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabIndex} onChange={handleTabChange}>
          <Tab label="Cell Groups" />
          <Tab label="Departments" />
        </Tabs>
      </Box>
      <Box>
        {tabIndex === 0 && <CellGroupPage />}
        {tabIndex === 1 && <DepartmentPage />}
      </Box>
    </Container>
  );
};

export default GroupsAndDepartmentsPage;
