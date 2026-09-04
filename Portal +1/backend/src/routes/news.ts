import { Router } from 'express';
import { query } from '../db/pool.js';
import { redis, invalidateFeedCache } from '../db/redis.js';
import { authRequired, requireRole, type AuthedRequest } from '../middleware/auth.js';

const router = Router();

interface NewsRow {
  id: number;
  title: string;
  body: string;
  author_id: number;
  author_name: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

interface NewsItem {
  id: number;
  title: string;
  body: string;
  authorId: number;
  authorName: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  commentsCount: number;
  likesCount: number;
  likedByMe: boolean;
}

async function attachStats(newsRows: NewsRow[], userId: number): Promise<NewsItem[]> {
  if (!newsRows.length) return [];
  const ids = newsRows.map((n) => n.id);
  const { rows: counts } = await query<{ news_id: number; comments_count: number }>(
    `SELECT news_id, COUNT(*)::int AS comments_count
     FROM comments
     WHERE news_id = ANY($1::int[])
     GROUP BY news_id`,
    [ids]
  );
  const { rows: likes } = await query<{ news_id: number; likes_count: number }>(
    `SELECT news_id, COUNT(*)::int AS likes_count
     FROM reactions
     WHERE news_id = ANY($1::int[]) AND reaction_type = 'like'
     GROUP BY news_id`,
    [ids]
  );
  const { rows: mine } = await query<{ news_id: number }>(
    `SELECT news_id
     FROM reactions
     WHERE news_id = ANY($1::int[]) AND user_id = $2 AND reaction_type = 'like'`,
    [ids, userId]
  );

  const commentsMap = Object.fromEntries(counts.map((c) => [c.news_id, c.comments_count]));
  const likesMap = Object.fromEntries(likes.map((l) => [l.news_id, l.likes_count]));
  const likedSet = new Set(mine.map((m) => m.news_id));

  return newsRows.map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body,
    authorId: n.author_id,
    authorName: n.author_name,
    isPublished: n.is_published,
    createdAt: n.created_at,
    updatedAt: n.updated_at,
    commentsCount: commentsMap[n.id] || 0,
    likesCount: likesMap[n.id] || 0,
    likedByMe: likedSet.has(n.id),
  }));
}

router.get('/', authRequired, async (req, res) => {
  const user = (req as AuthedRequest).user;
  const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
  const limit = Math.min(20, Math.max(1, parseInt(String(req.query.limit || '10'), 10)));
  const offset = (page - 1) * limit;
  const cacheKey = `feed:p${page}:l${limit}`;

  try {
    if (redis.isOpen) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as {
          page: number;
          limit: number;
          total: number;
          items: NewsItem[];
        };
        const withUser = await attachStats(
          parsed.items.map((i) => ({
            id: i.id,
            title: i.title,
            body: i.body,
            author_id: i.authorId,
            author_name: i.authorName,
            is_published: i.isPublished,
            created_at: i.createdAt,
            updated_at: i.updatedAt,
          })),
          user.id
        );
        return res.json({ ...parsed, items: withUser, cached: true });
      }
    }
  } catch {
    /* cache miss */
  }

  const { rows: totalRows } = await query<{ c: number }>(
    `SELECT COUNT(*)::int AS c FROM news WHERE is_published = TRUE`
  );
  const { rows } = await query<NewsRow>(
    `SELECT n.*, u.full_name AS author_name
     FROM news n
     JOIN users u ON u.id = n.author_id
     WHERE n.is_published = TRUE
     ORDER BY n.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  const items = await attachStats(rows, user.id);
  const payload = { page, limit, total: totalRows[0].c, items, cached: false };

  try {
    if (redis.isOpen) await redis.setEx(cacheKey, 30, JSON.stringify(payload));
  } catch {
    /* ignore */
  }

  return res.json(payload);
});

router.get('/manage', authRequired, requireRole('moderator'), async (req, res) => {
  const user = (req as AuthedRequest).user;
  const { rows } = await query<NewsRow>(
    `SELECT n.*, u.full_name AS author_name
     FROM news n
     JOIN users u ON u.id = n.author_id
     ORDER BY n.created_at DESC`
  );
  res.json({ items: await attachStats(rows, user.id) });
});

router.get('/:id', authRequired, async (req, res) => {
  const user = (req as AuthedRequest).user;
  const id = Number(req.params.id);
  const { rows } = await query<NewsRow>(
    `SELECT n.*, u.full_name AS author_name
     FROM news n
     JOIN users u ON u.id = n.author_id
     WHERE n.id = $1`,
    [id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Новость не найдена' });
  if (!rows[0].is_published && !['moderator', 'admin'].includes(user.role_code)) {
    return res.status(403).json({ error: 'Новость недоступна' });
  }

  const [item] = await attachStats(rows, user.id);
  const { rows: comments } = await query<{
    id: number;
    body: string;
    createdAt: string;
    authorName: string;
    authorId: number;
  }>(
    `SELECT c.id, c.body, c.created_at AS "createdAt", u.full_name AS "authorName", u.id AS "authorId"
     FROM comments c
     JOIN users u ON u.id = c.author_id
     WHERE c.news_id = $1
     ORDER BY c.created_at ASC`,
    [id]
  );
  res.json({ ...item, comments });
});

router.post('/', authRequired, requireRole('moderator'), async (req, res) => {
  const user = (req as AuthedRequest).user;
  const { title, body, isPublished = true } = (req.body || {}) as {
    title?: string;
    body?: string;
    isPublished?: boolean;
  };
  if (!title?.trim() || !body?.trim()) {
    return res.status(400).json({ error: 'Заполните заголовок и текст' });
  }
  const { rows } = await query<{ id: number }>(
    `INSERT INTO news (title, body, author_id, is_published)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [title.trim(), body.trim(), user.id, Boolean(isPublished)]
  );
  await invalidateFeedCache();
  res.status(201).json({ id: rows[0].id });
});

router.put('/:id', authRequired, requireRole('moderator'), async (req, res) => {
  const id = Number(req.params.id);
  const { title, body, isPublished } = (req.body || {}) as {
    title?: string;
    body?: string;
    isPublished?: boolean;
  };
  const { rows: existing } = await query<{ id: number }>(`SELECT id FROM news WHERE id = $1`, [id]);
  if (!existing[0]) return res.status(404).json({ error: 'Новость не найдена' });

  await query(
    `UPDATE news
     SET title = COALESCE($1, title),
         body = COALESCE($2, body),
         is_published = COALESCE($3, is_published),
         updated_at = NOW()
     WHERE id = $4`,
    [
      title?.trim() || null,
      body?.trim() || null,
      typeof isPublished === 'boolean' ? isPublished : null,
      id,
    ]
  );
  await invalidateFeedCache();
  res.json({ ok: true });
});

export default router;
