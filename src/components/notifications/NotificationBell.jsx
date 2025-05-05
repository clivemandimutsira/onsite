// src/components/notifications/NotificationBell.jsx

import React, { useEffect, useState, useContext } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import { Bell, CheckCircle } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL;

const NotificationBell = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);
  const unreadCount = notifications.filter((n) => !n.seen).length;

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_URL}/notifications/${user.id}`);
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to fetch notifications');
    }
  };

  const markAsSeen = async (id) => {
    await fetch(`${API_URL}/notifications/${id}/seen`, { method: 'PUT' });
    fetchNotifications();
  };

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user]);

  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <IconButton color="inherit" onClick={handleOpen}>
        <Badge badgeContent={unreadCount} color="error">
          <Bell size={20} />
        </Badge>
      </IconButton>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <Typography variant="subtitle1" sx={{ px: 2, pt: 1 }}>
          Notifications
        </Typography>
        <Divider />
        {notifications.length === 0 ? (
          <MenuItem disabled>No notifications</MenuItem>
        ) : (
          notifications.slice(0, 5).map((note) => (
            <MenuItem
              key={note.id}
              onClick={() => {
                if (!note.seen) markAsSeen(note.id);
              }}
              sx={{ opacity: note.seen ? 0.6 : 1 }}
            >
              <ListItemIcon><CheckCircle size={18} /></ListItemIcon>
              <ListItemText
                primary={note.title}
                secondary={note.message}
                sx={{ maxWidth: '300px' }}
              />
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
};

export default NotificationBell;
