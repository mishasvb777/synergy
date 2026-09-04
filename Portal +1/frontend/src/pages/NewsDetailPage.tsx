import { FormEvent, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { useAddComment, useNews, useToggleLike } from '../api/hooks';
import { BackButton } from '../components/BackButton';
import { coverForId } from '../data/covers';
import { locale } from '../locale';

const t = locale.newsDetail;

export default function NewsDetailPage() {
  const { id } = useParams();
  const newsId = Number(id);
  const { data: news, isLoading, error } = useNews(newsId);
  const likeMutation = useToggleLike(newsId);
  const commentMutation = useAddComment(newsId);
  const [comment, setComment] = useState('');

  async function sendComment(e: FormEvent) {
    e.preventDefault();
    await commentMutation.mutateAsync(comment);
    setComment('');
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', py: 10 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }
  if (error) return <Alert severity="error">{(error as Error).message}</Alert>;
  if (!news) return null;

  return (
    <Stack spacing={2.5} maxWidth={820}>
      <BackButton />
      <Card sx={{ overflow: 'hidden' }}>
        <Box
          component="img"
          src={coverForId(news.id)}
          alt=""
          sx={{ width: '100%', height: { xs: 200, md: 280 }, objectFit: 'cover', display: 'block', bgcolor: '#E5F2EE' }}
        />
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Typography variant="caption" display="block" sx={{ mb: 1 }}>
            {news.authorName} · {new Date(news.createdAt).toLocaleString('ru-RU')}
          </Typography>
          <Typography variant="h4" sx={{ mb: 2 }}>
            {news.title}
          </Typography>
          <Typography whiteSpace="pre-wrap" sx={{ fontSize: '1.02rem', lineHeight: 1.7, mb: 2.5 }}>
            {news.body}
          </Typography>
          <Button
            variant={news.likedByMe ? 'contained' : 'outlined'}
            disabled={likeMutation.isPending}
            onClick={() => likeMutation.mutate()}
          >
            {news.likedByMe ? t.unlike : t.like} · {news.likesCount}
          </Button>
        </Box>
      </Card>

      <Card sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          {t.commentsTitle}
        </Typography>
        {news.comments.length === 0 && (
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {t.noComments}
          </Typography>
        )}
        <Stack spacing={0}>
          {news.comments.map((c) => (
            <Box key={c.id} sx={{ py: 1.75, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography fontWeight={700} sx={{ mb: 0.5 }}>
                {c.authorName}{' '}
                <Box component="span" sx={{ color: 'text.secondary', fontWeight: 400 }}>
                  · {new Date(c.createdAt).toLocaleString('ru-RU')}
                </Box>
              </Typography>
              <Typography>{c.body}</Typography>
            </Box>
          ))}
        </Stack>

        <Divider sx={{ my: 2.5 }} />

        <Stack component="form" spacing={2} onSubmit={sendComment}>
          <TextField
            multiline
            minRows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t.commentPlaceholder}
            required
          />
          <Button
            type="submit"
            variant="contained"
            disabled={commentMutation.isPending}
            sx={{ alignSelf: 'flex-start' }}
          >
            {t.submit}
          </Button>
          {commentMutation.isError && (
            <Alert severity="error">{(commentMutation.error as Error).message}</Alert>
          )}
        </Stack>
      </Card>
    </Stack>
  );
}
