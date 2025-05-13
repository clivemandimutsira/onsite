import React, { useContext, useState } from 'react';
import {
  Badge,
  IconButton,
  Popover,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  useTheme,
  ListItemButton,
} from '@mui/material';
import { Bell } from 'lucide-react';
import NotificationContext from '../../contexts/NotificationContext';

const NotificationBell = () => {
  const theme = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useContext(NotificationContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const isDark = theme.palette.mode === 'dark';

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
    markAllAsRead();
  };

  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <IconButton onClick={handleOpen} aria-label="Show notifications">
        <Badge badgeContent={unreadCount} color="error">
          <Bell />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          style: {
            maxHeight: '60vh',
            width: 350,
            overflowY: 'auto',
            borderRadius: 8,
            boxShadow: theme.shadows[5],
            backgroundColor: isDark ? theme.palette.background.paper : '#fff',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Notifications
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            You have {unreadCount} unread
          </Typography>

          <List disablePadding>
            {notifications.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No notifications yet.
              </Typography>
            ) : (
              notifications.map((notification) => (
                <ListItem key={notification.id} disablePadding>
                  <ListItemButton
                    onClick={() => markAsRead(notification.id)}
                    sx={{
                      alignItems: 'flex-start',
                      backgroundColor: notification.is_read
                        ? 'transparent'
                        : isDark
                          ? 'rgba(66, 133, 244, 0.15)'
                          : '#e8f0fe',
                      '&:hover': {
                        backgroundColor: isDark
                          ? 'rgba(66, 133, 244, 0.25)'
                          : '#dbe6fd',
                      },
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      py: 1.5,
                      px: 2,
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography
                          variant="subtitle1"
                          component="span"
                          sx={{
                            fontWeight: notification.is_read ? 'normal' : 'bold',
                            color: theme.palette.text.primary,
                            mb: 0.5,
                          }}
                        >
                          {notification.title}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography
                            variant="body2"
                            component="span"
                            color="text.secondary"
                            sx={{
                              display: 'block',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {notification.message}
                          </Typography>
                          <Typography
                            variant="caption"
                            component="span"
                            color="text.disabled"
                            sx={{ display: 'block', mt: 0.5 }}
                          >
                            {new Date(notification.created_at).toLocaleString()}
                          </Typography>
                        </>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))
            )}
          </List>
        </Box>
      </Popover>
    </>
  );
};

export default NotificationBell;
