import {
  Alert,
  Box,
  Card,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { useMemo } from 'react';
import { PageHeader } from '../components/PageHeader';
import { useFeed } from '../api/hooks';
import { searchablePages } from '../data/portalContent';
import { locale } from '../locale';

const t = locale.search;

export default function SearchPage() {
  const [params] = useSearchParams();
  const q = (params.get('q') || '').trim();
  const { data, isLoading, error } = useFeed();

  const results = useMemo(() => {
    const query = q.toLowerCase();
    if (!query) return { pages: [], news: [] };

    const pages = searchablePages.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        (p.description || '').toLowerCase().includes(query)
    );

    const news =
      data?.items.filter(
        (item) =>
          item.title.toLowerCase().includes(query) || item.body.toLowerCase().includes(query)
      ) ?? [];

    return { pages, news };
  }, [q, data]);

  return (
    <Stack spacing={2.5} maxWidth={860}>
      <PageHeader
        title={q ? t.titleWithQuery(q) : t.title}
        subtitle={t.subtitle}
      />

      {!q && <Alert severity="info">{t.emptyQuery}</Alert>}

      {q && isLoading && (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 6 }}>
          <CircularProgress size={28} />
        </Box>
      )}

      {error && <Alert severity="error">{(error as Error).message}</Alert>}

      {q && !isLoading && (
        <>
          <Typography color="text.secondary">
            {t.found(results.pages.length + results.news.length)}
          </Typography>

          {results.pages.length > 0 && (
            <Card sx={{ p: 1 }}>
              <Typography fontWeight={750} sx={{ px: 2, pt: 1.5, pb: 1 }}>
                {t.sections}
              </Typography>
              {results.pages.map((page) => (
                <Box
                  key={page.path}
                  component={RouterLink}
                  to={page.path}
                  sx={{
                    display: 'block',
                    px: 2,
                    py: 1.5,
                    borderRadius: 2,
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <Typography fontWeight={700}>{page.title}</Typography>
                  <Typography variant="body2">{page.description}</Typography>
                </Box>
              ))}
            </Card>
          )}

          {results.news.length > 0 && (
            <Card sx={{ p: 1 }}>
              <Typography fontWeight={750} sx={{ px: 2, pt: 1.5, pb: 1 }}>
                {t.news}
              </Typography>
              {results.news.map((item) => (
                <Box
                  key={item.id}
                  component={RouterLink}
                  to={`/news/${item.id}`}
                  sx={{
                    display: 'block',
                    px: 2,
                    py: 1.5,
                    borderRadius: 2,
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <Typography fontWeight={700}>{item.title}</Typography>
                  <Typography variant="body2">
                    {item.body.slice(0, 120)}
                    {item.body.length > 120 ? '…' : ''}
                  </Typography>
                </Box>
              ))}
            </Card>
          )}

          {results.pages.length === 0 && results.news.length === 0 && (
            <Alert severity="warning">{t.nothing}</Alert>
          )}
        </>
      )}
    </Stack>
  );
}
