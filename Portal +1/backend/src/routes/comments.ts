import { Router } from 'express';
import { query } from '../db/pool.js';
import { invalidateFeedCache } from '../db/redis.js';
import { authRequired, type AuthedRequest } from '../middleware/auth.js';

const router = Router({ mergeParams: true });

router.post('/', authRequired, async (req, res) => {
  const user = (req as AuthedRequest).user;
  const newsId = Number(req.params.newsId);
  const { body } = (req.body || {}) as { body?: string };
  if (!body?.trim()) {
    return res.status(400).json({ error: 'Комментарий не может быть пустым' });
  }
  const { rows: news } = await query<{ id: number }>(
    `SELECT id FROM news WHERE id = $1 AND is_published = TRUE`,
    [newsId]
  );
  if (!news[0]) return res.status(404).json({ error: 'Новость не найдена' });

  const { rows } = await query<{ id: number; body: string; createdAt: string }>(
    `INSERT INTO comments (news_id, author_id, body)
     VALUES ($1, $2, $3)
     RETURNING id, body, created_at AS "createdAt"`,
    [newsId, user.id, body.trim()]
  );
  await invalidateFeedCache();
  res.status(201).json({
    ...rows[0],
    authorId: user.id,
    authorName: user.full_name,
  });
});

export default router;
