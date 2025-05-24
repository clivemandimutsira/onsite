import React, {useEffect,useState} from 'react';
import {
  Table, TableBody, TableCell, TableHead,
  TableRow, Paper, Button, CircularProgress
} from '@mui/material';
import { fetchTxns, deleteTxn } from '../../api/accountTransactionService';

export default function AccountTransactionList() {
  const [data,setData] = useState([]);
  const [loading,setLoading] = useState(true);
  const load = async()=>{ setLoading(true); try{ setData(await fetchTxns()); }finally{ setLoading(false); } };
  useEffect(load, []);
  const handleDelete = async id=>{
    if(window.confirm('Delete this transaction?')){
      await deleteTxn(id);
      load();
    }
  };
  if(loading) return <CircularProgress />;
  return (
    <Paper sx={{p:2}}>
      <Button href="/account-transactions/new" variant="contained" sx={{mb:2}}>
        Add Transaction
      </Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Account ID</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Income Ref</TableCell>
            <TableCell>Expense Ref</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map(r=>(
            <TableRow key={r.id}>
              <TableCell>{r.transaction_date}</TableCell>
              <TableCell>{r.account_id}</TableCell>
              <TableCell>{r.type}</TableCell>
              <TableCell>{r.amount}</TableCell>
              <TableCell>{r.related_income_id}</TableCell>
              <TableCell>{r.related_expense_id}</TableCell>
              <TableCell>
                <Button size="small" href={`/account-transactions/${r.id}/edit`}>
                  Edit
                </Button>
                <Button size="small" color="error" onClick={()=>handleDelete(r.id)}>
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
