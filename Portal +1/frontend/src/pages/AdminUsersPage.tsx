import { FormEvent, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import {
  useAdminUsers,
  useChangeRole,
  useCreateUser,
  useRoles,
  useToggleActive,
} from '../api/hooks';
import type { RoleCode } from '../types';
import { PageHeader } from '../components/PageHeader';
import { locale } from '../locale';

const t = locale.admin;

export default function AdminUsersPage() {
  const { data: users = [], isLoading, error } = useAdminUsers();
  const { data: roles = [] } = useRoles();
  const changeRole = useChangeRole();
  const toggleActive = useToggleActive();
  const createUser = useCreateUser();
  const [form, setForm] = useState({
    login: '',
    password: '',
    fullName: '',
    role: 'user' as RoleCode,
  });
  const [message, setMessage] = useState('');

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setMessage('');
    await createUser.mutateAsync(form);
    setForm({ login: '', password: '', fullName: '', role: 'user' });
    setMessage(t.created);
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
        <Stack component="form" spacing={2} onSubmit={onCreate}>
          <Typography fontWeight={700}>{t.newUser}</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label={t.loginLabel}
              value={form.login}
              onChange={(e) => setForm({ ...form, login: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label={t.passwordLabel}
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              fullWidth
            />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label={t.fullNameLabel}
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              required
              fullWidth
            />
            <TextField
              select
              label={t.roleLabel}
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as RoleCode })}
              fullWidth
            >
              {roles.map((r) => (
                <MenuItem key={r.code} value={r.code}>
                  {r.name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <Button type="submit" variant="contained" disabled={createUser.isPending} sx={{ alignSelf: 'flex-start' }}>
            {t.create}
          </Button>
          {createUser.isError && (
            <Alert severity="error">{(createUser.error as Error).message}</Alert>
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
                <TableCell>{t.columns.login}</TableCell>
                <TableCell>{t.columns.fullName}</TableCell>
                <TableCell>{t.columns.role}</TableCell>
                <TableCell>{t.columns.status}</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} hover>
                  <TableCell>{u.id}</TableCell>
                  <TableCell>{u.login}</TableCell>
                  <TableCell>{u.fullName}</TableCell>
                  <TableCell>
                    <TextField
                      select
                      size="small"
                      value={u.role}
                      onChange={(e) =>
                        changeRole.mutate({ id: u.id, role: e.target.value as RoleCode })
                      }
                    >
                      {roles.map((r) => (
                        <MenuItem key={r.code} value={r.code}>
                          {r.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </TableCell>
                  <TableCell>{u.isActive ? t.active : t.inactive}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => toggleActive.mutate({ id: u.id, isActive: !u.isActive })}
                    >
                      {u.isActive ? t.disable : t.enable}
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
