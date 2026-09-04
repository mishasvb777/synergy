import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { query } from '../db/pool.js';
import { authRequired, signToken, type AuthedRequest } from '../middleware/auth.js';
import type { DbUser } from '../types.js';
import { appPublicUrl, buildConfirmEmailMessage, sendMail } from '../services/mail.js';

const router = Router();

type AuthRow = DbUser & {
  password_hash: string;
  email?: string | null;
  email_verified?: boolean;
};

function publicUser(user: DbUser) {
  return {
    id: user.id,
    login: user.login,
    fullName: user.full_name,
    role: user.role_code,
    roleName: user.role_name,
  };
}

function makeConfirmToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

router.post('/login', async (req, res) => {
  const { login, password } = (req.body || {}) as { login?: string; password?: string };
  if (!login || !password) {
    return res.status(400).json({ error: 'Укажите логин и пароль' });
  }

  const { rows } = await query<AuthRow>(
    `SELECT u.id, u.login, u.full_name, u.password_hash, u.is_active,
            u.email_verified, r.code AS role_code, r.name AS role_name
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.login = $1`,
    [login]
  );
  const user = rows[0];
  if (!user) {
    return res.status(401).json({ error: 'Неверный логин или пароль' });
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    return res.status(401).json({ error: 'Неверный логин или пароль' });
  }

  if (user.email_verified === false) {
    return res.status(403).json({
      error: 'Подтвердите email — ссылка отправлена при регистрации',
      code: 'EMAIL_NOT_VERIFIED',
    });
  }

  if (!user.is_active) {
    return res.status(401).json({ error: 'Учётная запись отключена' });
  }

  const token = signToken(user);
  // одноразовый токен подтверждения больше не нужен
  await query(
    `UPDATE users SET email_confirm_token = NULL, email_confirm_expires = NULL WHERE id = $1`,
    [user.id]
  );
  return res.json({ token, user: publicUser(user) });
});

router.post('/register', async (req, res) => {
  const { login, email, fullName, password } = (req.body || {}) as {
    login?: string;
    email?: string;
    fullName?: string;
    password?: string;
  };

  const cleanLogin = login?.trim().toLowerCase() || '';
  const cleanEmail = email?.trim().toLowerCase() || '';
  const cleanName = fullName?.trim() || '';

  if (!cleanLogin || !cleanEmail || !cleanName || !password) {
    return res.status(400).json({ error: 'Заполните логин, email, ФИО и пароль' });
  }
  if (!/^[a-z0-9._-]{3,32}$/.test(cleanLogin)) {
    return res.status(400).json({
      error: 'Логин: 3–32 символа, латиница, цифры, точка, _ или -',
    });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return res.status(400).json({ error: 'Некорректный email' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Пароль не короче 8 символов' });
  }

  const { rows: existing } = await query<{ login: string; email: string | null }>(
    `SELECT login, email FROM users WHERE login = $1 OR lower(email) = $2`,
    [cleanLogin, cleanEmail]
  );
  if (existing.some((u) => u.login === cleanLogin)) {
    return res.status(409).json({ error: 'Такой логин уже занят' });
  }
  if (existing.some((u) => (u.email || '').toLowerCase() === cleanEmail)) {
    return res.status(409).json({ error: 'Этот email уже зарегистрирован' });
  }

  const { rows: roleRows } = await query<{ id: number }>(
    `SELECT id FROM roles WHERE code = 'user'`
  );
  if (!roleRows[0]) return res.status(500).json({ error: 'Роль user не найдена' });

  const passwordHash = await bcrypt.hash(password, 10);
  const confirmToken = makeConfirmToken();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const { rows } = await query<{ id: number }>(
    `INSERT INTO users (
       login, password_hash, full_name, email, email_verified,
       email_confirm_token, email_confirm_expires, role_id, is_active
     ) VALUES ($1, $2, $3, $4, FALSE, $5, $6, $7, FALSE)
     RETURNING id`,
    [cleanLogin, passwordHash, cleanName, cleanEmail, confirmToken, expires.toISOString(), roleRows[0].id]
  );

  const confirmUrl = `${appPublicUrl()}/confirm-email?token=${confirmToken}`;
  const message = buildConfirmEmailMessage(cleanName, confirmUrl);
  const mailResult = await sendMail({
    to: cleanEmail,
    subject: 'Подтверждение регистрации — Портал+1',
    text: message.text,
    html: message.html,
  });

  return res.status(201).json({
    ok: true,
    message: 'Регистрация принята. Проверьте почту и подтвердите email.',
    userId: rows[0].id,
    email: cleanEmail,
    mailMode: mailResult.mode,
    // Для учебного стенда без SMTP — отдаём ссылку в ответе
    confirmUrl: mailResult.mode === 'console' ? confirmUrl : undefined,
    previewUrl: mailResult.previewUrl,
  });
});

router.get('/confirm-email', async (req, res) => {
  const token = String(req.query.token || '').trim();
  if (!token) return res.status(400).json({ error: 'Токен не указан' });

  const { rows } = await query<{
    id: number;
    email_verified: boolean;
    email_confirm_expires: string | null;
  }>(
    `SELECT id, email_verified, email_confirm_expires
     FROM users WHERE email_confirm_token = $1`,
    [token]
  );
  const user = rows[0];
  if (!user) return res.status(400).json({ error: 'Ссылка недействительна или уже использована' });

  if (user.email_verified) {
    return res.json({ ok: true, alreadyVerified: true, message: 'Email уже подтверждён' });
  }

  if (user.email_confirm_expires && new Date(user.email_confirm_expires).getTime() < Date.now()) {
    return res.status(400).json({ error: 'Срок действия ссылки истёк. Запросите письмо повторно.' });
  }

  await query(
    `UPDATE users
     SET email_verified = TRUE,
         is_active = TRUE
     WHERE id = $1`,
    [user.id]
  );

  return res.json({ ok: true, message: 'Email подтверждён. Можно войти в портал.' });
});

router.post('/resend-confirmation', async (req, res) => {
  const { email } = (req.body || {}) as { email?: string };
  const cleanEmail = email?.trim().toLowerCase() || '';
  if (!cleanEmail) return res.status(400).json({ error: 'Укажите email' });

  const { rows } = await query<{
    id: number;
    full_name: string;
    email_verified: boolean;
  }>(`SELECT id, full_name, email_verified FROM users WHERE lower(email) = $1`, [cleanEmail]);

  // Не раскрываем, есть ли пользователь
  if (!rows[0] || rows[0].email_verified) {
    return res.json({
      ok: true,
      message: 'Если аккаунт существует и не подтверждён — письмо отправлено повторно.',
    });
  }

  const confirmToken = makeConfirmToken();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await query(
    `UPDATE users
     SET email_confirm_token = $1, email_confirm_expires = $2
     WHERE id = $3`,
    [confirmToken, expires.toISOString(), rows[0].id]
  );

  const confirmUrl = `${appPublicUrl()}/confirm-email?token=${confirmToken}`;
  const message = buildConfirmEmailMessage(rows[0].full_name, confirmUrl);
  const mailResult = await sendMail({
    to: cleanEmail,
    subject: 'Повторное подтверждение — Портал+1',
    text: message.text,
    html: message.html,
  });

  return res.json({
    ok: true,
    message: 'Если аккаунт существует и не подтверждён — письмо отправлено повторно.',
    confirmUrl: mailResult.mode === 'console' ? confirmUrl : undefined,
    previewUrl: mailResult.previewUrl,
  });
});

router.get('/me', authRequired, (req, res) => {
  const user = (req as AuthedRequest).user;
  res.json(publicUser(user));
});

export default router;
