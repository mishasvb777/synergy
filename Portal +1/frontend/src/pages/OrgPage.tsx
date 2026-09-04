import { Box, Card, Stack, Typography } from '@mui/material';
import { PageHeader } from '../components/PageHeader';
import { orgUnits } from '../data/portalContent';
import { locale } from '../locale';

const t = locale.org;

export default function OrgPage() {
  return (
    <Stack spacing={2.5}>
      <PageHeader title={t.title} subtitle={t.subtitle} />
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' },
        }}
      >
        {orgUnits.map((unit) => (
          <Card key={unit.id} sx={{ p: 2.5 }}>
            <Typography fontWeight={750} sx={{ mb: 1 }}>
              {unit.name}
            </Typography>
            <Typography variant="body2">
              {t.lead}: {unit.lead}
            </Typography>
            <Typography variant="body2">
              {t.people}: {unit.people}
            </Typography>
          </Card>
        ))}
      </Box>
    </Stack>
  );
}
