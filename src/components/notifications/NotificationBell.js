import React, { useContext, useState, useEffect } from 'react';
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
  useMediaQuery,
  Avatar,
  Fade,
  Divider,
  Chip,
  Button,
} from '@mui/material';
import { Bell } from 'lucide-react';
import NotificationContext from '../../contexts/NotificationContext';
import { useSwipeable } from 'react-swipeable';

const NotificationBell = ({ sx }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { notifications, unreadCount, markAsRead, markAllAsRead } = useContext(NotificationContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [lastNotifiedId, setLastNotifiedId] = useState(null);

  const open = Boolean(anchorEl);
  const popoverWidth = isMobile ? '90vw' : 360;

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => markAllAsRead(),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  const groupedNotifications = notifications.reduce((acc, notification) => {
    acc[notification.type] = acc[notification.type] || [];
    acc[notification.type].push(notification);
    return acc;
  }, {});

  useEffect(() => {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!notifications.length) return;

    const latest = notifications[0];
    if (!latest || latest.id === lastNotifiedId || latest.is_read) return;

    // Play sound and show native notification only for new, unread ones
    const audio = new Audio('/notification.mp3');
    audio.play().catch(console.error);

    if (Notification.permission === 'granted') {
      new Notification(latest.title, {
        body: latest.message,
        icon: '/logo192.png',
      });
    }

    setLastNotifiedId(latest.id);
  }, [notifications, lastNotifiedId]);

  return (
    <>
      <IconButton
        onClick={handleOpen}
        aria-label="Notifications"
        sx={{
          color: theme.palette.text.primary,
          ...sx,
        }}
      >
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
          elevation: 6,
          sx: {
            width: popoverWidth,
            maxHeight: '60vh',
            borderRadius: 2,
            overflowY: 'auto',
            backgroundColor: isDark ? theme.palette.background.paper : '#fff',
            boxShadow: theme.shadows[6],
          },
        }}
        TransitionComponent={Fade}
      >
        <Box sx={{ p: 2 }} {...swipeHandlers}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Notifications</Typography>
            {unreadCount > 0 && (
              <Chip
                label="Mark all as read"
                onClick={markAllAsRead}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ cursor: 'pointer' }}
              />
            )}
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'You’re all caught up!'}
          </Typography>

          {notifications.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                No notifications to show.
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {Object.entries(groupedNotifications).map(([type, items]) => (
                <Box key={type} sx={{ mb: 2 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      textTransform: 'capitalize',
                      mb: 1,
                      color: theme.palette.text.secondary,
                    }}
                  >
                    {type}
                  </Typography>

                  {items.map((notification) => (
                    <ListItem key={notification.id} disablePadding>
                      <ListItemButton
                        onClick={() => {
                          markAsRead(notification.id);
                          if (notification.url) {
                            window.open(notification.url, '_blank');
                          }
                        }}
                        sx={{
                          alignItems: 'flex-start',
                          backgroundColor: notification.is_read
                            ? 'transparent'
                            : isDark
                            ? 'rgba(66,133,244,0.1)'
                            : '#e3f2fd',
                          '&:hover': {
                            backgroundColor: isDark
                              ? 'rgba(66,133,244,0.2)'
                              : '#d0e5fc',
                          },
                          py: 1.5,
                          px: 2,
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            fontSize: 14,
                            bgcolor: theme.palette.primary.main,
                            mr: 2,
                          }}
                        >
                          {notification.title.charAt(0)}
                        </Avatar>
                        <ListItemText
                          primary={
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: notification.is_read ? 400 : 600 }}
                            >
                              {notification.title}
                              {!notification.is_read && (
                                <Box
                                  component="span"
                                  sx={{
                                    display: 'inline-block',
                                    ml: 1,
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    bgcolor: theme.palette.primary.main,
                                  }}
                                />
                              )}
                            </Typography>
                          }
                          secondary={
                            <>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  display: '-webkit-box',
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
                  ))}
                  <Divider />
                </Box>
              ))}
            </List>
          )}
          {notifications.length > 0 && (
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button size="small" onClick={markAllAsRead}>
                Clear All Unread
              </Button>
            </Box>
          )}
        </Box>
      </Popover>
    </>
  );
};

export default NotificationBell;
