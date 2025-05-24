// src/pages/FinanceSettingsPage.jsx

import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Tabs, Tab, Box, Button
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { EditIcon, DeleteIcon } from '../components/common/ActionIcons';
import LookupFormDialog      from '../components/settings/LookupFormDialog';
import CurrencyFormDialog    from '../components/settings/CurrencyFormDialog';
import BankFormDialog        from '../components/settings/BankFormDialog';
import PaymentMethodFormDialog from '../components/settings/PaymentMethodFormDialog';
import IncomeCategoryFormDialog from '../components/settings/IncomeCategoryFormDialog';
import ConfirmDialog         from '../components/common/ConfirmDialog';
import SnackbarAlert         from '../components/common/SnackbarAlert';

import {
  fetchAccountTypes, createAccountType,
  updateAccountType, deleteAccountType
} from '../api/accountTypeService';

import {
  fetchIncomeCategories, createIncomeCategory,
  updateIncomeCategory, deleteIncomeCategory
} from '../api/incomeCategoryService';

import {
  fetchExpensesCategories, createExpenseCategory,
  updateExpenseCategory, deleteExpenseCategory
} from '../api/expenseCategoryService';

import {
  fetchPaymentMethods, createPaymentMethod,
  updatePaymentMethod, deletePaymentMethod
} from '../api/paymentMethodService';

import {
  fetchCurrencies, createCurrency,
  updateCurrency, deleteCurrency
} from '../api/currencyService';

import {
  fetchBanks, createBank,
  updateBank, deleteBank
} from '../api/bankService';

import {
  fetchTransactionTypes, createTransactionType,
  updateTransactionType, deleteTransactionType
} from '../api/accountTransactionTypeService';

