import React, {useEffect,useState} from 'react';
import {
  Table, TableBody, TableCell, TableHead,
  TableRow, Paper, Button, CircularProgress
} from '@mui/material';
import { fetchBudgets, deleteBudget } from '../../api/budgetService';

export default function BudgetList(){
  const [data,setData]=useState([]);
  const [loading,setLoading]=useState(true);
  const load=async()=>{ setLoading(true); try{ setData(await fetchBudgets()); }finally{ setLoading(false);} };
  useEffect(load,[]);
  const handleDelete=async id=>{
    if(window.confirm('Delete this budget?')){
      await deleteBudget(id);
      load();
    }
  };
  if(loading) return <CircularProgress />;
  return (
    <Paper sx={{p:2}}>
      <Button href="/budgets/new" variant="contained" sx={{mb:2}}>
        Add Budget
      </Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Department</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Start</TableCell>
            <TableCell>End</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map(b=>(
            <TableRow key={b.id}>
              <TableCell>{b.department}</TableCell>
              <TableCell>{b.category}</TableCell>
              <TableCell>{b.period_start}</TableCell>
              <TableCell>{b.period_end}</TableCell>
              <TableCell>{b.amount}</TableCell>
              <TableCell>
                <Button size="small" href={`/budgets/${b.id}/edit`}>Edit</Button>
                <Button size="small" color="error" onClick={()=>handleDelete(b.id)}>
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
