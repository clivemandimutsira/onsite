import { useEffect, useState, useCallback, useContext } from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  LinearProgress,
  useTheme,
} from '@mui/material';
import { Plus } from 'lucide-react';
import { DeleteIcon } from '../../../components/common/ActionIcons'; // Use ActionIcons
import {
  getMilestonesByMember,
  deleteMilestone,
  assignMilestone as addMilestone,
} from '../../../api/milestoneRecords';
import { getMilestoneTemplates } from '../../../api/milestoneTemplates';
import { AuthContext } from '../../../contexts/AuthContext';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import SnackbarAlert from '../../../components/common/SnackbarAlert';

export default function MemberMilestoneChecklist({ memberId, onAddClick, refresh }) {
  const theme = useTheme(); // Access the current theme
  const [records, setRecords] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, onConfirm: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const { permissions } = useContext(AuthContext);

  const canAddMilestone = permissions.includes('add_milestone') || permissions.includes('manage_milestone');
  const canDeleteMilestone = permissions.includes('delete_milestone') || permissions.includes('manage_milestone');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [r, t] = await Promise.all([
        getMilestonesByMember(memberId),
        getMilestoneTemplates(),
      ]);
      setRecords(r);
      setTemplates(t.filter((temp) => temp.required_for_promotion));
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to load milestones.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  useEffect(() => {
    if (memberId) load();
  }, [memberId, refresh, load]);

  const handleAdd = async (templateId) => {
    if (!canAddMilestone) {
      setSnackbar({ open: true, message: 'You do not have permission to add a milestone.', severity: 'error' });
      return;
    }

    setAdding(true);
    try {
      const newRecord = await addMilestone({ member_id: memberId, template_id: templateId });
      const templateStillValid = templates.some((t) => t.id === newRecord.template_id);

      if (templateStillValid) {
        setRecords((prev) => [...prev, newRecord]);
      } else {
        await load();
      }

      setSnackbar({ open: true, message: 'Milestone added successfully.', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to add milestone.', severity: 'error' });
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (recordId) => {
    if (!canDeleteMilestone) {
      setSnackbar({ open: true, message: 'You do not have permission to delete this milestone.', severity: 'error' });
      return;
    }

    setConfirmDialog({
      open: true,
      onConfirm: async () => {
        try {
          await deleteMilestone(recordId);
          setSnackbar({ open: true, message: 'Milestone removed.', severity: 'success' });
          load();
        } catch (err) {
          setSnackbar({ open: true, message: 'Failed to remove milestone.', severity: 'error' });
        } finally {
          setConfirmDialog({ open: false, onConfirm: null });
        }
      },
    });
  };

  const isCompleted = (templateId) => records.some((r) => r.template_id === templateId);

  const getRecordByTemplate = (templateId) => records.find((r) => r.template_id === templateId);

  const completedCount = templates.filter((t) => isCompleted(t.id)).length;
  const totalCount = templates.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: '', severity: 'success' });
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="h6" color={theme.palette.text.primary}>
          Milestones
        </Typography>
        {canAddMilestone && (
          <Tooltip title="Assign Milestone">
            <IconButton onClick={onAddClick} color="primary" disabled={adding}>
              {adding ? <CircularProgress size={20} /> : <Plus size={20} />}
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {loading ? (
        <CircularProgress size={24} />
      ) : (
        <>
          {totalCount > 0 && (
            <Box mb={2}>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                {completedCount} of {totalCount} completed ({progressPercent}%)
              </Typography>
              <LinearProgress
                variant="determinate"
                value={progressPercent}
                sx={{ height: 8, borderRadius: 5 }}
              />
            </Box>
          )}

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {templates.map((t) => {
              const completed = isCompleted(t.id);
              const record = getRecordByTemplate(t.id);

              const completedAt = record?.completed_at
                ? new Date(record.completed_at).toLocaleDateString()
                : null;

              const assignedBy = record?.created_by_name;

              const tooltip = completed
                ? `Completed on: ${completedAt || 'Unknown'}${assignedBy ? `\nBy: ${assignedBy}` : ''}`
                : 'Not completed';

              return (
                <Tooltip key={t.id} title={tooltip}>
                  <Chip
                    label={t.name}
                    color={completed ? 'success' : 'default'}
                    variant={completed ? 'filled' : 'outlined'}
                    onClick={!completed && canAddMilestone ? () => handleAdd(t.id) : undefined}
                    onDelete={completed && canDeleteMilestone ? () => handleDelete(record.id) : undefined}
                    deleteIcon={completed && canDeleteMilestone ? <DeleteIcon /> : undefined}
                  />
                </Tooltip>
              );
            })}
          </Box>
        </>
      )}

      <ConfirmDialog
        open={confirmDialog.open}
        title="Confirm Deletion"
        content="Are you sure you want to delete this milestone?"
        onClose={() => setConfirmDialog({ open: false, onConfirm: null })}
        onConfirm={confirmDialog.onConfirm}
      />

      <SnackbarAlert
        open={snackbar.open}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Box>
  );
}
