import React, { createContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const NotificationContext = createContext();

export const NotificationProvider = ({ children, memberId }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || API_URL.replace('/api', '');

  useEffect(() => {
    const validMemberId = parseInt(memberId, 10);
    if (!validMemberId || isNaN(validMemberId)) return;

    // 1) Load persisted notifications
    (async () => {
      try {
        const res = await fetch(`${API_URL}/notifications/${validMemberId}`);
        if (!res.ok) throw new Error(`Fetch failed ${res.status}`);
        const data = await res.json();

        const arr = Array.isArray(data.notifications) ? data.notifications : [];
        setNotifications(arr);
        setUnreadCount(arr.filter(n => !n.is_read).length);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    })();

    // 2) Subscribe to real-time updates
    const socket = io(SOCKET_URL, {
      query: { memberId: String(validMemberId) },
    });

    socket.on('connect', () => {
      console.log(`Connected to WebSocket server for member_${validMemberId}`);
    });

    socket.on('new_notification', (notification) => {
      setNotifications((prev) => {
        const base = Array.isArray(prev) ? prev : [];
        // Avoid duplicates in the list
        if (base.some((n) => n.id === notification.id)) return base;
        return [notification, ...base];
      });
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, [memberId, API_URL, SOCKET_URL]);

  const markAsRead = async (id) => {
    try {
      await fetch(`${API_URL}/notifications/read/${id}`, { method: 'PATCH' });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    const validMemberId = parseInt(memberId, 10);
    if (!validMemberId || isNaN(validMemberId)) return;

    try {
      await fetch(`${API_URL}/notifications/read-all/${validMemberId}`, { method: 'PATCH' });
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
