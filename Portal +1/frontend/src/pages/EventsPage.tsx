import { Box, Card, Chip, Stack, Typography } from '@mui/material';
import { PageHeader } from '../components/PageHeader';
import { events } from '../data/portalContent';
import { locale } from '../locale';

const t = locale.events;

export default function EventsPage() {
  return (
    <Stack spacing={2.5}>
      <PageHeader title={t.title} subtitle={t.subtitle} />
      <Stack spacing={2}>
        {events.map((event) => (
          <Card key={event.id} sx={{ p: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '180px 1fr' }, gap: 2 }}>
            <Box
              component="img"
              src={event.cover}
              alt=""
              sx={{ width: '100%', height: { xs: 160, sm: 120 }, objectFit: 'cover', borderRadius: 3 }}
            />
            <Stack spacing={1} justifyContent="center">
              <Stack direction="row" justifyContent="space-between" gap={1} flexWrap="wrap">
                <Typography variant="h6">{event.title}</Typography>
                <Typography variant="caption">{event.when}</Typography>
              </Stack>
              <Typography variant="body2">{event.summary}</Typography>
              <Typography variant="caption">{event.place}</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {event.tags.map((tag) => (
                  <Chip key={tag} label={tag} size="small" color="primary" variant="outlined" />
                ))}
              </Stack>
            </Stack>
          </Card>
        ))}
      </Stack>
    </Stack>
  );
}
