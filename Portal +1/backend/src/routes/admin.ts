import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db/pool.js';
import { authRequired, requireRole, type AuthedRequest } from '../middleware/auth.js';
import type { RoleCode } from '../types.js';

const router = Router();

router.use(authRequired, requireRole('admin'));

router.get('/users', async (_req, res) => {
  const { rows } = await query(
    `SELECT u.id, u.login, u.full_name AS "fullName", u.is_active AS "isActive",
            r.code AS role, r.name AS "roleName", u.created_at AS "createdAt"
     FROM users u
     JOIN roles r ON r.id = u.role_id
     ORDER BY u.id`
  );
  res.json({ items: rows });
});

router.get('/roles', async (_req, res) => {
  const { rows } = await query(`SELECT id, code, name FROM roles ORDER BY id`);
  res.json({ items: rows });
});

router.patch('/users/:id/role', async (req, res) => {
  const id = Number(req.params.id);
  const { role } = (req.body || {}) as { role?: RoleCode };
  if (!role) return res.status(400).json({ error: 'Укажите роль' });

  const { rows: roleRows } = await query<{ id: number }>(`SELECT id FROM roles WHERE code = $1`, [
    role,
  ]);
  if (!roleRows[0]) return res.status(400).json({ error: 'Неизвестная роль' });

  const { rowCount } = await query(`UPDATE users SET role_id = $1 WHERE id = $2`, [
    roleRows[0].id,
    id,
  ]);
  if (!rowCount) return res.status(404).json({ error: 'Пользователь не найден' });
  res.json({ ok: true });
});

router.patch('/users/:id/active', async (req, res) => {
  const user = (req as unknown as AuthedRequest).user;
  const id = Number(req.params.id);
  const { isActive } = (req.body || {}) as { isActive?: boolean };
  if (typeof isActive !== 'boolean') {
    return res.status(400).json({ error: 'Укажите isActive' });
  }
  if (id === user.id && isActive === false) {
    return res.status(400).json({ error: 'Нельзя деактивировать собственную учётную запись' });
  }
  const { rowCount } = await query(`UPDATE users SET is_active = $1 WHERE id = $2`, [isActive, id]);
  if (!rowCount) return res.status(404).json({ error: 'Пользователь не найден' });
  res.json({ ok: true });
});

router.post('/users', async (req, res) => {
  const { login, password, fullName, role = 'user', email } = (req.body || {}) as {
    login?: string;
    password?: string;
    fullName?: string;
    role?: RoleCode;
    email?: string;
  };
  if (!login?.trim() || !password || !fullName?.trim()) {
    return res.status(400).json({ error: 'Заполните login, password, fullName' });
  }
  const { rows: roleRows } = await query<{ id: number }>(`SELECT id FROM roles WHERE code = $1`, [
    role,
  ]);
  if (!roleRows[0]) return res.status(400).json({ error: 'Неизвестная роль' });

  const passwordHash = await bcrypt.hash(password, 10);
  const cleanEmail = (email?.trim() || `${login.trim()}@innotech.local`).toLowerCase();
  try {
    const { rows } = await query<{ id: number }>(
      `INSERT INTO users (login, password_hash, full_name, role_id, email, email_verified, is_active)
       VALUES ($1, $2, $3, $4, $5, TRUE, TRUE)
       RETURNING id`,
      [login.trim(), passwordHash, fullName.trim(), roleRows[0].id, cleanEmail]
    );
    res.status(201).json({ id: rows[0].id });
  } catch (err) {
    if ((err as { code?: string }).code === '23505') {
      return res.status(409).json({ error: 'Логин или email уже заняты' });
    }
    throw err;
  }
});

export default router;
