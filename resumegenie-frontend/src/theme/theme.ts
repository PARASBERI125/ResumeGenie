import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8b5cf6',
      light: '#a78bfa',
      dark: '#6d28d9',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#38bdf8',
      contrastText: '#ffffff',
    },
    background: {
      default: '#0f172a',
      paper: '#111827',
    },
    text: {
      primary: '#ffffff',
      secondary: '#9db7d8',
    },
    divider: '#314057',
    error: {
      main: '#ff4f64',
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h3: {
      fontWeight: 750,
      letterSpacing: 0,
    },
    h4: {
      fontWeight: 750,
      letterSpacing: 0,
    },
    h5: {
      fontWeight: 700,
      letterSpacing: 0,
    },
    h6: {
      fontWeight: 700,
      letterSpacing: 0,
    },
    button: {
      textTransform: 'none',
      fontWeight: 700,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          minHeight: 38,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #314057',
          borderRadius: 8,
          backgroundColor: '#1e293b',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          '& label': {
            color: '#9db7d8',
            fontWeight: 650,
          },
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#0b1221',
            borderRadius: 8,
            '& fieldset': {
              borderColor: '#34445e',
            },
            '&:hover fieldset': {
              borderColor: '#586b89',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#8b5cf6',
            },
          },
        },
      },
    },
  },
})
