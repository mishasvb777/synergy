import { Router } from 'express';
import { query } from '../db/pool.js';
import { invalidateFeedCache } from '../db/redis.js';
import { authRequired, type AuthedRequest } from '../middleware/auth.js';

const router = Router({ mergeParams: true });

router.post('/like', authRequired, async (req, res) => {
  const user = (req as AuthedRequest).user;
  const newsId = Number(req.params.newsId);
  const { rows: news } = await query<{ id: number }>(
    `SELECT id FROM news WHERE id = $1 AND is_published = TRUE`,
    [newsId]
  );
  if (!news[0]) return res.status(404).json({ error: 'Новость не найдена' });

  const { rows: existing } = await query<{ id: number }>(
    `SELECT id FROM reactions WHERE news_id = $1 AND user_id = $2 AND reaction_type = 'like'`,
    [newsId, user.id]
  );

  if (existing[0]) {
    await query(`DELETE FROM reactions WHERE id = $1`, [existing[0].id]);
    await invalidateFeedCache();
    const { rows: count } = await query<{ c: number }>(
      `SELECT COUNT(*)::int AS c FROM reactions WHERE news_id = $1 AND reaction_type = 'like'`,
      [newsId]
    );
    return res.json({ liked: false, likesCount: count[0].c });
  }

  await query(`INSERT INTO reactions (news_id, user_id, reaction_type) VALUES ($1, $2, 'like')`, [
    newsId,
    user.id,
  ]);
  await invalidateFeedCache();
  const { rows: count } = await query<{ c: number }>(
    `SELECT COUNT(*)::int AS c FROM reactions WHERE news_id = $1 AND reaction_type = 'like'`,
    [newsId]
  );
  return res.json({ liked: true, likesCount: count[0].c });
});

export default router;
