import { Box, Button, Card, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { benefits } from '../data/portalContent';
import { locale } from '../locale';

const t = locale.benefits;

export default function BenefitsPage() {
  return (
    <Stack spacing={2.5} maxWidth={900}>
      <PageHeader title={t.title} subtitle={t.subtitle} />
      <Card
        sx={{
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '260px 1fr' },
        }}
      >
        <Box
          component="img"
          src="/covers/panda-gift.png"
          alt=""
          sx={{ width: '100%', height: { xs: 180, md: '100%' }, objectFit: 'cover' }}
        />
        <Stack spacing={1.5} sx={{ p: { xs: 2, md: 3 } }} justifyContent="center">
          <Typography variant="h5">{t.heroTitle}</Typography>
          <Typography color="text.secondary">{t.heroText}</Typography>
          <Button component={RouterLink} to="/operations/hr" variant="contained" sx={{ alignSelf: 'flex-start' }}>
            {t.toHr}
          </Button>
        </Stack>
      </Card>
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
        {benefits.map((item) => (
          <Card key={item.id} sx={{ p: 2.5 }}>
            <Typography fontWeight={750} sx={{ mb: 0.75 }}>
              {item.title}
            </Typography>
            <Typography variant="body2">{item.desc}</Typography>
          </Card>
        ))}
      </Box>
    </Stack>
  );
}
