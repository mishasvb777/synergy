import { useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { authApi } from '../api/client';
import { AuthLayout } from './LoginPage';
import { locale } from '../locale';

const t = locale.confirmEmail;

export default function ConfirmEmailPage() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [status, setStatus] = useState<'loading' | 'ok' | 'already' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    async function run() {
      if (!token) {
        setStatus('error');
        setMessage(t.errorFallback);
        return;
      }
      try {
        const data = await authApi.confirmEmail(token);
        setMessage(data.message);
        setStatus(data.alreadyVerified ? 'already' : 'ok');
      } catch (err) {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : t.errorFallback);
      }
    }
    void run();
  }, [token]);

  return (
    <AuthLayout>
      <Stack spacing={2}>
        <Typography variant="h4">{t.title}</Typography>
        {status === 'loading' && (
          <Box sx={{ display: 'grid', placeItems: 'center', py: 4 }}>
            <CircularProgress size={28} />
            <Typography color="text.secondary" sx={{ mt: 2 }}>
              {t.loading}
            </Typography>
          </Box>
        )}
        {status === 'ok' && <Alert severity="success">{message || t.success}</Alert>}
        {status === 'already' && <Alert severity="info">{message || t.already}</Alert>}
        {status === 'error' && (
          <Alert severity="error">
            {message || t.errorFallback}
            <Typography variant="body2" sx={{ mt: 1 }}>
              Если вы уже нажимали ссылку раньше — попробуйте просто войти. Иначе зарегистрируйтесь
              заново или запросите письмо повторно.
            </Typography>
          </Alert>
        )}
        {status !== 'loading' && (
          <Button component={RouterLink} to="/login" variant="contained">
            {t.toLogin}
          </Button>
        )}
      </Stack>
    </AuthLayout>
  );
}
