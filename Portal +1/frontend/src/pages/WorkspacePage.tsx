import { Box, Card, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { PageHeader } from '../components/PageHeader';
import { workspaceLinks } from '../data/portalContent';
import { locale } from '../locale';

const t = locale.workspace;

export default function WorkspacePage() {
  return (
    <Stack spacing={2.5} maxWidth={820}>
      <PageHeader title={t.title} subtitle={t.subtitle} />
      <Card sx={{ p: 1 }}>
        {workspaceLinks.map((link) => (
          <Box
            key={link.path}
            component={RouterLink}
            to={link.path}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
              px: 2,
              py: 2,
              borderRadius: 3,
              color: 'inherit',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <Box>
              <Typography fontWeight={700}>{link.title}</Typography>
              <Typography variant="body2">{link.desc}</Typography>
            </Box>
            <ChevronRightIcon sx={{ color: 'text.secondary' }} />
          </Box>
        ))}
      </Card>
    </Stack>
  );
}
