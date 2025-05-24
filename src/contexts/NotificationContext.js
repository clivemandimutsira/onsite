import React, { createContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const NotificationContext = createContext();

export const NotificationProvider = ({ children, memberId }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifiedRef = useRef(new Set()); // Track shown notification IDs

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || API_URL.replace('/api', '');

  useEffect(() => {
    const validMemberId = parseInt(memberId, 10);
    if (!validMemberId || isNaN(validMemberId)) return;

    // 1) Load notifications from the API
    (async () => {
      try {
        const res = await fetch(`${API_URL}/notifications/${validMemberId}`);
        if (!res.ok) throw new Error(`Fetch failed ${res.status}`);
        const data = await res.json();

        const arr = Array.isArray(data.notifications) ? data.notifications : [];
        setNotifications(arr);
        setUnreadCount(arr.filter(n => !n.is_read).length);

        // Fill initial notifiedRef to avoid re-notifying on socket push
        arr.forEach(n => notifiedRef.current.add(n.id));
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    })();

    // 2) Subscribe to socket events
    const socket = io(SOCKET_URL, {
      query: { memberId: String(validMemberId) },
    });

    socket.on('connect', () => {
      console.log(`✅ Connected to WebSocket: member_${validMemberId}`);
    });

    socket.on('new_notification', (notification) => {
      setNotifications(prev => {
        if (prev.some(n => n.id === notification.id)) return prev;
        return [notification, ...prev];
      });

      if (!notification.is_read && !notifiedRef.current.has(notification.id)) {
        // Play audio and show browser notification once
        const audio = new Audio('/notification.mp3');
        audio.play().catch(console.error);

        if (Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/logo192.png',
          });
        }

        notifiedRef.current.add(notification.id);
        setUnreadCount(prev => prev + 1);
      }
    });

    return () => socket.disconnect();
  }, [memberId, API_URL, SOCKET_URL]);

  const markAsRead = async (id) => {
    try {
      await fetch(`${API_URL}/notifications/read/${id}`, { method: 'PATCH' });

      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      );

      setUnreadCount(prev => {
        const wasUnread = notifications.find(n => n.id === id)?.is_read === false;
        return wasUnread ? Math.max(prev - 1, 0) : prev;
      });
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    const validMemberId = parseInt(memberId, 10);
    if (!validMemberId || isNaN(validMemberId)) return;

    try {
      await fetch(`${API_URL}/notifications/read-all/${validMemberId}`, { method: 'PATCH' });

      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
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
