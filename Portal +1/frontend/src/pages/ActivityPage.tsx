import { FormEvent, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import PhotoOutlinedIcon from '@mui/icons-material/PhotoOutlined';
import { Link as RouterLink } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { AuthedImage } from '../components/AuthedImage';
import { useActivityFeed, useCreateActivityPost } from '../api/hooks';
import {
  ALL_COMMUNITIES,
  communityById,
  fileToBase64,
  formatRelativeRu,
  leaveCommunity,
  loadMyCommunityIds,
} from '../data/activityStore';
import { useAppSelector } from '../store';
import { locale } from '../locale';
import type { ActivityType } from '../types';

const t = locale.activity;

type FilterKey = 'all' | ActivityType;

const filterMap: { key: FilterKey; label: string }[] = [
  { key: 'all', label: t.filters.all },
  { key: 'post', label: t.filters.posts },
  { key: 'article', label: t.filters.articles },
  { key: 'thanks', label: t.filters.thanks },
  { key: 'news', label: t.filters.news },
];

export default function ActivityPage() {
  const user = useAppSelector((s) => s.auth.user);
  const { data: posts = [], isLoading, error } = useActivityFeed();
  const createPost = useCreateActivityPost();
  const [myIds, setMyIds] = useState<number[]>(() => loadMyCommunityIds());
  const [filter, setFilter] = useState<FilterKey>('all');
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState<ActivityType>('post');
  const [communityId, setCommunityId] = useState<number | ''>('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  const myCommunities = useMemo(
    () => ALL_COMMUNITIES.filter((c) => myIds.includes(c.id)),
    [myIds]
  );

  const visiblePosts = useMemo(() => {
    if (filter === 'all') return posts;
    return posts.filter((p) => p.type === filter);
  }, [posts, filter]);

  function openCompose() {
    setTitle('');
    setBody('');
    setType('post');
    setCommunityId(myIds[0] ?? '');
    setImagePreview(null);
    setImageBase64(null);
    setImageMime(null);
    setFormError('');
    setOpen(true);
  }

  async function onPickImage(file: File | null) {
    if (!file) {
      setImagePreview(null);
      setImageBase64(null);
      setImageMime(null);
      return;
    }
    if (!file.type.startsWith('image/')) {
      setFormError(t.errors.imageType);
      return;
    }
    if (file.size > 2.5 * 1024 * 1024) {
      setFormError(t.errors.imageSize);
      return;
    }
    const { base64, mime } = await fileToBase64(file);
    setImageBase64(base64);
    setImageMime(mime);
    setImagePreview(URL.createObjectURL(file));
    setFormError('');
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError('');
    if (title.trim().length < 3) {
      setFormError(t.errors.titleShort);
      return;
    }
    if (body.trim().length < 10) {
      setFormError(t.errors.bodyShort);
      return;
    }
    try {
      await createPost.mutateAsync({
        title: title.trim(),
        body: body.trim(),
        type,
        communityId: communityId === '' ? null : Number(communityId),
        imageBase64,
        imageMime,
      });
      setOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t.errors.saveFailed);
    }
  }

  function onLeave(id: number) {
    setMyIds(leaveCommunity(id));
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 280px' },
        gap: 2.5,
        alignItems: 'start',
      }}
    >
      <Stack spacing={2.5}>
        <PageHeader title={t.title} subtitle={t.subtitle} />

        <Card
          onClick={openCompose}
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            cursor: 'pointer',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            {(user?.fullName || 'Я').slice(0, 1)}
          </Avatar>
          <Typography color="text.secondary" sx={{ flex: 1 }}>
            {t.compose}
          </Typography>
          <Button
            variant="contained"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              openCompose();
            }}
          >
            {t.write}
          </Button>
        </Card>

        {isLoading && (
          <Box sx={{ display: 'grid', placeItems: 'center', py: 6 }}>
            <CircularProgress size={28} />
          </Box>
        )}
        {error && <Alert severity="error">{(error as Error).message}</Alert>}

        {!isLoading && visiblePosts.length === 0 && (
          <Alert severity="info">{t.emptyFeed}</Alert>
        )}

        {visiblePosts.map((post) => {
          const community = communityById(post.communityId);
          const preview =
            post.body.length > 220 ? `${post.body.slice(0, 220)}…` : post.body;
          return (
            <Card key={post.id} sx={{ p: { xs: 2, md: 2.5 } }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
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
              <Typography variant="h6" sx={{ mb: 1 }}>
                {post.title}
              </Typography>
              <Typography sx={{ mb: 1.5, whiteSpace: 'pre-wrap' }}>{preview}</Typography>
              {post.hasImage && post.imageUrl && (
                <Box sx={{ mb: 1.5 }}>
                  <AuthedImage src={post.imageUrl} height={{ xs: 180, md: 220 }} />
                </Box>
              )}
              <Link
                component={RouterLink}
                to={`/activity/${post.id}`}
                underline="none"
                fontWeight={650}
              >
                {t.more}
              </Link>
            </Card>
          );
        })}
      </Stack>

      <Stack spacing={2}>
        <Card sx={{ p: 2 }}>
          <Typography fontWeight={750} sx={{ mb: 1.5 }}>
            {t.filtersTitle}
          </Typography>
          <Stack spacing={0.5}>
            {filterMap.map((f) => (
              <Typography
                key={f.key}
                variant="body2"
                onClick={() => setFilter(f.key)}
                sx={{
                  cursor: 'pointer',
                  py: 0.6,
                  px: 1,
                  borderRadius: 1.5,
                  fontWeight: filter === f.key ? 700 : 500,
                  color: filter === f.key ? 'primary.main' : 'text.secondary',
                  bgcolor: filter === f.key ? 'primary.light' : 'transparent',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                {f.label}
              </Typography>
            ))}
          </Stack>
        </Card>

        <Card sx={{ p: 2 }}>
          <Typography fontWeight={750} sx={{ mb: 0.75 }}>
            {t.myCommunities}
          </Typography>
          <Typography variant="caption" display="block" sx={{ mb: 1.5 }}>
            {t.myCommunitiesHint}
          </Typography>
          {myCommunities.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {t.noCommunities}
            </Typography>
          )}
          <Stack spacing={1.25}>
            {myCommunities.map((c) => (
              <Box
                key={c.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 1,
                  alignItems: 'flex-start',
                }}
              >
                <Box>
                  <Typography fontWeight={650}>{c.name}</Typography>
                  <Typography variant="caption">{c.topic}</Typography>
                </Box>
                <Button size="small" color="inherit" onClick={() => onLeave(c.id)} sx={{ minWidth: 0, px: 1 }}>
                  {t.leave}
                </Button>
              </Box>
            ))}
          </Stack>
          <Link
            component={RouterLink}
            to="/communities"
            underline="none"
            fontWeight={650}
            sx={{ display: 'inline-block', mt: 1.5 }}
          >
            {t.findCommunities}
          </Link>
        </Card>
      </Stack>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t.composeTitle}</DialogTitle>
        <Box component="form" onSubmit={onSubmit}>
          <DialogContent sx={{ display: 'grid', gap: 2, pt: 1 }}>
            <TextField
              select
              label={t.typeLabel}
              value={type}
              onChange={(e) => setType(e.target.value as ActivityType)}
              fullWidth
            >
              <MenuItem value="post">{t.filters.posts}</MenuItem>
              <MenuItem value="article">{t.filters.articles}</MenuItem>
              <MenuItem value="thanks">{t.filters.thanks}</MenuItem>
            </TextField>
            <TextField
              select
              label={t.communityLabel}
              value={communityId}
              onChange={(e) => setCommunityId(e.target.value === '' ? '' : Number(e.target.value))}
              fullWidth
            >
              <MenuItem value="">{t.noCommunity}</MenuItem>
              {ALL_COMMUNITIES.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label={t.titleLabel}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label={t.bodyLabel}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              fullWidth
              multiline
              minRows={4}
            />
            <Stack spacing={1}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<PhotoOutlinedIcon />}
                sx={{ alignSelf: 'flex-start' }}
              >
                {t.addPhoto}
                <input
                  hidden
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e) => void onPickImage(e.target.files?.[0] ?? null)}
                />
              </Button>
              {imagePreview && (
                <Box
                  component="img"
                  src={imagePreview}
                  alt=""
                  sx={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 2 }}
                />
              )}
              {imagePreview && (
                <Button size="small" onClick={() => void onPickImage(null)} sx={{ alignSelf: 'flex-start' }}>
                  {t.removePhoto}
                </Button>
              )}
            </Stack>
            {formError && <Alert severity="error">{formError}</Alert>}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setOpen(false)}>{locale.common.cancel}</Button>
            <Button type="submit" variant="contained" disabled={createPost.isPending}>
              {createPost.isPending ? t.publishing : t.publish}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
