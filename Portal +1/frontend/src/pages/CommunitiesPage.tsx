import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { PageHeader } from '../components/PageHeader';
import {
  ALL_COMMUNITIES,
  joinCommunity,
  leaveCommunity,
  loadMyCommunityIds,
} from '../data/activityStore';
import { locale } from '../locale';

const t = locale.communities;

export default function CommunitiesPage() {
  const [query, setQuery] = useState('');
  const [myIds, setMyIds] = useState<number[]>(() => loadMyCommunityIds());

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_COMMUNITIES;
    return ALL_COMMUNITIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.topic.toLowerCase().includes(q)
    );
  }, [query]);

  function toggle(id: number, joined: boolean) {
    setMyIds(joined ? leaveCommunity(id) : joinCommunity(id));
  }

  return (
    <Stack spacing={2.5}>
      <PageHeader title={t.title} subtitle={t.subtitle} />

      <TextField
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t.searchPlaceholder}
        fullWidth
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: 'text.secondary' }} />
            </InputAdornment>
          ),
        }}
        sx={{ maxWidth: 480, '& .MuiOutlinedInput-root': { borderRadius: 999 } }}
      />

      <Typography variant="body2" color="text.secondary">
        {t.myCount(myIds.length)}
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' },
        }}
      >
        {filtered.map((c) => {
          const joined = myIds.includes(c.id);
          return (
            <Card key={c.id} sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography fontWeight={750}>{c.name}</Typography>
              <Typography variant="body2" sx={{ flex: 1 }}>
                {c.topic}
              </Typography>
              <Typography variant="caption">
                {t.members}: {c.members}
              </Typography>
              <Button
                variant={joined ? 'outlined' : 'contained'}
                onClick={() => toggle(c.id, joined)}
                sx={{ alignSelf: 'flex-start', mt: 0.5 }}
              >
                {joined ? t.leave : t.join}
              </Button>
            </Card>
          );
        })}
      </Box>

      {filtered.length === 0 && (
        <Typography color="text.secondary">{t.nothing}</Typography>
      )}
    </Stack>
  );
}
