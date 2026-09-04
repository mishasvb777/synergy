import { FormEvent, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useNewsManage, useSaveNews } from '../api/hooks';
import type { NewsItem } from '../types';
import { PageHeader } from '../components/PageHeader';
import { locale } from '../locale';

const t = locale.newsManage;

const empty = { title: '', body: '', isPublished: true };

export default function NewsManagePage() {
  const { data: items = [], isLoading, error } = useNewsManage();
  const saveMutation = useSaveNews();
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  function startEdit(item: NewsItem) {
    setEditId(item.id);
    setForm({ title: item.title, body: item.body, isPublished: item.isPublished });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage('');
    await saveMutation.mutateAsync({ id: editId ?? undefined, ...form });
    setMessage(editId ? t.updated : t.created);
    setForm(empty);
    setEditId(null);
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', py: 10 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }
  if (error) return <Alert severity="error">{(error as Error).message}</Alert>;

  return (
    <Stack spacing={2.5} maxWidth={960}>
      <PageHeader title={t.title} subtitle={t.subtitle} />

      <Card sx={{ p: { xs: 2, md: 3 } }}>
        <Stack component="form" spacing={2} onSubmit={onSubmit}>
          <Typography fontWeight={700}>
            {editId ? t.editPublication(editId) : t.newPublication}
          </Typography>
          <TextField
            label={t.titleLabel}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            fullWidth
          />
          <TextField
            label={t.bodyLabel}
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            required
            fullWidth
            multiline
            minRows={5}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={form.isPublished}
                onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
              />
            }
            label={t.published}
          />
          <Stack direction="row" spacing={1}>
            <Button type="submit" variant="contained" disabled={saveMutation.isPending}>
              {editId ? t.save : t.create}
            </Button>
            {editId && (
              <Button
                variant="text"
                onClick={() => {
                  setEditId(null);
                  setForm(empty);
                }}
              >
                {t.cancel}
              </Button>
            )}
          </Stack>
          {saveMutation.isError && (
            <Alert severity="error">{(saveMutation.error as Error).message}</Alert>
          )}
          {message && <Alert severity="success">{message}</Alert>}
        </Stack>
      </Card>

      <Card sx={{ overflow: 'hidden' }}>
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t.columns.id}</TableCell>
                <TableCell>{t.columns.title}</TableCell>
                <TableCell>{t.columns.author}</TableCell>
                <TableCell>{t.columns.status}</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>{item.authorName}</TableCell>
                  <TableCell>{item.isPublished ? t.statusPublished : t.statusDraft}</TableCell>
                  <TableCell>
                    <Button size="small" variant="text" onClick={() => startEdit(item)}>
                      {t.edit}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Card>
    </Stack>
  );
}
