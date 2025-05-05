import { AppBar, Toolbar, Typography, IconButton, useTheme } from '@mui/material';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Sun, Moon } from 'lucide-react';
import NotificationBell from '../components/notifications/NotificationBell';

export default function Topbar({ open }) {
  const { toggleTheme, mode } = useContext(AuthContext);
  const theme = useTheme();

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: theme.palette.background.paper, // or use 'primary.main' for stronger color
        color: theme.palette.text.primary,
        boxShadow: 'none',
        left: open ? '240px' : '60px',
        width: `calc(100% - ${open ? '240px' : '60px'})`,
        transition: 'left 0.3s, width 0.3s',
      }}
    >
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {/* App title or logo */}
        </Typography>

        {/* Notification Bell */}
        <NotificationBell />

        {/* Theme Toggle */}
        <IconButton onClick={toggleTheme} sx={{ color: theme.palette.text.primary }}>
          {mode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
