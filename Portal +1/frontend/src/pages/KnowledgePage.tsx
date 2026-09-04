import { Button, Card, Stack, Typography } from '@mui/material';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import { PageHeader } from '../components/PageHeader';
import { knowledgeArticles } from '../data/portalContent';
import { locale } from '../locale';

const t = locale.knowledge;

export default function KnowledgePage() {
  return (
    <Stack spacing={2.5} maxWidth={860}>
      <PageHeader title={t.title} subtitle={t.subtitle} />
      <Card sx={{ p: 1 }}>
        {knowledgeArticles.map((article) => (
          <Stack
            key={article.id}
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            justifyContent="space-between"
            sx={{
              px: 2,
              py: 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
              '&:last-child': { borderBottom: 0 },
            }}
          >
            <Stack spacing={0.5} sx={{ minWidth: 0, flex: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <PictureAsPdfOutlinedIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                <Typography fontWeight={700}>{article.title}</Typography>
              </Stack>
              <Typography variant="body2">{article.summary}</Typography>
              <Typography variant="caption">
                {article.category} · {t.updated} {article.updated} · {t.pdfHint}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
              <Button
                variant="outlined"
                size="small"
                href={article.file}
                target="_blank"
                rel="noreferrer"
              >
                {t.openPdf}
              </Button>
              <Button
                variant="contained"
                size="small"
                href={article.file}
                download
              >
                {t.downloadPdf}
              </Button>
            </Stack>
          </Stack>
        ))}
      </Card>
    </Stack>
  );
}
