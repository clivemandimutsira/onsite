import {
  Drawer, IconButton, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Box, Tooltip, Divider, useTheme, useMediaQuery
} from '@mui/material';
import {
  Home, User, LogOut, Users, Group, UserCheck, ShieldCheck,
  Settings, CalendarDays, BadgeDollarSign, ClockFading
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export default function Sidebar({ open, setOpen }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, token, permissions, userRole, memberId } = useContext(AuthContext);

  useEffect(() => {
    if (isMobile) setOpen(false);
  }, [location.pathname]);

  if (!token) return null;

  const hasPermission = (perm) => permissions.includes(perm);

  const menuItems = [
    { label: 'Dashboard', icon: <Home size={20} />, path: userRole === 'admin' ? '/dashboard' : '/member-dashboard' },
    { label: 'Profile', icon: <User size={20} />, path: `/members/profile/${memberId}`, roles: ['member'] },
    { label: 'My Giving', icon: <BadgeDollarSign size={20} />, path: `/members/${memberId}/finance`, roles: ['member'] },
    { label: 'My Events', icon: <ClockFading size={20} />, path: `/members/${memberId}/events`, roles: ['member'] },
    { label: 'Members', icon: <Users size={20} />, path: '/members', permission: 'view_members' },
    { label: 'New Members', icon: <UserCheck size={20} />, path: '/first-timers-converts', permission: 'view_members' },
    { label: 'Counseling', icon: <Users size={20} />, path: '/members/1/interactions', permission: 'view_members' },
    { label: 'Church Groups', icon: <Group size={20} />, path: '/groups-departments', permission: 'view_cell_groups' },
    { label: 'Events', icon: <CalendarDays size={20} />, path: '/events', roles: ['admin'] },
    { label: 'Finance', icon: <ShieldCheck size={20} />, path: '/finance', permission: 'view_finance' },
    { label: 'Settings', icon: <Settings size={20} />, path: '/settings', roles: ['admin'] },
  
  ];

  const drawerContent = (
    <>
      <Box sx={{ display: 'flex', justifyContent: open ? 'flex-end' : 'center', p: 1 }}>
        <IconButton onClick={() => setOpen(!open)} sx={{ color: theme.palette.text.primary }}>
          <motion.svg
            initial={false}
            animate={{ rotate: open ? 0 : 180 }}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            transition={{ duration: 0.3 }}
          >
            {open ? (
              <motion.path
                d="M6 6h12M6 12h12M6 18h12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ) : (
              <motion.path
                d="M6 6l12 12M6 18L18 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            )}
          </motion.svg>
        </IconButton>
      </Box>

      <Divider />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.05 } },
          hidden: {},
        }}
      >
        <List>
          {menuItems
            .filter((item) => {
              if (item.permission && !hasPermission(item.permission)) return false;
              if (item.roles && !item.roles.includes(userRole)) return false;
              return true;
            })
            .map((item, idx) => {
              const isActive = location.pathname === item.path;

              return (
                <motion.div
                  key={idx}
                  variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}
                >
                  <Tooltip title={!open ? item.label : ''} placement="right">
                    <ListItem disablePadding>
                      <motion.div whileHover={{ scale: 1.05 }} style={{ width: '100%' }}>
                        <ListItemButton
                          onClick={() => navigate(item.path)}
                          selected={isActive}
                          sx={{
                            borderRadius: 2,
                            mx: 1,
                            my: 0.5,
                            backgroundColor: isActive ? theme.palette.action.selected : 'transparent',
                            '&:hover': {
                              backgroundColor: theme.palette.action.hover,
                            },
                          }}
                        >
                          <ListItemIcon
                            sx={{
                              minWidth: 0,
                              mr: open ? 2 : 'auto',
                              justifyContent: 'center',
                              color: theme.palette.text.primary,
                            }}
                          >
                            {item.icon}
                          </ListItemIcon>
                          <AnimatePresence>
                            {open && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <ListItemText primary={item.label} />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </ListItemButton>
                      </motion.div>
                    </ListItem>
                  </Tooltip>
                </motion.div>
              );
            })}
        </List>
      </motion.div>

      <Divider sx={{ my: 1 }} />

      <Tooltip title={!open ? 'Logout' : ''} placement="right">
        <ListItem disablePadding>
          <motion.div whileHover={{ scale: 1.05 }} style={{ width: '100%' }}>
            <ListItemButton
              onClick={() => {
                logout();
                navigate('/login');
              }}
              sx={{
                borderRadius: 2,
                mx: 1,
                my: 0.5,
                '&:hover': { backgroundColor: theme.palette.action.hover },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 2 : 'auto',
                  justifyContent: 'center',
                  color: theme.palette.text.primary,
                }}
              >
                <LogOut size={20} />
              </ListItemIcon>
              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ListItemText primary="Logout" />
                  </motion.div>
                )}
              </AnimatePresence>
            </ListItemButton>
          </motion.div>
        </ListItem>
      </Tooltip>
    </>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={open}
      onClose={() => setOpen(false)}
      ModalProps={{ keepMounted: true }}
      sx={{
        width: open ? 240 : 72,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? 240 : 72,
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
          transition: 'width 0.3s ease',
          overflowX: 'hidden',
          borderRight: `1px solid ${theme.palette.divider}`,
          backdropFilter: 'blur(10px)',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}
