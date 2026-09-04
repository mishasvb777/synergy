import { FormEvent, useState } from 'react';
import {
  Alert,
  Button,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { authApi } from '../api/client';
import { AuthLayout } from './LoginPage';
import { locale } from '../locale';

const t = locale.register;

export default function RegisterPage() {
  const [loginName, setLoginName] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{
    email: string;
    confirmUrl?: string;
    previewUrl?: string;
  } | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== password2) {
      setError(t.passwordMismatch);
      return;
    }
    setBusy(true);
    try {
      const data = await authApi.register({
        login: loginName,
        email,
        fullName,
        password,
      });
      setDone({
        email: data.email,
        confirmUrl: data.confirmUrl,
        previewUrl: data.previewUrl,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errorFallback);
    } finally {
      setBusy(false);
    }
  }

  async function onResend() {
    if (!done?.email) return;
    setBusy(true);
    setError('');
    try {
      const data = await authApi.resendConfirmation(done.email);
      setDone({
        email: done.email,
        confirmUrl: data.confirmUrl || done.confirmUrl,
        previewUrl: data.previewUrl || done.previewUrl,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errorFallback);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout>
      {done ? (
        <Stack spacing={2}>
          <Typography variant="h4">{t.successTitle}</Typography>
          <Typography color="text.secondary">
            {t.successText} <b>{done.email}</b>
          </Typography>
          <Alert severity="info">{t.demoMailHint}</Alert>
          {done.confirmUrl && (
            <Button
              component={RouterLink}
              to={done.confirmUrl.includes('/confirm-email')
                ? done.confirmUrl.slice(done.confirmUrl.indexOf('/confirm-email'))
                : '/confirm-email'}
              variant="contained"
            >
              {t.openConfirm}
            </Button>
          )}
          {done.previewUrl && (
            <Button href={done.previewUrl} target="_blank" rel="noreferrer" variant="outlined">
              Ethereal preview
            </Button>
          )}
          <Button variant="text" disabled={busy} onClick={() => void onResend()}>
            {t.resend}
          </Button>
          <Typography variant="body2">
            <Link component={RouterLink} to="/login" underline="hover" fontWeight={650}>
              {t.loginLink}
            </Link>
          </Typography>
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      ) : (
        <Stack component="form" spacing={2} onSubmit={onSubmit}>
          <Typography variant="h4">{t.title}</Typography>
          <Typography color="text.secondary" sx={{ mb: 0.5 }}>
            {t.subtitle}
          </Typography>
          <TextField
            label={t.loginLabel}
            value={loginName}
            onChange={(e) => setLoginName(e.target.value)}
            required
            fullWidth
            helperText="латиница, 3–32 символа"
          />
          <TextField
            label={t.emailLabel}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label={t.fullNameLabel}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label={t.passwordLabel}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label={t.passwordRepeatLabel}
            type="password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            required
            fullWidth
          />
          {error && <Alert severity="error">{error}</Alert>}
          <Button type="submit" variant="contained" size="large" disabled={busy} fullWidth>
            {busy ? t.submitting : t.submit}
          </Button>
          <Typography variant="body2" color="text.secondary">
            {t.haveAccount}{' '}
            <Link component={RouterLink} to="/login" underline="hover" fontWeight={650}>
              {t.loginLink}
            </Link>
          </Typography>
        </Stack>
      )}
    </AuthLayout>
  );
}
