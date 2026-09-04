import { Alert, Box, Card, CircularProgress, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useMenu } from '../api/hooks';
import { PageHeader } from '../components/PageHeader';
import { locale } from '../locale';

const t = locale.operations;

export default function OperationsPage() {
  const { data: items = [], isLoading, error } = useMenu();

  if (isLoading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', py: 10 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }
  if (error) return <Alert severity="error">{(error as Error).message}</Alert>;

  const ops = [
    t.items.hr,
    t.items.it,
    t.items.news,
    ...items.map((i) => ({ title: i.title, desc: i.code, path: i.path })),
  ];

  return (
    <Stack spacing={2.5} maxWidth={820}>
      <PageHeader title={t.title} subtitle={t.subtitle} />

      <Card sx={{ p: 1 }}>
        {ops.map((op, idx) => (
          <Box
            key={`${op.title}-${idx}`}
            component={RouterLink}
            to={op.path}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 2,
              alignItems: 'center',
              px: 2,
              py: 2,
              borderRadius: 3,
              color: 'inherit',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <Box>
              <Typography fontWeight={700} sx={{ mb: 0.25 }}>
                {op.title}
              </Typography>
              <Typography variant="body2">{op.desc}</Typography>
            </Box>
            <ChevronRightIcon sx={{ color: 'text.secondary' }} />
          </Box>
        ))}
      </Card>
    </Stack>
  );
}
