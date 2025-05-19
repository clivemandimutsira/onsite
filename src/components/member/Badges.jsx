// src/components/member/Badges.jsx
import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Chip, Stack, Paper, Avatar, Tooltip, useTheme } from '@mui/material';
import { fetchMemberBadges } from '../../api/memberStatsService';
import DynamicIcon from './DynamicIcon';

// Color palette using theme
const getBadgeColor = (label, theme) => {
  // Use theme.palette.primary, secondary, warning, error, etc.
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

export default function Badges({ memberId }) {
  const [badges, setBadges] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    fetchMemberBadges(memberId).then(setBadges).catch(console.error);
  }, [memberId]);

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>Badges</Typography>
      {!badges ? (
        <CircularProgress />
      ) : (
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            backgroundColor: theme.palette.background.paper,
            borderColor: theme.palette.divider,
          }}
        >
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {badges.map((b, i) => {
              const color = getBadgeColor(b.label, theme);
              return (
                <Chip
                  key={i}
                  label={b.label}
                  avatar={
                    <Tooltip title={b.icon_name || 'Award'}>
                      <Avatar sx={{
                        bgcolor: color,
                        width: 24,
                        height: 24,
                        color: theme.palette.getContrastText(color),
                      }}>
                        <DynamicIcon iconName={b.icon_name || 'Star'} size={16} color={theme.palette.getContrastText(color)} />
                      </Avatar>
                    </Tooltip>
                  }
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
            })}
          </Stack>
        </Paper>
      )}
    </Box>
  );
}
