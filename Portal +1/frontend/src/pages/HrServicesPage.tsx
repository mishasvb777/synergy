import { FormEvent, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useAppSelector } from '../store';
import { PageHeader } from '../components/PageHeader';
import { locale } from '../locale';

const t = locale.hr;

type RequestItem = {
  id: number;
  type: string;
  period: string;
  status: string;
  note: string;
};

type FieldErrors = {
  from?: string;
  to?: string;
  note?: string;
};

const STORAGE_KEY = 'portal_plus1_hr_requests';

function isValidRequest(item: RequestItem): boolean {
  return Boolean(item.period && item.period !== '—' && item.note?.trim());
}

function loadRequests(): RequestItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as RequestItem[]) : [];
    const valid = parsed.filter(isValidRequest);
    if (valid.length !== parsed.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
    }
    return valid;
  } catch {
    return [];
  }
}

function typeLabel(type: string): string {
  if (type === 'vacation') return t.types.vacation;
  if (type === 'certificate') return t.types.certificate;
  return t.types.profile;
}

export default function HrServicesPage() {
  const user = useAppSelector((s) => s.auth.user);
  const [requests, setRequests] = useState<RequestItem[]>(() => loadRequests());
  const [type, setType] = useState('vacation');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState('');

  const profile = useMemo(
    () => ({
      fullName: user?.fullName ?? '—',
      login: user?.login ?? '—',
      role: user?.roleName ?? '—',
      department: t.departmentValue,
    }),
    [user]
  );

  const needsPeriod = type === 'vacation' || type === 'certificate';

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (needsPeriod) {
      if (!from) next.from = t.errors.fromRequired;
      if (!to) next.to = t.errors.toRequired;
      if (from && to && from > to) next.to = t.errors.toBeforeFrom;
    }
    if (!note.trim()) next.note = t.errors.noteRequired;
    else if (note.trim().length < 5) next.note = t.errors.noteShort;
    return next;
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage('');
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const item: RequestItem = {
      id: Date.now(),
      type: typeLabel(type),
      period: needsPeriod ? `${from} — ${to}` : t.noPeriod,
      status: t.statusPending,
      note: note.trim(),
    };
    const next = [item, ...requests];
    setRequests(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setMessage(t.success);
    setFrom('');
    setTo('');
    setNote('');
    setErrors({});
  }

  return (
    <Stack spacing={2.5} maxWidth={820}>
      <PageHeader title={t.title} subtitle={t.subtitle} fallback="/operations" />

      <Card sx={{ p: { xs: 2, md: 3 } }}>
        <Typography fontWeight={700} sx={{ mb: 2 }}>
          {t.profileTitle}
        </Typography>
        <Stack spacing={1.25}>
          <Typography>
            <Box component="span" color="text.secondary">
              {t.fullName} ·{' '}
            </Box>
            {profile.fullName}
          </Typography>
          <Typography>
            <Box component="span" color="text.secondary">
              {t.login} ·{' '}
            </Box>
            {profile.login}
          </Typography>
          <Typography>
            <Box component="span" color="text.secondary">
              {t.role} ·{' '}
            </Box>
            {profile.role}
          </Typography>
          <Typography>
            <Box component="span" color="text.secondary">
              {t.departmentLabel} ·{' '}
            </Box>
            {profile.department}
          </Typography>
        </Stack>
      </Card>

      <Card sx={{ p: { xs: 2, md: 3 } }}>
        <Typography fontWeight={700} sx={{ mb: 2 }}>
          {t.newRequestTitle}
        </Typography>
        <Stack component="form" spacing={2} onSubmit={onSubmit} noValidate>
          <TextField
            select
            label={t.typeLabel}
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setErrors({});
              setMessage('');
            }}
            fullWidth
          >
            <MenuItem value="vacation">{t.types.vacation}</MenuItem>
            <MenuItem value="certificate">{t.types.certificate}</MenuItem>
            <MenuItem value="profile">{t.types.profile}</MenuItem>
          </TextField>
          {needsPeriod && (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label={t.dateFrom}
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
                error={Boolean(errors.from)}
                helperText={errors.from}
                fullWidth
              />
              <TextField
                label={t.dateTo}
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
                error={Boolean(errors.to)}
                helperText={errors.to}
                fullWidth
              />
            </Stack>
          )}
          <TextField
            label={t.noteLabel}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            multiline
            minRows={3}
            required
            error={Boolean(errors.note)}
            helperText={errors.note || t.noteHint}
            fullWidth
          />
          <Button type="submit" variant="contained" sx={{ alignSelf: 'flex-start' }}>
            {t.submit}
          </Button>
          {Object.keys(errors).length > 0 && <Alert severity="error">{t.errors.formIncomplete}</Alert>}
          {message && <Alert severity="success">{message}</Alert>}
        </Stack>
      </Card>

      <Card sx={{ p: { xs: 2, md: 3 } }}>
        <Typography fontWeight={700} sx={{ mb: 1 }}>
          {t.myRequests}
        </Typography>
        {requests.length === 0 && <Typography color="text.secondary">{t.emptyRequests}</Typography>}
        {requests.map((r) => (
          <Box key={r.id} sx={{ py: 2, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 0, pb: 0 } }}>
            <Typography fontWeight={650}>{r.type}</Typography>
            <Typography variant="body2">
              {r.period} · {r.status}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {r.note}
            </Typography>
          </Box>
        ))}
      </Card>
    </Stack>
  );
}
