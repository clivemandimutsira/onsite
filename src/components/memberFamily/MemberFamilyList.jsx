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
import { Trash, Plus, Pencil } from 'lucide-react';

import {
  getFamilyLinksByMemberId,
  deleteFamilyLink
} from '../../api/memberFamilyService';
import MemberFamilyForm from './MemberFamilyForm';
import { AuthContext } from '../../contexts/AuthContext';

const MemberFamilyList = ({ memberId, allMembers }) => {
  const [list, setList] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [editingLink, setEditingLink] = useState(null); // Editing state

  const { permissions } = useContext(AuthContext);

  // Permissions for Add, Edit, Delete actions
  const canAdd = permissions.includes('add_member_family') || permissions.includes('manage_member_family');
  const canDelete = permissions.includes('delete_member_family') || permissions.includes('manage_member_family');
  const canEdit = permissions.includes('edit_member_family') || permissions.includes('manage_member_family');

  // Log the permissions for debugging
  console.log('Permissions:', permissions);
  console.log('Can Edit:', canEdit);

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
      {/* Add Button for members who have permission to add */}
      {canAdd && (
        <Button
          startIcon={<Plus size={18} />}
          onClick={() => {
            setEditingLink(null); // Reset editing on add
            setOpenForm(true);
          }}
          sx={{ mb: 2 }}
        >
          Add Family Link
        </Button>
      )}

      {/* Display family links or show no data message */}
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
                {relative ? `${relative.first_name} ${relative.surname}` : 'Unknown'} — {rel.relationship}
              </Typography>

              {/* Buttons for Edit and Delete */}
              <Box display="flex" alignItems="center">
                {canEdit && (
                  <IconButton
                    onClick={() => {
                      setEditingLink(rel); // Set link for editing
                      setOpenForm(true);
                    }}
                    color="primary"
                    sx={{
                      visibility: 'visible', // Force visibility of the icon
                      display: 'inline-flex', // Ensure the button is displayed
                      height: '40px', // Ensure proper size
                      width: '40px', // Ensure proper size
                    }}
                  >
                    <Pencil size={18} />
                  </IconButton>
                )}
                {canDelete && (
                  <IconButton onClick={() => handleDelete(rel.id)} color="error">
                    <Trash size={18} />
                  </IconButton>
                )}
              </Box>
            </Box>
          );
        })
      )}

      {/* Dialog for adding or editing a family link */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingLink ? 'Edit Family Link' : 'Link a Family Member'}</DialogTitle>
        <DialogContent>
          <MemberFamilyForm
            memberId={memberId}
            allMembers={allMembers}
            existingLink={editingLink} // Pass link for editing
            onClose={() => {
              setOpenForm(false);
              setEditingLink(null);
              loadLinks();
            }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default MemberFamilyList;
