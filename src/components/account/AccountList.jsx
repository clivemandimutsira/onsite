import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead,
  TableRow, Paper, Button, CircularProgress
} from '@mui/material';
import { fetchAccounts, deleteAccount } from '../../api/accountService';

export default function AccountList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { setData(await fetchAccounts()); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this account?')) {
      await deleteAccount(id);
      load();
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Paper sx={{ p: 2 }}>
      <Button href="/accounts/new" variant="contained" sx={{ mb: 2 }}>
        Add Account
      </Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Bank</TableCell>
            <TableCell>Account #</TableCell>
            <TableCell>Balance</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map(a => (
            <TableRow key={a.id}>
              <TableCell>{a.name}</TableCell>
              <TableCell>{a.type}</TableCell>
              <TableCell>{a.bank_name}</TableCell>
              <TableCell>{a.account_number}</TableCell>
              <TableCell>{a.balance}</TableCell>
              <TableCell>
                <Button size="small" href={`/accounts/${a.id}/edit`}>Edit</Button>
                <Button size="small" color="error" onClick={() => handleDelete(a.id)}>
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
