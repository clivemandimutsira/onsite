import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Autocomplete,
  TextField,
  CircularProgress,
  Chip,
  Avatar,
  Stack,
  Tooltip,
  useTheme,
} from '@mui/material';
import { DeleteIcon } from '../common/ActionIcons';
import ConfirmDialog from '../common/ConfirmDialog';
import SnackbarAlert from '../common/SnackbarAlert';

import { fetchAssignments, assignBadge, unassignBadge } from '../../api/memberBadgeService';
import { fetchBadges } from '../../api/badgeService';
import DynamicIcon from './DynamicIcon';

// Helper to pick a color from a palette based on the badge label and theme
const getBadgeColor = (label, theme) => {
  const palette = [
    theme.palette.primary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.secondary.main,
    theme.palette.info.main,
    theme.palette.text.secondary,
  ];
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = label.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
};

export default function MemberBadgeManager({ memberId }) {
  const [allBadges, setAllBadges] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [loading, setLoading] = useState(true);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirm, setConfirm] = useState({ open: false, badgeId: null });

  const theme = useTheme();

  // Move load OUTSIDE useEffect so it can be called from anywhere
  const load = async () => {
    setLoading(true);
    try {
      const [badges, assigns] = await Promise.all([fetchBadges(), fetchAssignments()]);
      setAllBadges(badges);
      // Merge icon_name from badges into assignments
      const mergedAssignments = assigns
        .filter(a => a.member_id === memberId)
        .map(a => {
          const badge = badges.find(b => b.id === a.badge_id);
          return {
            ...a,
            icon_name: badge?.icon_name || 'Star', // or 'Medal', 'Trophy', etc.
          };
        });
      setAssignments(mergedAssignments);
    } catch (e) {
      console.error(e);
      setSnackbar({ open: true, message: 'Error loading badges', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [memberId]);

  const handleAssign = async () => {
    if (!selectedBadge) return;
    try {
      await assignBadge({ member_id: memberId, badge_id: selectedBadge.id });
      setSnackbar({ open: true, message: 'Badge assigned!', severity: 'success' });
      setSelectedBadge(null);
      load(); // Now this works!
    } catch (e) {
      console.error(e);
      setSnackbar({ open: true, message: 'Assign failed', severity: 'error' });
    }
  };

  const handleRemove = id => setConfirm({ open: true, badgeId: id });

  const confirmRemove = async () => {
    try {
      await unassignBadge(confirm.badgeId);
      setSnackbar({ open: true, message: 'Badge removed!', severity: 'success' });
      load(); // Now this works!
    } catch (e) {
      console.error(e);
      setSnackbar({ open: true, message: 'Remove failed', severity: 'error' });
    } finally {
      setConfirm({ open: false, badgeId: null });
    }
  };

  if (loading) return <Box textAlign="center"><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Badges</Typography>

      {/* Assign form */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Autocomplete
          options={allBadges}
          getOptionLabel={b => b.label}
          value={selectedBadge}
          onChange={(_, v) => setSelectedBadge(v)}
          sx={{ width: 300 }}
          renderInput={params => <TextField {...params} label="Select Badge" />}
        />
        <Button
          variant="contained"
          color="primary"
          disabled={!selectedBadge}
          onClick={handleAssign}
        >
          Assign
        </Button>
      </Box>

      {/* Assigned badges */}
      <Stack direction="row" spacing={1} flexWrap="wrap">
        {assignments.length === 0 ? (
          <Typography color="text.secondary">No badges assigned.</Typography>
        ) : (
          assignments.map(a => {
            const color = getBadgeColor(a.label, theme);
            return (
              <Chip
                key={a.id}
                avatar={
                  <Tooltip title={a.icon_name || 'Award'}>
                    <Avatar sx={{
                      bgcolor: color,
                      width: 24,
                      height: 24,
                      color: theme.palette.getContrastText(color),
                    }}>
                      <DynamicIcon iconName={a.icon_name || 'Star'} size={16} color={theme.palette.getContrastText(color)} />
                    </Avatar>
                  </Tooltip>
                }
                label={a.label}
                onDelete={() => handleRemove(a.id)}
                deleteIcon={<DeleteIcon />}
                variant="outlined"
                sx={{
                  mb: 1,
                  borderColor: color,
                  color: color,
                  backgroundColor: 'transparent',
                  fontWeight: 500,
                }}
              />
            );
          })
        )}
      </Stack>

      {/* Confirm dialog & snackbar */}
      <ConfirmDialog
        open={confirm.open}
        title="Remove Badge?"
        content="Are you sure you want to remove this badge?"
        onClose={() => setConfirm({ ...confirm, open: false })}
        onConfirm={confirmRemove}
      />
      <SnackbarAlert
        open={snackbar.open}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Box>
  );
}
