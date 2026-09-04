import { Box, Card, Chip, Stack, Typography } from '@mui/material';
import { PageHeader } from '../components/PageHeader';
import { academyCourses } from '../data/portalContent';
import { locale } from '../locale';

const t = locale.academy;

export default function AcademyPage() {
  return (
    <Stack spacing={2.5}>
      <PageHeader title={t.title} subtitle={t.subtitle} />
      <Card
        sx={{
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '280px 1fr' },
        }}
      >
        <Box
          component="img"
          src="/covers/panda-academy.png"
          alt=""
          sx={{ width: '100%', height: { xs: 180, md: '100%' }, objectFit: 'cover' }}
        />
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Typography variant="h5" sx={{ mb: 1 }}>
            {t.heroTitle}
          </Typography>
          <Typography color="text.secondary">{t.heroText}</Typography>
        </Box>
      </Card>
      <Stack spacing={1.5}>
        {academyCourses.map((course) => (
          <Card key={course.id} sx={{ p: 2.5 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
              <Box>
                <Typography fontWeight={750}>{course.title}</Typography>
                <Typography variant="body2">
                  {t.duration}: {course.duration}
                </Typography>
              </Box>
              <Chip label={course.level} color="primary" variant="outlined" />
            </Stack>
          </Card>
        ))}
      </Stack>
    </Stack>
  );
}
