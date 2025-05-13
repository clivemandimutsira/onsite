import React, { useEffect, useState, useContext } from 'react';
import {
  Typography,
  Box,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
} from '@mui/material';
import { Trash, Plus } from 'lucide-react';

import {
  getFamilyLinksByMemberId,
  deleteFamilyLink,
} from '../../../api/memberFamilyService';
import { getAllMembers } from '../../../api/memberService'; // ✅ Assuming this exists

import MemberFamilyForm from '../../../components/memberFamily/MemberFamilyForm';
import { AuthContext } from '../../../contexts/AuthContext';

const MemberFamilyList = ({ memberId }) => {
  const [list, setList] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allMembers, setAllMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(true);

  const { permissions } = useContext(AuthContext);

  const canAdd =
    permissions.includes('add_member_family') || permissions.includes('manage_member_family');
  const canDelete =
    permissions.includes('delete_member_family') || permissions.includes('manage_member_family');

  const loadLinks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getFamilyLinksByMemberId(memberId);
      setList(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load family links');
    } finally {
      setLoading(false);
    }
  };

  const loadAllMembers = async () => {
    setMembersLoading(true);
    try {
      const data = await getAllMembers();
      setAllMembers(data);
    } catch (err) {
      console.error('Failed to load all members', err);
      setError('Failed to load members for family link.');
    } finally {
      setMembersLoading(false);
    }
  };

  useEffect(() => {
    if (memberId) {
      loadLinks();
      loadAllMembers();
    }
  }, [memberId]);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this family link?')) {
      try {
        await deleteFamilyLink(id);
        loadLinks();
      } catch (err) {
        console.error('Error deleting family link:', err);
        setError('Failed to delete family link.');
      }
    }
  };

  return (
    <Box>
      {/* Add button */}
      {canAdd && (
        <Button
          startIcon={<Plus size={18} />}
          onClick={() => setOpenForm(true)}
          sx={{ mb: 2 }}
        >
          Add Family Link
        </Button>
      )}

      {/* Loading state for links */}
      {loading ? (
        <Box textAlign="center" mt={4}>
          <Typography>Loading family links...</Typography>
        </Box>
      ) : (
        <>
          {error && (
            <Box textAlign="center" mt={2}>
              <Typography color="error">{error}</Typography>
            </Box>
          )}

          {list.length === 0 ? (
            <Typography>No family links yet.</Typography>
          ) : (
            list.map((rel) => {
              const relative = allMembers.find((m) => m.id === rel.relative_id);
              return (
                <Box
                  key={rel.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid #ddd',
                    py: 1,
                  }}
                >
                  <Typography>
                    {relative
                      ? `${relative.first_name} ${relative.surname}`
                      : 'Unknown'}{' '}
                    — {rel.relationship}
                  </Typography>

                  {canDelete && (
                    <IconButton
                      onClick={() => handleDelete(rel.id)}
                      color="error"
                    >
                      <Trash size={18} />
                    </IconButton>
                  )}
                </Box>
              );
            })
          )}
        </>
      )}

      {/* Family Form Dialog */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} fullWidth maxWidth="sm">
        <DialogTitle>Link a Family Member</DialogTitle>
        <DialogContent>
          {membersLoading ? (
            <Box textAlign="center" py={3}>
              <CircularProgress />
            </Box>
          ) : (
            <MemberFamilyForm
              memberId={memberId}
              allMembers={allMembers}
              onClose={() => {
                setOpenForm(false);
                loadLinks();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default MemberFamilyList;
