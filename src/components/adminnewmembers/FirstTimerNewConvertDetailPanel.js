import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Stack,
  Divider,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import { EditIcon, DeleteIcon } from '../common/ActionIcons';
import { User, Calendar, Droplet } from 'lucide-react';

export default function FirstTimerNewConvertDetailPanel({
  data,
  type, // 'first_timer' or 'new_convert'
  onEdit,
  onDelete,
}) {
  const theme = useTheme();

  if (!data) {
    return (
      <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Typography variant="body2">Select a record to see details.</Typography>
      </Card>
    );
  }

  const renderDetails = () => {
    if (type === 'first_timer') {
      return (
        <>
          <Detail label="How They Heard" value={data.how_heard} />
          <Detail label="Registration Date" value={formatDate(data.registration_date)} icon={<Calendar size={18} />} />
        </>
      );
    } else {
      return (
        <>
          <Detail label="Conversion Type" value={data.conversion_type} />
          <Detail label="Conversion Date" value={formatDate(data.conversion_date)} icon={<Calendar size={18} />} />
          <Detail label="Baptism Scheduled" value={data.baptism_scheduled ? 'Yes' : 'No'} icon={<Droplet size={18} />} />
          {data.baptism_scheduled && (
            <Detail label="Baptism Date" value={formatDate(data.baptism_date)} icon={<Calendar size={18} />} />
          )}
        </>
      );
    }
  };

  const fullName = data.member_name || `${data.first_name || ''} ${data.surname || ''}`.trim();

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        boxShadow: theme.shadows[3],
      }}
    >
      <CardContent sx={{ flex: 1, overflowY: 'auto' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            {type === 'first_timer' ? 'First Timer' : 'New Convert'} Details
          </Typography>
          <Box>
            <Tooltip title="Edit">
              <IconButton onClick={onEdit}><EditIcon /></IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton onClick={onDelete}><DeleteIcon /></IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Avatar & Name */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar src={data.profile_picture_url} sx={{ width: 56, height: 56, mr: 2 }}>
            <User size={28} />
          </Avatar>
          <Box>
            <Typography variant="h6">{fullName}</Typography>
            {data.status && (
              <Chip
                label={data.status}
                size="small"
                variant="outlined"
                sx={{ mt: 1 }}
                color={data.status === 'active' ? 'success' : data.status === 'inactive' ? 'error' : 'default'}
              />
            )}
          </Box>
        </Box>

        <Stack spacing={2}>{renderDetails()}</Stack>
      </CardContent>
    </Card>
  );
}

function Detail({ label, value, icon }) {
  return (
    <Box>
      <Typography
        variant="subtitle2"
        sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}
      >
        {icon}
        {label}
      </Typography>
      <Typography variant="body2">{value || 'Not Available'}</Typography>
    </Box>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  } catch {
    return dateStr;
  }
}
