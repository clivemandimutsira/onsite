import { createTheme } from '@mui/material/styles';

export const getTheme = (mode) => createTheme({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          primary: { main: '#1976d2' },
          background: { default: '#ffffff' },
        }
      : {
          primary: { main: '#90caf9' },
          background: { default: '#121212' },
        }),
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: '"Jost", sans-serif',  // Set Jost as the primary font
  },
});
