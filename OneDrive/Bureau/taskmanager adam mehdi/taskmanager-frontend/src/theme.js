import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    // Add more colors as needed to match Asana's palette
  },
  typography: {
    // Define typography styles to match Asana's font and sizes
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    // ... other typography styles
  },
  components: {
    // Customize component styles
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#222c36', // Example dark background for sidebar
          color: '#fff',
          borderRight: 0,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#fff', // Example light background for app bar
          color: '#000',
          boxShadow: 'none', // Example: remove shadow
          borderBottom: '1px solid #e0e0e0',
        },
      },
    },
    // ... other component customizations
  },
});

export default theme;