import {
  Alert,
  Box,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { Link as RouterLink } from 'react-router-dom';
import { useFeed } from '../api/hooks';
import { useAppSelector } from '../store';
import { locale } from '../locale';
import { coverForId, coverForIndex } from '../data/covers';
import type { NewsItem } from '../types';

const t = locale.feed;

function NewsCover({ item, index, featured = false }: { item: NewsItem; index: number; featured?: boolean }) {
  const src = coverForId(item.id) || coverForIndex(index);
  return (
    <Box
      sx={{
        height: featured ? { xs: 200, md: 260 } : { xs: 140, md: 168 },
        position: 'relative',
        overflow: 'hidden',
        bgcolor: '#E5F2EE',
      }}
    >
      <Box
        component="img"
        src={src}
        alt=""
        sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    </Box>
  );
}

function MetaRow({ item }: { item: NewsItem }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ color: 'text.secondary' }}>
      <Stack direction="row" spacing={0.5} alignItems="center">
        <VisibilityOutlinedIcon sx={{ fontSize: 16 }} />
        <Typography variant="caption">{t.views(item.commentsCount * 12 + 40)}</Typography>
      </Stack>
      <Stack direction="row" spacing={0.5} alignItems="center">
        <FavoriteBorderIcon sx={{ fontSize: 16 }} />
        <Typography variant="caption">{t.reactions(item.likesCount)}</Typography>
      </Stack>
      <Stack direction="row" spacing={0.5} alignItems="center">
        <ChatBubbleOutlineIcon sx={{ fontSize: 16 }} />
        <Typography variant="caption">{t.comments(item.commentsCount)}</Typography>
      </Stack>
    </Stack>
  );
}

function NewsCard({ item, index, featured = false }: { item: NewsItem; index: number; featured?: boolean }) {
  return (
    <Card sx={{ height: '100%', overflow: 'hidden' }}>
      <CardActionArea
        component={RouterLink}
        to={`/news/${item.id}`}
        sx={{ height: '100%', alignItems: 'stretch', display: 'flex', flexDirection: 'column' }}
      >
        <NewsCover item={item} index={index} featured={featured} />
        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1, p: 2 }}>
          <Typography variant="caption">
            {new Date(item.createdAt).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Typography>
          <Typography variant={featured ? 'h6' : 'subtitle1'} sx={{ lineHeight: 1.3 }}>
            {item.title}
          </Typography>
          <Typography variant="body2" sx={{ flex: 1 }}>
            {item.body.slice(0, featured ? 140 : 90)}
            {item.body.length > (featured ? 140 : 90) ? '…' : ''}
          </Typography>
          <Typography variant="caption" color="primary.main" fontWeight={650}>
            {t.categoryDefault}
          </Typography>
          <MetaRow item={item} />
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default function FeedPage() {
  const user = useAppSelector((s) => s.auth.user);
  const firstName = user?.fullName?.split(' ')[1] || user?.fullName || 'коллега';
  const { data, isLoading, error } = useFeed();

  if (isLoading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', py: 10 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }
  if (error) return <Alert severity="error">{(error as Error).message}</Alert>;
  if (!data) return null;

  const [featured, ...rest] = data.items;
  const discussed = [...data.items].sort((a, b) => b.commentsCount - a.commentsCount).slice(0, 4);
  const liked = [...data.items].sort((a, b) => b.likesCount - a.likesCount).slice(0, 4);

  return (
    <Stack spacing={3}>
      <Typography variant="h4">{t.greeting(firstName)}</Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 280px' },
          gap: 2.5,
          alignItems: 'start',
        }}
      >
        <Stack spacing={2.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">{t.companyNews}</Typography>
            <Link component={RouterLink} to="/" underline="none" color="primary" fontWeight={650}>
              {t.allNews}
            </Link>
          </Stack>

          {featured && <NewsCard item={featured} index={0} featured />}

          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', xl: '1fr 1fr 1fr' },
            }}
          >
            {rest.map((item, idx) => (
              <NewsCard key={item.id} item={item} index={idx + 1} />
            ))}
          </Box>
        </Stack>

        <Stack spacing={2} sx={{ display: { xs: 'none', lg: 'flex' } }}>
          <Card sx={{ p: 2 }}>
            <Typography fontWeight={750} sx={{ mb: 1.5 }}>
              {t.mostDiscussed}
            </Typography>
            <Stack spacing={1.5}>
              {discussed.map((item) => (
                <Box
                  key={`d-${item.id}`}
                  component={RouterLink}
                  to={`/news/${item.id}`}
                  sx={{
                    display: 'block',
                    pb: 1.5,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': { borderBottom: 0, pb: 0 },
                    '&:hover': { opacity: 0.75 },
                  }}
                >
                  <Typography variant="caption" display="block" sx={{ mb: 0.4 }}>
                    {new Date(item.createdAt).toLocaleDateString('ru-RU')}
                  </Typography>
                  <Typography variant="body2" fontWeight={650} color="text.primary">
                    {item.title}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Card>

          <Card sx={{ p: 2 }}>
            <Typography fontWeight={750} sx={{ mb: 1.5 }}>
              {t.mostLiked}
            </Typography>
            <Stack spacing={1.5}>
              {liked.map((item) => (
                <Box
                  key={`l-${item.id}`}
                  component={RouterLink}
                  to={`/news/${item.id}`}
                  sx={{
                    display: 'block',
                    pb: 1.5,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': { borderBottom: 0, pb: 0 },
                    '&:hover': { opacity: 0.75 },
                  }}
                >
                  <Typography variant="caption" display="block" sx={{ mb: 0.4 }}>
                    {new Date(item.createdAt).toLocaleDateString('ru-RU')}
                  </Typography>
                  <Typography variant="body2" fontWeight={650} color="text.primary">
                    {item.title}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Card>
        </Stack>
      </Box>
    </Stack>
  );
}
