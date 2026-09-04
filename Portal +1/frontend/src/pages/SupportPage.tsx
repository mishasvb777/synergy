import { FormEvent, useState } from 'react';
import { Alert, Button, Card, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { addItTicket, categoryLabel } from '../data/itTicketsStore';
import { locale } from '../locale';

const t = locale.support;
const it = locale.it;

const topicTitles: Record<string, string> = {
  access: t.topics.access,
  bug: t.topics.bug,
  idea: t.topics.idea,
  other: t.topics.other,
};

const topicToCategory: Record<string, string> = {
  access: 'access',
  bug: 'software',
  idea: 'portal',
  other: 'portal',
};

export default function SupportPage() {
  const [topic, setTopic] = useState('access');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSent(false);
    setError('');
    if (message.trim().length < 10) {
      setError(t.errorShort);
      return;
    }

    addItTicket({
      category: categoryLabel(topicToCategory[topic] || 'portal'),
      title: `[Портал] ${topicTitles[topic] || t.topics.other}`,
      details: message.trim(),
      status: it.statusNew,
      source: 'portal-support',
    });

    setSent(true);
    setMessage('');
  }

  return (
    <Stack spacing={2.5} maxWidth={720}>
      <PageHeader title={t.title} subtitle={t.subtitle} />
      <Card sx={{ p: { xs: 2, md: 3 } }}>
        <Stack spacing={1.5} sx={{ mb: 2.5 }}>
          <Typography fontWeight={700}>{t.contactsTitle}</Typography>
          <Typography variant="body2">{t.email}</Typography>
          <Typography variant="body2">{t.hours}</Typography>
        </Stack>
        <Stack component="form" spacing={2} onSubmit={onSubmit} noValidate>
          <TextField select label={t.topicLabel} value={topic} onChange={(e) => setTopic(e.target.value)} fullWidth>
            <MenuItem value="access">{t.topics.access}</MenuItem>
            <MenuItem value="bug">{t.topics.bug}</MenuItem>
            <MenuItem value="idea">{t.topics.idea}</MenuItem>
            <MenuItem value="other">{t.topics.other}</MenuItem>
          </TextField>
          <TextField
            label={t.messageLabel}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            multiline
            minRows={4}
            required
            fullWidth
            helperText={t.messageHint}
          />
          <Button type="submit" variant="contained" sx={{ alignSelf: 'flex-start' }}>
            {t.submit}
          </Button>
          {error && <Alert severity="error">{error}</Alert>}
          {sent && (
            <Alert
              severity="success"
              action={
                <Button component={RouterLink} to="/operations/it" color="inherit" size="small">
                  {t.goToIt}
                </Button>
              }
            >
              {t.success}
            </Alert>
          )}
        </Stack>
      </Card>
    </Stack>
  );
}
