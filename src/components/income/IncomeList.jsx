// src/components/income/IncomeList.jsx
import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead,
  TableRow, Paper, Button, CircularProgress
} from '@mui/material';
import { fetchIncomes, deleteIncome } from '../../api/incomeService';

export default function IncomeList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const incomes = await fetchIncomes();
      // Expecting each income to include member_full_name
      setData(incomes);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this record?')) {
      await deleteIncome(id);
      load();
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Paper sx={{ p: 2 }}>
      <Button href="/income/new" variant="contained" sx={{ mb: 2 }}>
        Add Income
      </Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Member</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Method</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.transaction_date?.slice(0,10)}</TableCell>
              <TableCell>{row.member_full_name || row.member_id}</TableCell>
              <TableCell>{row.amount}</TableCell>
              <TableCell>{row.category}</TableCell>
              <TableCell>{row.method}</TableCell>
              <TableCell>
                <Button size="small" href={`/income/${row.id}/edit`}>Edit</Button>
                <Button size="small" color="error" onClick={() => handleDelete(row.id)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
