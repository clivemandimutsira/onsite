import React, { useEffect, useState, useContext } from 'react';
import {
  Typography,
  Box,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  useTheme,
} from '@mui/material';
import { Trash, Plus } from 'lucide-react';

import {
  getCellGroupMembershipsByMemberId,
  deleteMembership,
} from '../../../api/memberCellGroupService';
import MemberCellGroupForm from '../../../components/memberCellGroup/MemberCellGroupForm';
import { AuthContext } from '../../../contexts/AuthContext';

const MemberCellGroupList = ({ memberId, cellGroups }) => {
  const theme = useTheme(); // Access the current theme
  const [list, setList] = useState([]);
  const [openForm, setOpenForm] = useState(false);

  const { permissions } = useContext(AuthContext);

  // Permission checks for adding and deleting memberships
  const canAdd = permissions.includes('assign_cell_group') || permissions.includes('manage_cell_groups');
  const canDelete = permissions.includes('remove_cell_group') || permissions.includes('manage_cell_groups');

  const loadData = async () => {
    try {
      const data = await getCellGroupMembershipsByMemberId(memberId);
      setList(data);
    } catch (err) {
      console.error('Failed to load cell group memberships:', err);
    }
  };

  useEffect(() => {
    if (memberId) loadData();
  }, [memberId]);

  // Handle deleting a membership
  const handleDelete = async (id) => {
    if (window.confirm('Remove member from cell group?')) {
      await deleteMembership(id);
      loadData(); // Reload the data after deletion
    }
  };

  return (
    <Box>
      {/* Conditionally show the "Assign to Cell Group" button */}
      {canAdd && (
        <Button
          startIcon={<Plus size={18} />}
          onClick={() => setOpenForm(true)}
          sx={{
            mb: 2,
            backgroundColor: theme.palette.primary.main, // Use theme primary color
            color: theme.palette.primary.contrastText, // Use theme contrast text color
            '&:hover': {
              backgroundColor: theme.palette.primary.dark, // Use theme dark primary color on hover
            },
          }}
        >
          Assign to Cell Group
        </Button>
      )}

      {/* Display the list of cell group memberships */}
      {list.length === 0 ? (
        <Typography color={theme.palette.text.secondary}>
          No cell group assignments found.
        </Typography>
      ) : (
        list.map((item) => {
          return (
            <Box
              key={item.id}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: `1px solid ${theme.palette.divider}`, // Use theme divider color
                py: 1,
              }}
            >
              <Typography color={theme.palette.text.primary}>
                {item.cell_group_name || 'Unknown'} — {item.designation} — {item.date_joined}
              </Typography>
              {/* Conditionally show the delete button if the user has permission */}
              {canDelete && (
                <IconButton
                  onClick={() => handleDelete(item.id)}
                  sx={{
                    color: theme.palette.error.main, // Use theme error color
                    '&:hover': {
                      backgroundColor: theme.palette.error.light, // Use theme light error color on hover
                    },
                  }}
                >
                  <Trash size={18} />
                </IconButton>
              )}
            </Box>
          );
        })
      )}

      {/* Dialog to assign member to a cell group */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ backgroundColor: theme.palette.background.default, color: theme.palette.text.primary }}>
          Assign Cell Group
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: theme.palette.background.paper }}>
          <MemberCellGroupForm
            memberId={memberId}
            cellGroups={cellGroups}
            onClose={() => {
              setOpenForm(false);
              loadData();
            }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default MemberCellGroupList;