export default function FinanceSettingsPage() {
  const tabs = [
    'Account Types',
    'Income Categories',         // newly added
    'Expense Categories',
    'Payment Methods',
    'Currencies',
    'Banks',
    'Transaction Types'
  ];

  const [tabIdx, setTabIdx]     = useState(0);
  const [rows,   setRows]       = useState([]);
  const [loading,setLoading]    = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [confirm,  setConfirm]  = useState({ open:false, id:null });
  const [snack,    setSnack]    = useState({ open:false, message:'', severity:'success' });

  const services = [
    {
      get:     fetchAccountTypes,
      create:  createAccountType,
      update:  updateAccountType,
      del:     deleteAccountType,
      title:   'Account Type'
    },
    {
      get:     fetchIncomeCategories,
      create:  createIncomeCategory,
      update:  updateIncomeCategory,
      del:     deleteIncomeCategory,
      title:   'Income Category'
    },
    {
      get:     fetchExpensesCategories,
      create:  createExpenseCategory,
      update:  updateExpenseCategory,
      del:     deleteExpenseCategory,
      title:   'Expense Category'
    },
    {
      get:     fetchPaymentMethods,
      create:  createPaymentMethod,
      update:  updatePaymentMethod,
      del:     deletePaymentMethod,
      title:   'Payment Method'
    },
    {
      get:     fetchCurrencies,
      create:  createCurrency,
      update:  updateCurrency,
      del:     deleteCurrency,
      title:   'Currency'
    },
    {
      get:     fetchBanks,
      create:  createBank,
      update:  updateBank,
      del:     deleteBank,
      title:   'Bank'
    },
    {
      get:     fetchTransactionTypes,
      create:  createTransactionType,
      update:  updateTransactionType,
      del:     deleteTransactionType,
      title:   'Transaction Type'
    }
  ];

  // Load data for current tab
  const load = async () => {
    setLoading(true);
    try {
      const data = await services[tabIdx].get();
      setRows(data);
    } catch {
      setSnack({ open:true, message:'Load failed', severity:'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setEditing(null);
    load();
  }, [tabIdx]);

  const handleSubmit = async (payload) => {
    try {
      if (editing) await services[tabIdx].update(editing.id, payload);
      else         await services[tabIdx].create(payload);
      setSnack({ open:true, message:'Saved successfully', severity:'success' });
      setOpenForm(false);
      load();
    } catch {
      setSnack({ open:true, message:'Save failed', severity:'error' });
    }
  };

  const handleDelete = async () => {
    try {
      await services[tabIdx].del(confirm.id);
      setSnack({ open:true, message:'Deleted successfully', severity:'success' });
      load();
    } catch {
      setSnack({ open:true, message:'Delete failed', severity:'error' });
    } finally {
      setConfirm({ open:false, id:null });
    }
  };

  // Columns vary by tab
  let columns;
  switch (tabIdx) {
    case 1: // Income Categories
      columns = [
        { field:'name', headerName:'Category Name', flex:1 }
      ];
      break;
    case 4: // Currencies
      columns = [
        { field:'code',   headerName:'Code',   flex:0.5 },
        { field:'name',   headerName:'Name',   flex:1 },
        { field:'symbol', headerName:'Symbol', flex:0.5 }
      ];
      break;
    case 5: // Banks
      columns = [
        { field:'name',       headerName:'Name',       flex:1 },
        { field:'swift_code', headerName:'SWIFT Code', flex:1 }
      ];
      break;
    default:
      columns = [
        { field:'name', headerName:'Name', flex:1 }
      ];
  }
  // Add actions column
  columns.push({
    field:'actions',
    headerName:'Actions',
    flex:1,
    renderCell: ({ row }) => (
      <Box sx={{ display:'flex', gap:1 }}>
        <EditIcon onClick={() => { setEditing(row); setOpenForm(true); }} sx={{ cursor: 'pointer' }} />
        <DeleteIcon onClick={() => setConfirm({ open:true, id:row.id })} sx={{ cursor: 'pointer' }} />
      </Box>
    )
  });

  return (
    <Container maxWidth="md" sx={{ mt:4 }}>
      
      <Tabs
        value={tabIdx}
        onChange={(_, v) => setTabIdx(v)}
        sx={{ mb:2 }}
      >
        {tabs.map((label,i) => <Tab key={i} label={label} />)}
      </Tabs>

      <Box sx={{ display:'flex', justifyContent:'flex-end', mb:1 }}>
        <Button onClick={() => { setEditing(null); setOpenForm(true); }}>
          Add {services[tabIdx].title}
        </Button>
      </Box>

      <Box sx={{ height:400 }}>
        <DataGrid
          loading={loading}
          rows={rows}
          columns={columns}
          getRowId={r => r.id}
          pageSize={10}
        />
      </Box>

      {/* Dialogs */}
      {tabIdx === 1 ? (
        <IncomeCategoryFormDialog
          open={openForm}
          initialValues={editing}
          onClose={() => setOpenForm(false)}
          onSubmit={handleSubmit}
        />
      ) : tabIdx === 4 ? (
        <CurrencyFormDialog
          open={openForm}
          initialValues={editing}
          onClose={() => setOpenForm(false)}
          onSubmit={handleSubmit}
        />
      ) : tabIdx === 5 ? (
        <BankFormDialog
          open={openForm}
          initialValues={editing}
          onClose={() => setOpenForm(false)}
          onSubmit={handleSubmit}
        />
      ) : tabIdx === 3 ? (
        <PaymentMethodFormDialog
          open={openForm}
          initialValues={editing}
          onClose={() => setOpenForm(false)}
          onSubmit={handleSubmit}
        />
      ) : (
        <LookupFormDialog
          open={openForm}
          title={services[tabIdx].title}
          initialValues={editing}
          onClose={() => setOpenForm(false)}
          onSubmit={handleSubmit}
        />
      )}

      <ConfirmDialog
        open={confirm.open}
        title="Confirm Deletion"
        description={`Delete this ${services[tabIdx].title}?`}
        onClose={() => setConfirm({ open:false, id:null })}
        onConfirm={handleDelete}
      />

      <SnackbarAlert
        open={snack.open}
        severity={snack.severity}
        message={snack.message}
        onClose={() => setSnack(s => ({ ...s, open:false }))}
      />
    </Container>
  );
}
