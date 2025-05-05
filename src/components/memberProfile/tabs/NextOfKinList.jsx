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
  getNextOfKinByMemberId,
  deleteNextOfKin
} from '../../../api/nextOfKinService';
import NextOfKinForm from '../../../components/nextOfKin/NextOfKinForm';
import { AuthContext } from '../../../contexts/AuthContext';

const NextOfKinList = ({ memberId }) => {
  const [list, setList] = useState([]);
  const [editing, setEditing] = useState(null);
  const [openForm, setOpenForm] = useState(false);

  const { permissions } = useContext(AuthContext);

  // Check if the user has permission to add, edit, or delete next of kin
  const canAdd = permissions.includes('add_next_of_kin') || permissions.includes('manage_next_of_kin');
  const canEdit = permissions.includes('edit_next_of_kin') || permissions.includes('manage_next_of_kin');
  const canDelete = permissions.includes('delete_next_of_kin') || permissions.includes('manage_next_of_kin');

  const loadNextOfKin = async () => {
    try {
      const data = await getNextOfKinByMemberId(memberId);
      setList(data);
    } catch (error) {
      console.error('Failed to load Next of Kin:', error);
    }
  };

  useEffect(() => {
    if (memberId) loadNextOfKin();
  }, [memberId]);

  const handleEdit = (kin) => {
    setEditing(kin);
    setOpenForm(true);
  };

  const handleAdd = () => {
    setEditing(null);
    setOpenForm(true);
  };

  const handleFormClose = () => {
    setOpenForm(false);
    loadNextOfKin();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this next of kin?')) return;
    await deleteNextOfKin(id);
    loadNextOfKin();
  };

  return (
    <Box>
      {/* Only show "Add Next of Kin" button if user has permission */}
      {canAdd && (
        <Button startIcon={<Plus size={18} />} onClick={handleAdd} sx={{ mb: 2 }}>
          Add Next of Kin
        </Button>
      )}

      {list.length === 0 ? (
        <Typography>No next of kin records found.</Typography>
      ) : (
        list.map((kin) => (
          <Box
            key={kin.id}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #ddd',
              py: 1
            }}
          >
            <Typography>
              <strong>{kin.name}</strong> — {kin.relationship} — {kin.contact}
            </Typography>
            <Box>
              {/* Only show Edit and Delete buttons if user has permission */}
              {canEdit && (
                <IconButton onClick={() => handleEdit(kin)}>
                  <Pencil size={18} />
                </IconButton>
              )}
              {canDelete && (
                <IconButton onClick={() => handleDelete(kin.id)} color="error">
                  <Trash size={18} />
                </IconButton>
              )}
            </Box>
          </Box>
        ))
      )}

      <Dialog open={openForm} onClose={() => setOpenForm(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Edit' : 'Add'} Next of Kin</DialogTitle>
        <DialogContent>
          <NextOfKinForm
            memberId={memberId}
            initialData={editing}
            onClose={handleFormClose}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default NextOfKinList;
