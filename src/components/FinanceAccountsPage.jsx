// src/pages/FinanceAccountsPage.jsx

import React, { useState } from 'react';
import { Container, Tabs, Tab, Box } from '@mui/material';
import AccountsListPage from '../pages/AccountPage';
import AccountTransactionsPage from '../pages/AccountTransactionPage';
import ExpenseManagerPage from '../pages/ExpensePage';
import BudgetManagerPage from '../pages/BudgetPage';
import IncomeManagerPage from '../pages/IncomePage';
import DonationPage from '../pages/DonationPage';

const FinanceAccountsPage = () => {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (_, newIndex) => {
    setTabIndex(newIndex);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ borderBottom: 0, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabIndex} onChange={handleTabChange}>
          <Tab label="Accounts" />
          <Tab label="Expenses" />
          <Tab label="Transactions" />
          <Tab label="Budgets" />
          <Tab label="Income" />
          <Tab label="Giving" />
        </Tabs>
      </Box>

      <Box>
       {tabIndex === 0 && <AccountsListPage />}
       {tabIndex === 1 && <ExpenseManagerPage />}
       {tabIndex === 2 && <AccountTransactionsPage />}
       {tabIndex === 3 && <BudgetManagerPage />}
       {tabIndex === 4 && <IncomeManagerPage />}
       {tabIndex === 5 && <DonationPage />}
      </Box>
    </Container>
  );
};

export default FinanceAccountsPage;
