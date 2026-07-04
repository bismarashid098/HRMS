import { createTheme } from '@mui/material/styles';
import type { Shadows } from '@mui/material/styles';

const shadows: Shadows = [
  'none',
  '0 1px 2px 0 rgba(15,23,42,0.05)',
  '0 1px 3px 0 rgba(15,23,42,0.1), 0 1px 2px -1px rgba(15,23,42,0.1)',
  '0 4px 6px -1px rgba(15,23,42,0.08), 0 2px 4px -2px rgba(15,23,42,0.06)',
  '0 10px 15px -3px rgba(15,23,42,0.08), 0 4px 6px -4px rgba(15,23,42,0.05)',
  '0 20px 25px -5px rgba(15,23,42,0.08), 0 8px 10px -6px rgba(15,23,42,0.04)',
  '0 25px 50px -12px rgba(15,23,42,0.18)',
  '0 25px 50px -12px rgba(15,23,42,0.22)',
  '0 25px 50px -12px rgba(15,23,42,0.26)',
  '0 25px 50px -12px rgba(15,23,42,0.30)',
  '0 25px 50px -12px rgba(15,23,42,0.34)',
  '0 25px 50px -12px rgba(15,23,42,0.38)',
  '0 25px 50px -12px rgba(15,23,42,0.42)',
  '0 25px 50px -12px rgba(15,23,42,0.46)',
  '0 25px 50px -12px rgba(15,23,42,0.50)',
  '0 25px 50px -12px rgba(15,23,42,0.54)',
  '0 25px 50px -12px rgba(15,23,42,0.58)',
  '0 25px 50px -12px rgba(15,23,42,0.62)',
  '0 25px 50px -12px rgba(15,23,42,0.66)',
  '0 25px 50px -12px rgba(15,23,42,0.70)',
  '0 25px 50px -12px rgba(15,23,42,0.74)',
  '0 25px 50px -12px rgba(15,23,42,0.78)',
  '0 25px 50px -12px rgba(15,23,42,0.82)',
  '0 25px 50px -12px rgba(15,23,42,0.86)',
  '0 25px 50px -12px rgba(15,23,42,0.90)',
];

const theme = createTheme({
  shadows,
  palette: {
    mode: 'light',
    primary: { main: '#4F46E5', light: '#818CF8', dark: '#3730A3', contrastText: '#fff' },
    secondary: { main: '#EC4899', contrastText: '#fff' },
    success: { main: '#10B981', light: '#34D399', dark: '#059669', contrastText: '#fff' },
    warning: { main: '#F59E0B', light: '#FCD34D', dark: '#D97706', contrastText: '#fff' },
    error: { main: '#EF4444', light: '#F87171', dark: '#DC2626', contrastText: '#fff' },
    info: { main: '#3B82F6', contrastText: '#fff' },
    background: { default: '#F1F5F9', paper: '#FFFFFF' },
    text: { primary: '#0F172A', secondary: '#64748B' },
    divider: '#E2E8F0',
  },
  typography: {
    fontFamily: '"Inter", "Plus Jakarta Sans", system-ui, sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 500, color: '#64748B' },
    button: { fontWeight: 600, textTransform: 'none' },
    caption: { color: '#94A3B8' },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': { boxSizing: 'border-box', margin: 0, padding: 0 },
        body: {
          fontFamily: '"Inter", "Plus Jakarta Sans", system-ui, sans-serif',
          backgroundColor: '#F1F5F9',
        },
        '::-webkit-scrollbar': { width: '5px', height: '5px' },
        '::-webkit-scrollbar-track': { background: 'transparent' },
        '::-webkit-scrollbar-thumb': { background: '#CBD5E1', borderRadius: '4px' },
        '::-webkit-scrollbar-thumb:hover': { background: '#94A3B8' },
        a: { textDecoration: 'none', color: 'inherit' },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 600, textTransform: 'none' },
        sizeSmall: { fontSize: '0.8125rem' },
        containedPrimary: {
          background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
          '&:hover': { background: 'linear-gradient(135deg, #3730A3 0%, #4F46E5 100%)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          boxShadow: '0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)',
          border: '1px solid #F1F5F9',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: { root: { '&:last-child': { paddingBottom: 16 } } },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': {
            backgroundColor: '#F8FAFC',
            fontWeight: 600,
            color: '#475569',
            fontSize: '0.8rem',
            borderBottom: '1px solid #E2E8F0',
            letterSpacing: '0.02em',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: '#F1F5F9', fontSize: '0.875rem', padding: '10px 16px' },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': { backgroundColor: '#FAFBFF' },
          '&:last-child td': { border: 0 },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 500, fontSize: '0.75rem', borderRadius: 6 },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 16, boxShadow: '0 25px 60px -12px rgba(15,23,42,0.25)' },
      },
    },
    MuiDialogTitle: {
      styleOverrides: { root: { fontSize: '1.05rem', fontWeight: 700, padding: '20px 24px 8px' } },
    },
    MuiDialogContent: {
      styleOverrides: { root: { padding: '12px 24px' } },
    },
    MuiDialogActions: {
      styleOverrides: { root: { padding: '12px 24px 20px', gap: 8 } },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '& fieldset': { borderColor: '#E2E8F0' },
          '&:hover fieldset': { borderColor: '#CBD5E1 !important' },
          '&.Mui-focused fieldset': { borderColor: '#4F46E5 !important', borderWidth: '1.5px' },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: { root: { fontSize: '0.875rem', color: '#64748B' } },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { borderRadius: 6, fontSize: '0.75rem', backgroundColor: '#1E293B' },
        arrow: { color: '#1E293B' },
      },
    },
    MuiAlert: {
      styleOverrides: { root: { borderRadius: 10, fontSize: '0.875rem' } },
    },
    MuiIconButton: {
      styleOverrides: { root: { borderRadius: 8 } },
    },
    MuiDivider: {
      styleOverrides: { root: { borderColor: '#F1F5F9' } },
    },
    MuiListItemButton: {
      styleOverrides: { root: { borderRadius: 8 } },
    },
    MuiTextField: { defaultProps: { size: 'small' } },
    MuiSelect: { defaultProps: { size: 'small' } },
    MuiFormControl: { defaultProps: { size: 'small' } },
  },
});

export default theme;
