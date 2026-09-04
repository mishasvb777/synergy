import { Router } from 'express';
import { query } from '../db/pool.js';
import { authRequired, type AuthedRequest } from '../middleware/auth.js';

const router = Router();

const ALLOWED_TYPES = new Set(['post', 'article', 'thanks', 'news']);
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_IMAGE_CHARS = 3_500_000; // ~2.5MB binary as base64

interface ActivityRow {
  id: number;
  title: string;
  body: string;
  post_type: string;
  community_id: number | null;
  author_id: number;
  author_name: string;
  created_at: string;
  has_image: boolean;
}

function mapPost(row: ActivityRow) {
  const hasImage = Boolean(row.has_image);
  const version = hasImage ? String(row.created_at).replace(/\D/g, '').slice(-8) : '';
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    type: row.post_type,
    communityId: row.community_id,
    authorId: row.author_id,
    authorName: row.author_name,
    createdAt: row.created_at,
    hasImage,
    imageUrl: hasImage ? `/api/activity/${row.id}/image?v=${row.id}${version}` : null,
  };
}

router.get('/', authRequired, async (_req, res) => {
  const { rows } = await query<ActivityRow>(
    `SELECT p.id, p.title, p.body, p.post_type, p.community_id, p.author_id,
            u.full_name AS author_name, p.created_at,
            (p.image_data IS NOT NULL AND length(p.image_data) > 0) AS has_image
     FROM activity_posts p
     JOIN users u ON u.id = p.author_id
     ORDER BY p.created_at DESC, p.id DESC
     LIMIT 100`
  );
  res.json({ items: rows.map(mapPost) });
});

router.get('/:id', authRequired, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Некорректный id' });

  const { rows } = await query<ActivityRow>(
    `SELECT p.id, p.title, p.body, p.post_type, p.community_id, p.author_id,
            u.full_name AS author_name, p.created_at,
            (p.image_data IS NOT NULL AND length(p.image_data) > 0) AS has_image
     FROM activity_posts p
     JOIN users u ON u.id = p.author_id
     WHERE p.id = $1`,
    [id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Публикация не найдена' });
  res.json(mapPost(rows[0]));
});

router.get('/:id/image', authRequired, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Некорректный id' });

  const { rows } = await query<{ image_mime: string | null; image_data: string | null }>(
    `SELECT image_mime, image_data FROM activity_posts WHERE id = $1`,
    [id]
  );
  const row = rows[0];
  if (!row?.image_data) return res.status(404).json({ error: 'Изображение не найдено' });

  try {
    const buffer = Buffer.from(row.image_data, 'base64');
    res.setHeader('Content-Type', row.image_mime || 'image/jpeg');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.send(buffer);
  } catch {
    res.status(500).json({ error: 'Не удалось прочитать изображение' });
  }
});

router.post('/', authRequired, async (req, res) => {
  const user = (req as AuthedRequest).user;
  const { title, body, type, communityId, imageBase64, imageMime } = req.body || {};

  if (!title || String(title).trim().length < 3) {
    return res.status(400).json({ error: 'Заголовок слишком короткий' });
  }
  if (!body || String(body).trim().length < 10) {
    return res.status(400).json({ error: 'Текст слишком короткий' });
  }

  const postType = ALLOWED_TYPES.has(type) ? type : 'post';
  const community =
    communityId === null || communityId === undefined || communityId === ''
      ? null
      : Number(communityId);
  if (community !== null && !Number.isFinite(community)) {
    return res.status(400).json({ error: 'Некорректное сообщество' });
  }

  let mime: string | null = null;
  let data: string | null = null;
  if (imageBase64) {
    const raw = String(imageBase64).replace(/^data:[^;]+;base64,/, '');
    mime = String(imageMime || 'image/jpeg');
    if (!ALLOWED_MIME.has(mime)) {
      return res.status(400).json({ error: 'Допустимы только JPEG, PNG, WebP или GIF' });
    }
    if (raw.length > MAX_IMAGE_CHARS) {
      return res.status(400).json({ error: 'Файл слишком большой (макс. ~2.5 МБ)' });
    }
    data = raw;
  }

  const { rows } = await query<{ id: number }>(
    `INSERT INTO activity_posts (author_id, title, body, post_type, community_id, image_mime, image_data)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [user.id, String(title).trim(), String(body).trim(), postType, community, mime, data]
  );

  const id = rows[0].id;
  const { rows: created } = await query<ActivityRow>(
    `SELECT p.id, p.title, p.body, p.post_type, p.community_id, p.author_id,
            u.full_name AS author_name, p.created_at,
            (p.image_data IS NOT NULL AND length(p.image_data) > 0) AS has_image
     FROM activity_posts p
     JOIN users u ON u.id = p.author_id
     WHERE p.id = $1`,
    [id]
  );

  res.status(201).json(mapPost(created[0]));
});

export default router;
