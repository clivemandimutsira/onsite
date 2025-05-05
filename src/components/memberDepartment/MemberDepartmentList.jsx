// src/components/memberDepartment/MemberDepartmentList.jsx

import React, { useEffect, useState } from 'react';
import {
  Typography, Box, IconButton, Button, Dialog, DialogTitle, DialogContent
} from '@mui/material';
import { Trash, Plus } from 'lucide-react';
import {
  getMembershipsByMemberId,
  createMembership,
  deleteMembership
} from '../../services/memberDepartmentService';
import MemberDepartmentForm from './MemberDepartmentForm';

const MemberDepartmentList = ({ memberId, departments }) => {
  const [list, setList] = useState([]);
  const [openForm, setOpenForm] = useState(false);

  const load = async () => {
    try {
      const data = await getMembershipsByMemberId(memberId);
      setList(data);
    } catch (err) {
      console.error('Failed to load department memberships:', err);
    }
  };

  useEffect(() => {
    if (memberId) load();
  }, [memberId]);

  const handleDelete = async (id) => {
    if (window.confirm('Remove from department?')) {
      await deleteMembership(id);
      load();
    }
  };

  const handleAssign = async (data) => {
    await createMembership(data);
    load();
  };

  return (
    <Box>
      <Button startIcon={<Plus />} onClick={() => setOpenForm(true)} sx={{ mb: 2 }}>
        Assign to Department
      </Button>

      {list.length === 0 ? (
        <Typography>No department assignments found.</Typography>
      ) : (
        list.map((item) => {
          const dept = departments.find((d) => d.id === item.department_id);
          return (
            <Box
              key={item.id}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                borderBottom: '1px solid #ccc',
                py: 1
              }}
            >
              <Typography>
                {dept?.name || 'Unknown'} — {item.role} — {item.date_joined}
              </Typography>
              <IconButton onClick={() => handleDelete(item.id)} color="error">
                <Trash size={18} />
              </IconButton>
            </Box>
          );
        })
      )}

      <Dialog open={openForm} onClose={() => setOpenForm(false)} fullWidth maxWidth="sm">
        <DialogTitle>Assign Department</DialogTitle>
        <DialogContent>
          <MemberDepartmentForm
            memberId={memberId}
            departments={departments}
            onClose={() => setOpenForm(false)}
            onSaved={handleAssign}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default MemberDepartmentList;
