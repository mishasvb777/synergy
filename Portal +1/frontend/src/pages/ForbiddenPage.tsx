import { Button, Card, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { BackButton } from '../components/BackButton';
import { locale } from '../locale';

const t = locale.forbidden;

export default function ForbiddenPage() {
  return (
    <Card sx={{ p: { xs: 3, md: 4 }, maxWidth: 480 }}>
      <Stack spacing={2} alignItems="flex-start">
        <BackButton />
        <Typography variant="h4">{t.title}</Typography>
        <Typography color="text.secondary">{t.text}</Typography>
        <Button component={RouterLink} to="/" variant="contained">
          {t.backToFeed}
        </Button>
      </Stack>
    </Card>
  );
}
