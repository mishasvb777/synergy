import { Alert, Avatar, Box, Card, CircularProgress, Stack, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { AuthedImage } from '../components/AuthedImage';
import { BackButton } from '../components/BackButton';
import { useActivityPost } from '../api/hooks';
import { communityById, formatRelativeRu } from '../data/activityStore';
import { locale } from '../locale';

const t = locale.activity;

export default function ActivityPostPage() {
  const { id } = useParams();
  const postId = Number(id);
  const { data: post, isLoading, error } = useActivityPost(postId);

  if (isLoading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', py: 10 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (error) {
    return (
      <Stack spacing={2} maxWidth={720}>
        <BackButton fallback="/activity" />
        <Alert severity="error">{(error as Error).message}</Alert>
      </Stack>
    );
  }

  if (!post) {
    return (
      <Stack spacing={2} maxWidth={720}>
        <BackButton fallback="/activity" />
        <Alert severity="warning">{t.notFound}</Alert>
      </Stack>
    );
  }

  const community = communityById(post.communityId);

  return (
    <Stack spacing={2.5} maxWidth={720}>
      <BackButton fallback="/activity" />
      <Card sx={{ p: { xs: 2, md: 3 } }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', fontWeight: 700 }}>
            {post.authorName.slice(0, 1)}
          </Avatar>
          <Box>
            <Typography fontWeight={700}>{post.authorName}</Typography>
            <Typography variant="caption">
              {formatRelativeRu(post.createdAt)}
              {community ? ` · ${community.name}` : ''}
            </Typography>
          </Box>
        </Stack>
        <Typography variant="h4" sx={{ mb: 2 }}>
          {post.title}
        </Typography>
        <Typography sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, mb: post.hasImage ? 2 : 0 }}>
          {post.body}
        </Typography>
        {post.hasImage && post.imageUrl && (
          <AuthedImage src={post.imageUrl} height={{ xs: 220, md: 320 }} />
        )}
      </Card>
    </Stack>
  );
}
