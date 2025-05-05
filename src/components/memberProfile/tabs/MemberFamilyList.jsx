import React, { useEffect, useState, useContext } from 'react';
import {
  Typography,
  Box,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent
} from '@mui/material';
import { Trash, Plus } from 'lucide-react';

import {
  getFamilyLinksByMemberId,
  deleteFamilyLink
} from '../../../api/memberFamilyService';
import MemberFamilyForm from '../../../components/memberFamily/MemberFamilyForm';
import { AuthContext } from '../../../contexts/AuthContext'; // ✅ Import the context

const MemberFamilyList = ({ memberId, allMembers }) => {
  const [list, setList] = useState([]);
  const [openForm, setOpenForm] = useState(false);

  const { permissions } = useContext(AuthContext); // ✅ Access permissions

  // ✅ Check individual permissions
  const canAdd = permissions.includes('add_member_family') || permissions.includes('manage_member_family');
  const canDelete = permissions.includes('delete_member_family') || permissions.includes('manage_member_family');

  const loadLinks = async () => {
    try {
      const data = await getFamilyLinksByMemberId(memberId);
      setList(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (memberId) loadLinks();
  }, [memberId]);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this family link?')) {
      await deleteFamilyLink(id);
      loadLinks();
    }
  };

  return (
    <Box>
      {/* ✅ Show only if permission granted */}
      {canAdd && (
        <Button startIcon={<Plus size={18} />} onClick={() => setOpenForm(true)} sx={{ mb: 2 }}>
          Add Family Link
        </Button>
      )}

      {list.length === 0 ? (
        <Typography>No family links yet.</Typography>
      ) : (
        list.map((rel) => {
          const relative = allMembers.find(m => m.id === rel.relative_id);
          return (
            <Box
              key={rel.id}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #ddd',
                py: 1
              }}
            >
              <Typography>
  {rel.relative_first_name && rel.relative_surname
    ? `${rel.relative_first_name} ${rel.relative_surname}`
    : 'Unknown'} — {rel.relationship}
</Typography>

              {/* ✅ Show only if permission granted */}
              {canDelete && (
                <IconButton onClick={() => handleDelete(rel.id)} color="error">
                  <Trash size={18} />
                </IconButton>
              )}
            </Box>
          );
        })
      )}

      <Dialog open={openForm} onClose={() => setOpenForm(false)} fullWidth maxWidth="sm">
        <DialogTitle>Link a Family Member</DialogTitle>
        <DialogContent>
          <MemberFamilyForm
            memberId={memberId}
            allMembers={allMembers}
            onClose={() => {
              setOpenForm(false);
              loadLinks();
            }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default MemberFamilyList;
