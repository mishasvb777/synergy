import { FormEvent, useState } from 'react';
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
import { PageHeader } from '../components/PageHeader';
import { addItTicket, categoryLabel, loadItTickets, type ItTicket } from '../data/itTicketsStore';
import { locale } from '../locale';

const t = locale.it;

type FieldErrors = {
  title?: string;
  details?: string;
};

export default function ItSupportPage() {
  const [tickets, setTickets] = useState<ItTicket[]>(() => loadItTickets());
  const [category, setCategory] = useState('access');
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState('');

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (!title.trim()) next.title = t.errors.titleRequired;
    else if (title.trim().length < 3) next.title = t.errors.titleShort;
    if (!details.trim()) next.details = t.errors.detailsRequired;
    else if (details.trim().length < 10) next.details = t.errors.detailsShort;
    return next;
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage('');
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    addItTicket({
      category: categoryLabel(category),
      title: title.trim(),
      details: details.trim(),
      status: t.statusNew,
      source: 'it',
    });
    setTickets(loadItTickets());
    setMessage(t.success);
    setTitle('');
    setDetails('');
    setErrors({});
  }

  return (
    <Stack spacing={2.5} maxWidth={820}>
      <PageHeader title={t.title} subtitle={t.subtitle} fallback="/operations" />

      <Card sx={{ p: { xs: 2, md: 3 } }}>
        <Typography fontWeight={700} sx={{ mb: 2 }}>
          {t.newTicketTitle}
        </Typography>
        <Stack component="form" spacing={2} onSubmit={onSubmit} noValidate>
          <TextField
            select
            label={t.categoryLabel}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            fullWidth
          >
            <MenuItem value="access">{t.categories.access}</MenuItem>
            <MenuItem value="hardware">{t.categories.hardware}</MenuItem>
            <MenuItem value="software">{t.categories.software}</MenuItem>
            <MenuItem value="portal">{t.categories.portal}</MenuItem>
          </TextField>
          <TextField
            label={t.titleLabel}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            error={Boolean(errors.title)}
            helperText={errors.title}
            fullWidth
          />
          <TextField
            label={t.detailsLabel}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            multiline
            minRows={4}
            required
            error={Boolean(errors.details)}
            helperText={errors.details || t.detailsHint}
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
          {t.myTickets}
        </Typography>
        {tickets.map((ticket) => (
          <Box
            key={ticket.id}
            sx={{
              py: 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
              '&:last-child': { borderBottom: 0, pb: 0 },
            }}
          >
            <Typography fontWeight={650}>{ticket.title}</Typography>
            <Typography variant="body2">
              {ticket.category} · {ticket.status}
              {ticket.source === 'portal-support' ? ` · ${t.sourcePortal}` : ''}
            </Typography>
            {ticket.details && (
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {ticket.details}
              </Typography>
            )}
          </Box>
        ))}
      </Card>
    </Stack>
  );
}
