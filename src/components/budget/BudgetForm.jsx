import React,{useState,useEffect} from 'react';
import {
  TextField, Button, Paper, Typography
} from '@mui/material';
import { useNavigate,useParams } from 'react-router-dom';
import {
  fetchBudget, createBudget, updateBudget
} from '../../api/budgetService';

export default function BudgetForm(){
  const {id}=useParams(); const nav=useNavigate(); const isEdit=Boolean(id);
  const [form,setForm]=useState({
    department:'', category:'', period_start:'', period_end:'', amount:''
  });

  useEffect(()=>{
    if(isEdit){
      fetchBudget(id).then(d=>setForm({
        ...d,
        period_start:d.period_start.slice(0,10),
        period_end:d.period_end.slice(0,10)
      }));
    }
  },[id,isEdit]);

  const onChange=e=>{
    const{name,value}=e.target;
    setForm(f=>({...f,[name]:value}));
  };

  const onSubmit=async e=>{
    e.preventDefault();
    if(isEdit) await updateBudget(id,form);
    else await createBudget(form);
    nav('/budgets');
  };

  return (
    <Paper sx={{p:3,maxWidth:600,mx:'auto'}}>
      <Typography variant="h6" gutterBottom>
        {isEdit?'Edit Budget':'Add Budget'}
      </Typography>
      <form onSubmit={onSubmit}>
        <TextField
          label="Department" name="department"
          value={form.department} onChange={onChange}
          fullWidth margin="normal" required
        />
        <TextField
          label="Category" name="category"
          value={form.category} onChange={onChange}
          fullWidth margin="normal"
        />
        <TextField
          label="Start Date" name="period_start" type="date"
          value={form.period_start} onChange={onChange}
          fullWidth margin="normal" required
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="End Date" name="period_end" type="date"
          value={form.period_end} onChange={onChange}
          fullWidth margin="normal" required
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Amount" name="amount" type="number"
          value={form.amount} onChange={onChange}
          fullWidth margin="normal" required
        />
        <Button type="submit" variant="contained" sx={{mt:2}}>
          {isEdit?'Update':'Create'}
        </Button>
      </form>
    </Paper>
  );
}
