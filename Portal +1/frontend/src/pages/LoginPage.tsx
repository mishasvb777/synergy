import { FormEvent, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { authApi } from '../api/client';
import { setCredentials } from '../store/authSlice';
import { useAppDispatch } from '../store';
import { locale } from '../locale';

const t = locale.login;

function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1.05fr 0.95fr' },
      }}
    >
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 5,
          color: '#fff',
          background: `
            linear-gradient(160deg, rgba(18, 55, 48, 0.62), rgba(45, 140, 122, 0.72)),
            url(/covers/panda-hike.png)
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              bgcolor: 'rgba(255,255,255,0.2)',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 800,
            }}
          >
            +
          </Box>
          <Typography fontWeight={800} fontSize="1.25rem">
            {t.brand}
          </Typography>
        </Stack>
        <Box sx={{ maxWidth: 420 }}>
          <Typography variant="h3" sx={{ color: '#fff', mb: 2, fontSize: '2.1rem' }}>
            {t.heroTitle}
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.88)', mb: 2, lineHeight: 1.6 }}>
            {t.heroText}
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            {t.techStack}
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)' }}>
          ГК «Иннотех» · учебный MVP
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          placeItems: 'center',
          p: { xs: 2.5, md: 4 },
          background: 'linear-gradient(180deg, #F7F9FC 0%, #EEF2F8 100%)',
        }}
      >
        <Box
          sx={{
            width: 'min(440px, 100%)',
            bgcolor: 'background.paper',
            borderRadius: 4,
            boxShadow: '0 10px 40px rgba(26,29,38,0.08)',
            p: { xs: 3, md: 4 },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [loginName, setLoginName] = useState('employee');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const data = await authApi.login(loginName, password);
      dispatch(setCredentials(data));
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errorFallback);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout>
      <Stack component="form" spacing={2.5} onSubmit={onSubmit}>
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <Typography fontWeight={800} sx={{ mb: 0.5 }}>
            {t.brand}
          </Typography>
        </Box>
        <Box>
          <Typography variant="h4" sx={{ mb: 0.75 }}>
            {t.title}
          </Typography>
          <Typography color="text.secondary">{t.subtitle}</Typography>
        </Box>
        <TextField
          label={t.loginLabel}
          value={loginName}
          onChange={(e) => setLoginName(e.target.value)}
          autoComplete="username"
          fullWidth
        />
        <TextField
          label={t.passwordLabel}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          fullWidth
        />
        {error && <Alert severity="error">{error}</Alert>}
        <Button type="submit" variant="contained" size="large" disabled={busy} fullWidth>
          {busy ? t.submitting : t.submit}
        </Button>
        <Typography variant="body2" color="text.secondary">
          {t.noAccount}{' '}
          <Link component={RouterLink} to="/register" underline="hover" fontWeight={650}>
            {t.registerLink}
          </Link>
        </Typography>
        <Typography variant="caption">{t.demoHint}</Typography>
      </Stack>
    </AuthLayout>
  );
}

export { AuthLayout };
