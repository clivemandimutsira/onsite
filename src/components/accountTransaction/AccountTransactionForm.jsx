import React,{useState,useEffect} from 'react';
import {
  TextField, Button, Paper, Typography, MenuItem
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import {
  fetchTxn, createTxn, updateTxn
} from '../../api/accountTransactionService';

export default function AccountTransactionForm(){
  const {id}=useParams(); const nav=useNavigate(); const isEdit=Boolean(id);
  const [form,setForm]=useState({
    account_id:'', related_income_id:'', related_expense_id:'',
    type:'credit', amount:'', transaction_date:'', description:''
  });

  useEffect(()=>{
    if(isEdit){
      fetchTxn(id).then(d=>setForm({
        ...d,
        transaction_date:d.transaction_date.slice(0,10)
      }));
    }
  },[id,isEdit]);

  const onChange=e=>{
    const {name,value}=e.target;
    setForm(f=>({...f,[name]:value}));
  };

  const onSubmit=async e=>{
    e.preventDefault();
    if(isEdit) await updateTxn(id,form);
    else await createTxn(form);
    nav('/account-transactions');
  };

  return (
    <Paper sx={{p:3,maxWidth:600,mx:'auto'}}>
      <Typography variant="h6" gutterBottom>
        {isEdit?'Edit':'Add'} Transaction
      </Typography>
      <form onSubmit={onSubmit}>
        <TextField
          label="Account ID" name="account_id"
          value={form.account_id} onChange={onChange}
          fullWidth margin="normal" required
        />
        <TextField
          label="Type" name="type" select
          value={form.type} onChange={onChange}
          fullWidth margin="normal" required
        >
          {['credit','debit'].map(o=><MenuItem key={o} value={o}>{o}</MenuItem>)}
        </TextField>
        <TextField
          label="Amount" name="amount" type="number"
          value={form.amount} onChange={onChange}
          fullWidth margin="normal" required
        />
        <TextField
          label="Income Ref ID" name="related_income_id"
          value={form.related_income_id} onChange={onChange}
          fullWidth margin="normal"
        />
        <TextField
          label="Expense Ref ID" name="related_expense_id"
          value={form.related_expense_id} onChange={onChange}
          fullWidth margin="normal"
        />
        <TextField
          label="Date" name="transaction_date" type="date"
          value={form.transaction_date} onChange={onChange}
          fullWidth margin="normal" required
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Description" name="description"
          value={form.description} onChange={onChange}
          fullWidth margin="normal"
        />
        <Button type="submit" variant="contained" sx={{mt:2}}>
          {isEdit?'Update':'Create'}
        </Button>
      </form>
    </Paper>
  );
}
