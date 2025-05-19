// src/components/member/MemberDetailPanel.jsx

import React, { useState, useContext } from 'react';
import {
  Box,
  Avatar,
  Typography,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Users,
  Link as LinkIcon,
  Crown,
  Star,
  MessageCircle,
} from 'lucide-react';
import {
  EditIcon,
  DeleteIcon,
} from '../../components/common/ActionIcons';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { AuthContext } from '../../contexts/AuthContext';
import MemberBadgeManager from '../member/MemberBadgeManager';

export default function MemberDetailPanel({
  member,
  onEdit,
  onDelete,
  onNextOfKin,
  onFamily,
  onCellGroup,
  onMilestones,
  onNotify,
}) {
  const [isDialogOpen, setDialogOpen] = useState(false);

  // Retrieve permissions from AuthContext
  const { permissions } = useContext(AuthContext);
  const canEdit = permissions.includes('edit_members') || permissions.includes('manage_members');
  const canDelete = permissions.includes('delete_members') || permissions.includes('manage_members');

  const handleDeleteClick = () => setDialogOpen(true);
  const handleDialogClose = () => setDialogOpen(false);
  const handleConfirmDelete = () => {
    setDialogOpen(false);
    onDelete();
  };

  // Helper to show date or fallback
  const showDate = (date) => {
    if (!date) return 'Not Available';
    const d = new Date(date);
    return isNaN(d.getTime()) ? 'Not Available' : d.toLocaleDateString();
  };

  return (
    <Box sx={{ p: 2, borderRadius: 2 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
          pb: 1,
          borderBottom: '1px solid #eee',
        }}
      >
        <Typography variant="h5">Member Details</Typography>
        <Box>
          {canEdit && (
            <EditIcon
              onClick={onEdit}
              sx={{
                cursor: 'pointer',
                color: 'blue',
                '&:hover': { color: 'darkblue' },
                mr: 1,
              }}
            />
          )}
          {canDelete && (
            <DeleteIcon
              onClick={handleDeleteClick}
              sx={{
                cursor: 'pointer',
                color: 'red',
                '&:hover': { color: 'darkred' },
              }}
            />
          )}
        </Box>
      </Box>

      {/* Avatar and Name */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar
          src={member.profile_picture_url}
          sx={{ width: 64, height: 64, mr: 2 }}
        >
          {member.first_name?.[0]}{member.surname?.[0]}
        </Avatar>
        <Box>
          <Typography variant="h6">
            {member.first_name} {member.surname}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            {/* Member Type Chip */}
            <Chip
              label={member.member_type?.replace('_', ' ') || 'N/A'}
              size="small"
              variant="outlined"
              sx={{
                borderColor:
                  member.member_type === 'member'
                    ? 'green'
                    : member.member_type === 'first_timer'
                    ? 'orange'
                    : member.member_type === 'new_convert'
                    ? 'purple'
                    : 'gray',
                color:
                  member.member_type === 'member'
                    ? 'green'
                    : member.member_type === 'first_timer'
                    ? 'orange'
                    : member.member_type === 'new_convert'
                    ? 'purple'
                    : 'gray',
              }}
            />
            {/* Status Chip */}
            <Chip
              label={member.status || 'N/A'}
              size="small"
              variant="outlined"
              sx={{
                borderColor:
                  member.status === 'active'
                    ? 'green'
                    : member.status === 'inactive'
                    ? 'red'
                    : 'gray',
                color:
                  member.status === 'active'
                    ? 'green'
                    : member.status === 'inactive'
                    ? 'red'
                    : 'gray',
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Details */}
      <Stack spacing={2} mb={2}>
        <Box>
          <Typography variant="subtitle2" fontWeight="bold">Email</Typography>
          <Typography>{member.email || 'N/A'}</Typography>
        </Box>
        <Box>
          <Typography variant="subtitle2" fontWeight="bold">Phone</Typography>
          <Typography>{member.contact_primary || 'N/A'}</Typography>
        </Box>
        <Box>
          <Typography variant="subtitle2" fontWeight="bold">Address</Typography>
          <Typography>{member.physical_address || 'N/A'}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="subtitle2" fontWeight="bold">Joined</Typography>
            <Typography>
              {showDate(member.date_joined_church)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight="bold">Born Again</Typography>
            <Typography>
              {showDate(member.date_born_again)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight="bold">DOB</Typography>
            <Typography>
              {showDate(member.date_of_birth)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight="bold">Gender</Typography>
            <Typography>{member.gender || 'N/A'}</Typography>
          </Box>
        </Box>
      </Stack>

      {/* Action Icons Row */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'flex-end', // move icons lower
          mt: 3,
          px: 2,
          pb: 1,
          borderTop: theme => `1px solid ${theme.palette.divider}`,
          // backgroundColor: theme => theme.palette.background.paper, // optional for dark mode
        }}
      >
        <Tooltip title="Next of Kin">
          <IconButton
            onClick={onNextOfKin}
            sx={{
              mt: 1, // move icon a bit lower
              color: theme => theme.palette.text.primary,
            }}
          >
            <Users size={20} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Family Links">
          <IconButton
            onClick={onFamily}
            sx={{
              mt: 1,
              color: theme => theme.palette.text.primary,
            }}
          >
            <LinkIcon size={20} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Cell Group">
          <IconButton
            onClick={onCellGroup}
            sx={{
              mt: 1,
              color: theme => theme.palette.text.primary,
            }}
          >
            <Crown size={20} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Milestones">
          <IconButton
            onClick={onMilestones}
            sx={{
              mt: 1,
              color: theme => theme.palette.text.primary,
            }}
          >
            <Star size={20} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Notify">
          <IconButton
            onClick={onNotify}
            sx={{
              mt: 1,
              color: theme => theme.palette.text.primary,
            }}
          >
            <MessageCircle size={20} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Divider */}
      <Divider sx={{ my: 3 }} />

      {/* Member Badge Manager */}
      <MemberBadgeManager memberId={member.id} />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={isDialogOpen}
        title="Confirm Delete"
        content="Are you sure you want to delete this member?"
        onClose={handleDialogClose}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
}
