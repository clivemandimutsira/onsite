import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Table, TableHead, TableBody,
  TableRow, TableCell
} from '@mui/material';
import CounselingForm from '../counseling/CounselingSessionListWithForm';
import {
  getAllCounselingSessions,
  deleteCounselingSession,
} from '../../api/counselingService';


export default function CounselingList() {
  const [sessions, setSessions] = useState([]);
  const [editing, setEditing] = useState(null);
  const [openForm, setOpenForm] = useState(false);

  const fetchAll = async () => {
    try {
      const data = await getAllCounselingSessions();
      setSessions(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(fetchAll, []);

  const handleDelete = async (id) => {
    try {
      await deleteCounselingSession(id);
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h6">All Counseling Sessions</Typography>
        <Button variant="contained" onClick={() => { setEditing(null); setOpenForm(true); }}>
          New Session
        </Button>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell><TableCell>Time</TableCell>
            <TableCell>Counselor</TableCell><TableCell>Member</TableCell>
            <TableCell>Mode</TableCell><TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sessions.map(s => (
            <TableRow key={s.id}>
              <TableCell>{s.date}</TableCell>
              <TableCell>{s.time}</TableCell>
              <TableCell>{s.counselor_name}</TableCell>
              <TableCell>{s.member_name || '—'}</TableCell>
              <TableCell>{s.mode}</TableCell>
              <TableCell>{s.status}</TableCell>
              <TableCell>
                <Button onClick={() => { setEditing(s); setOpenForm(true); }}>Edit</Button>
                <Button onClick={() => handleDelete(s.id)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <CounselingForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        initialData={editing}
        onSaved={fetchAll}
      />
    </Box>
);
}
