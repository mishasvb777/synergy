import { createTheme } from '@mui/material/styles';

const ink = '#1C2422';
const muted = '#6F7A76';
const line = '#E3EAE6';
const paper = '#FFFFFF';
const canvas = '#F3F6F4';
const accent = '#2D8C7A';
const accentSoft = '#E7F4F0';
const accentHover = '#247866';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: accent, contrastText: '#fff', light: accentSoft },
    secondary: { main: ink },
    divider: line,
    background: { default: canvas, paper },
    text: { primary: ink, secondary: muted },
    action: { hover: 'rgba(45, 140, 122, 0.07)' },
  },
  typography: {
    fontFamily: '"Manrope", "Segoe UI", sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.03em' },
    h2: { fontWeight: 750, letterSpacing: '-0.02em' },
    h3: { fontWeight: 750, letterSpacing: '-0.02em' },
    h4: { fontWeight: 750, letterSpacing: '-0.02em', fontSize: '1.6rem' },
    h5: { fontWeight: 700, letterSpacing: '-0.015em' },
    h6: { fontWeight: 700, letterSpacing: '-0.01em', fontSize: '1.05rem' },
    subtitle1: { fontWeight: 650 },
    body1: { fontSize: '0.95rem', lineHeight: 1.55 },
    body2: { fontSize: '0.875rem', lineHeight: 1.5, color: muted },
    button: { textTransform: 'none', fontWeight: 650 },
    caption: { color: muted, fontSize: '0.78rem' },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: canvas,
          backgroundImage:
            'radial-gradient(ellipse at top left, rgba(45,140,122,0.06), transparent 42%), radial-gradient(ellipse at 90% 10%, rgba(196, 160, 90, 0.05), transparent 35%)',
        },
        a: { color: 'inherit', textDecoration: 'none' },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 12,
          paddingInline: 16,
          minHeight: 40,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none', backgroundColor: accentHover },
        },
        outlined: {
          borderColor: line,
          backgroundColor: paper,
          '&:hover': { borderColor: '#CDD8D3', backgroundColor: paper },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: paper,
          borderRadius: 14,
          '& fieldset': { borderColor: line },
          '&:hover fieldset': { borderColor: '#C5D2CC' },
          '&.Mui-focused fieldset': { borderColor: accent, borderWidth: 1 },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: 'none',
          boxShadow: '0 4px 20px rgba(28, 36, 34, 0.05)',
          backgroundImage: 'none',
          borderRadius: 18,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
        elevation1: { boxShadow: '0 4px 20px rgba(28, 36, 34, 0.05)' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 999, height: 26, fontWeight: 600 },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 14, border: `1px solid ${line}`, boxShadow: 'none' },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: line, py: 1.5 },
        head: { color: muted, fontWeight: 650, fontSize: '0.8rem' },
      },
    },
  },
});
