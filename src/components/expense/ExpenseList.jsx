import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead,
  TableRow, Paper, Button, CircularProgress
} from '@mui/material';
import { fetchExpenses, deleteExpense } from '../../api/expenseService';

export default function ExpenseList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { setData(await fetchExpenses()); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this record?')) {
      await deleteExpense(id);
      load();
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Paper sx={{ p: 2 }}>
      <Button href="/expenses/new" variant="contained" sx={{ mb: 2 }}>
        Add Expense
      </Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Member ID</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Department</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Method</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map(r => (
            <TableRow key={r.id}>
              <TableCell>{r.transaction_date}</TableCell>
              <TableCell>{r.member_id}</TableCell>
              <TableCell>{r.amount}</TableCell>
              <TableCell>{r.department}</TableCell>
              <TableCell>{r.category}</TableCell>
              <TableCell>{r.payment_method}</TableCell>
              <TableCell>
                <Button size="small" href={`/expenses/${r.id}/edit`}>Edit</Button>
                <Button size="small" color="error" onClick={() => handleDelete(r.id)}>
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
