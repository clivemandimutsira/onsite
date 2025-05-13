import {
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Home,
  User,
  LogOut,
  Menu,
  Users,
  Group,
  UserRoundPlus,
  UserCheck,
  ShieldCheck,
  Settings,
  CalendarDays
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export default function Sidebar({ open, setOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, token, permissions, userRole, memberId } = useContext(AuthContext);

  const toggleSidebar = () => setOpen(!open);
  if (!token) return null;

  const hasPermission = (perm) => permissions.includes(perm);

  const menuItems = [
    {
      label: 'Dashboard',
      icon: <Home size={20} />,
      path: userRole === 'admin' ? '/dashboard' : '/member-dashboard'
    },
    {
      label: 'Profile',
      icon: <User size={20} />,
      path: `/members/profile/${memberId}`,
      roles: ['member']
    },
    {
      label: 'Members',
      icon: <Users size={20} />,
      path: '/members',
      permission: 'view_members'
    },
    {
      label: 'New Members',
      icon: <UserCheck size={20} />,
      path: '/first-timers-converts',
      permission: 'view_members'
    },
    {
      label: 'Counseling',
      icon: <Users size={20} />,
      path: '/members/1/interactions',
      permission: 'view_members'
    },
    {
      label: 'Church Groups',
      icon: <Group size={20} />,
      path: '/groups-departments',
      permission: 'view_cell_groups'
    },
    {
      label: 'Events',
      icon: <CalendarDays size={20} />,
      path: '/events',
      roles: ['admin']
    },
    {
     label: 'Finance',
     icon: <ShieldCheck size={20} />,    // pick any icon you like
     path: '/finance',
     permission: 'view_finance'         // or roles: ['admin','finance']
    },
    {
      label: 'Settings',
      icon: <Settings size={20} />,
      path: '/settings',
      roles: ['admin']
    }
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? 240 : 60,
        '& .MuiDrawer-paper': {
          width: open ? 240 : 60,
          transition: 'width 0.3s',
          overflowX: 'hidden'
        }
      }}
    >
      <IconButton onClick={toggleSidebar} sx={{ m: 1 }} disableRipple>
        <Menu size={24} />
      </IconButton>

      <List>
        {menuItems
          .filter(item => {
            if (item.permission && !hasPermission(item.permission)) return false;
            if (item.roles && !item.roles.includes(userRole)) return false;
            return true;
          })
          .map((item, idx) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem disablePadding key={idx}>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    backgroundColor: isActive ? 'action.selected' : 'transparent',
                    '&:hover': { backgroundColor: 'action.hover' }
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  {open && <ListItemText primary={item.label} />}
                </ListItemButton>
              </ListItem>
            );
          })}

        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            <ListItemIcon>
              <LogOut size={20} />
            </ListItemIcon>
            {open && <ListItemText primary="Logout" />}
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
}
