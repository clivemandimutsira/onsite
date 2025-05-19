// src/components/Topbar.jsx

import {
  AppBar,
  Toolbar,
  IconButton,
  useTheme,
  useMediaQuery,
  Box,
  Slide,
} from '@mui/material';
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import NotificationBell from './notifications/NotificationBell';
import { Sun, Moon, User, MessageCircle } from 'lucide-react';
import MenuIcon from '@mui/icons-material/Menu';
import useScrollDirection from '../utils/useScrollDirection';

export default function Topbar({ open, setOpen }) {
  const { toggleTheme, mode } = useContext(AuthContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const scrollDirection = useScrollDirection();

  return (
    <Slide appear={false} direction="down" in={scrollDirection === 'up'}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: 'transparent',
          boxShadow: 'none',
          backdropFilter: 'none',
          borderBottom: '1px solid transparent',
          left: isMobile ? 0 : open ? '240px' : '72px',
          width: isMobile ? '100%' : `calc(100% - ${open ? '240px' : '72px'})`,
          transition: theme.transitions.create(['left', 'width'], {
            duration: theme.transitions.duration.standard,
          }),
        }}
      >
        <Toolbar sx={{ px: 2 }}>
          {/* Mobile Menu Toggle */}
          {isMobile && (
            <IconButton
              edge="start"
              onClick={() => setOpen(true)}
              sx={{
                mr: 2,
                color: theme.palette.text.primary,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo with theme switch and retina support */}
          <Box sx={{ flexGrow: 1 }}>
            <Link to="/" style={{ display: 'inline-block' }}>
              <img
                src={
                  mode === 'light'
                    ? '/assets/logo.png'
                    : '/assets/white.png'
                }
                srcSet={
                  mode === 'light'
                    ? '/assets/logo.png 1x, /assets/logo@2x.png 2x'
                    : '/assets/white.png 1x, /assets/white@2x.png 2x'
                }
                alt="Logo"
                style={{
                  height: 90,
                  maxWidth: '100%',
                  objectFit: 'contain',
                  verticalAlign: 'middle',
                }}
              />
            </Link>
          </Box>

          {/* Icons: Profile, Messages, Notifications, Theme Toggle */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Profile */}
            <IconButton sx={{ color: theme.palette.text.primary }}>
              <User size={20} />
            </IconButton>

            {/* Messages */}
            <IconButton sx={{ color: theme.palette.text.primary }}>
              <MessageCircle size={20} />
            </IconButton>

            {/* NotificationBell */}
            <NotificationBell sx={{ color: theme.palette.text.primary }} />

            {/* Theme Toggle */}
            <IconButton
              onClick={toggleTheme}
              sx={{ color: theme.palette.text.primary }}
            >
              {mode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
    </Slide>
  );
}
