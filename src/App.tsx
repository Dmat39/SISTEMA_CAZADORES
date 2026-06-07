import { useEffect, useMemo } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { setToken } from '@/api/config';
import { useAppSelector } from '@/store/hooks';
import { useTheme } from '@/contexts/ThemeContext';
import Router from './routes/Router';
import ToastPortal from './components/ToastPortal.tsx';

function App() {
  const token = useAppSelector((state) => state.auth.token);
  const { isDark } = useTheme();

  useEffect(() => {
    setToken(token);
  }, [token]);

  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDark ? 'dark' : 'light',
          primary: { main: '#ea580c' },
          ...(isDark
            ? {
                background: { default: '#0f172a', paper: '#1e293b' },
                text: { primary: '#f1f5f9', secondary: '#94a3b8' },
              }
            : {}),
        },
        typography: {
          fontFamily: "'DM Sans', system-ui, sans-serif",
        },
        components: {
          MuiPaper: {
            styleOverrides: {
              root: ({ theme }) => ({
                backgroundImage: 'none',
                ...(theme.palette.mode === 'dark' && {
                  backgroundColor: '#1e293b',
                  borderColor: 'rgba(255,255,255,0.1)',
                }),
              }),
            },
          },
          MuiTableCell: {
            styleOverrides: {
              root: ({ theme }) => ({
                ...(theme.palette.mode === 'dark' && {
                  borderBottomColor: 'rgba(255,255,255,0.08)',
                }),
              }),
            },
          },
          MuiIconButton: {
            styleOverrides: {
              root: {
                '&:hover': { backgroundColor: 'rgba(234,88,12,0.15)' },
              },
            },
          },
        },
      }),
    [isDark]
  );

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline enableColorScheme />
      <Router />
      <ToastPortal />
    </MuiThemeProvider>
  );
}

export default App;
