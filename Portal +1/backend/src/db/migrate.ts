import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from './pool.js';
import { schemaStatements } from './schema.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function readCoverBase64(fileName: string): { mime: string; data: string } | null {
  const candidates = [
    path.join(__dirname, '../../../frontend/public/covers', fileName),
    path.join(__dirname, '../../seed-images', fileName),
  ];
  for (const filePath of candidates) {
    if (fs.existsSync(filePath)) {
      const buf = fs.readFileSync(filePath);
      return { mime: 'image/png', data: buf.toString('base64') };
    }
  }
  return null;
}

export async function ensureSchema(): Promise<void> {
  for (const stmt of schemaStatements) {
    await query(stmt);
  }

  // Soft migrations for existing PGlite/Postgres databases
  const alters = [
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255)`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS email_confirm_token VARCHAR(128)`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS email_confirm_expires TIMESTAMPTZ`,
  ];
  for (const stmt of alters) {
    try {
      await query(stmt);
    } catch (err) {
      console.warn('Migration skip:', stmt, err instanceof Error ? err.message : err);
    }
  }

  // Demo accounts: mark verified + assign emails
  await query(
    `UPDATE users SET email = login || '@innotech.local', email_verified = TRUE
     WHERE login IN ('employee', 'moderator', 'admin')
       AND (email IS NULL OR email_verified = FALSE)`
  );
}

const seedDefs = [
  {
    title: 'Летний вайб-тур в Ижевск',
    body: 'Поделился впечатлениями с выездного митапа команды. Много живых обсуждений, новые знакомства и идеи для внутренних сообществ.\n\nЕсли хотите повторить формат у себя в домене — пишите в комментариях или в сообществе «Маркетинг».',
    type: 'post',
    communityId: 2,
    login: 'moderator',
    imageFile: 'panda-hike.png',
  },
  {
    title: 'Благодарность команде поддержки',
    body: 'Отдельное спасибо коллегам из ИТ-поддержки за оперативное восстановление доступа к стенду. Запрос закрыли за 40 минут.',
    type: 'thanks',
    communityId: 1,
    login: 'employee',
    imageFile: 'panda-office.png',
  },
  {
    title: 'Материалы по охране труда',
    body: 'Выложил чек-лист для удалённых сотрудников в базу знаний. Буду рад правкам и дополнениям.',
    type: 'article',
    communityId: 3,
    login: 'admin',
    imageFile: 'panda-gift.png',
  },
] as const;

export async function seedActivityIfEmpty(): Promise<void> {
  const { rows } = await query<{ c: number }>('SELECT COUNT(*)::int AS c FROM activity_posts');
  if (Number(rows[0]?.c ?? 0) > 0) return;

  const { rows: users } = await query<{ id: number; login: string }>(
    `SELECT id, login FROM users WHERE login IN ('employee', 'moderator', 'admin')`
  );
  const byLogin = Object.fromEntries(users.map((u) => [u.login, u.id]));
  const author = (login: string) => byLogin[login] || byLogin.employee || users[0]?.id;
  if (!author('employee')) return;

  for (const sample of seedDefs) {
    const image = readCoverBase64(sample.imageFile);
    await query(
      `INSERT INTO activity_posts (author_id, title, body, post_type, community_id, image_mime, image_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        author(sample.login),
        sample.title,
        sample.body,
        sample.type,
        sample.communityId,
        image?.mime ?? null,
        image?.data ?? null,
      ]
    );
  }
  console.log('Activity feed seeded with sample posts and images');
}

/** Refresh demo (and any) activity images to current panda covers. */
export async function refreshDemoActivityImages(): Promise<void> {
  const covers = ['panda-hike.png', 'panda-office.png', 'panda-gift.png', 'panda-events.png', 'panda-academy.png', 'panda-knowledge.png'];

  // 1) Update known demo posts by title
  let updated = 0;
  for (const sample of seedDefs) {
    const image = readCoverBase64(sample.imageFile);
    if (!image) continue;
    const result = await query(
      `UPDATE activity_posts
       SET image_mime = $1, image_data = $2
       WHERE title = $3`,
      [image.mime, image.data, sample.title]
    );
    updated += result.rowCount || 0;
  }

  // 2) Ensure every post with an image (or without) gets a panda cover by id order
  const { rows: posts } = await query<{ id: number }>('SELECT id FROM activity_posts ORDER BY id ASC');
  for (let i = 0; i < posts.length; i += 1) {
    const file = covers[i % covers.length];
    const image = readCoverBase64(file);
    if (!image) continue;
    await query(
      `UPDATE activity_posts SET image_mime = $1, image_data = $2 WHERE id = $3`,
      [image.mime, image.data, posts[i].id]
    );
    updated += 1;
  }

  if (updated > 0) {
    console.log(`Activity images refreshed to panda covers (${updated} updates)`);
  }
}
