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
  Shield,
  Lock,
  LogOut,
  Menu,
  Users,
  Group,
  UserRoundPlus,
  UserCheck,
  ShieldCheck
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

  const hasPermission = (requiredPermission) => {
    return permissions.includes(requiredPermission);
  };

  // Define menu items dynamically based on permissions and roles
  const menuItems = [
    {
      label: 'Dashboard',
      icon: <Home size={20} />,
      path: userRole === 'admin' ? '/dashboard' : '/member-dashboard',
      permission: null // Accessible to all roles
    },
    {
      label: 'Profile',
      icon: <User size={20} />,
      path: `/members/profile/${memberId}`,
      permission: null, // Accessible to all members
      roles: ['member'] // Only show for these roles
    },
    {
      label: 'Users',
      icon: <User size={20} />,
      path: '/users',
      permission: 'view_users'
    },
    {
      label: 'Roles',
      icon: <Shield size={20} />,
      path: '/roles',
      permission: 'view_roles'
    },
    {
      label: 'Permissions',
      icon: <Lock size={20} />,
      path: '/permissions',
      permission: 'view_permissions'
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
      label: 'Cell Groups',
      icon: <Group size={20} />,
      path: '/cell-groups',
      permission: 'view_cell_groups'
    },
    {
      label: 'Departments',
      icon: <UserRoundPlus size={20} />,
      path: '/departments',
      permission: 'view_departments'
    },
    {
      label: 'Milestone Templates',
      icon: <ShieldCheck size={20} />,
      path: '/milestones',
      permission: 'view_milestones'
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
          .filter((item) => {
            // Check if the user has the required permission (if specified)
            if (item.permission && !hasPermission(item.permission)) return false;

            // Check if the user's role is allowed (if specified)
            if (item.roles && !item.roles.includes(userRole)) return false;

            return true;
          })
          .map((item, index) => {
            const isActive = location.pathname === item.path;

            return (
              <ListItem disablePadding key={index}>
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

        {/* Logout */}
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
