import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import type { NextFunction, Request, Response } from 'express';
import { connectRedis } from './db/redis.js';
import { getDbMode, initDb, query } from './db/pool.js';
import { ensureSchema, refreshDemoActivityImages, seedActivityIfEmpty } from './db/migrate.js';
import authRoutes from './routes/auth.js';
import newsRoutes from './routes/news.js';
import commentsRoutes from './routes/comments.js';
import reactionsRoutes from './routes/reactions.js';
import menuRoutes from './routes/menu.js';
import adminRoutes from './routes/admin.js';
import activityRoutes from './routes/activity.js';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json({ limit: '6mb' }));
app.use((_req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = ((body: unknown) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return originalJson(body);
  }) as typeof res.json;
  next();
});

app.get('/api/health', async (_req, res) => {
  try {
    await query('SELECT 1');
    res.json({ ok: true, service: 'portal-plus1-api', db: getDbMode() });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ ok: false, error: message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/news/:newsId/comments', commentsRoutes);
app.use('/api/news/:newsId/reactions', reactionsRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/activity', activityRoutes);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

async function start(): Promise<void> {
  await initDb();
  await ensureSchema();
  await seedActivityIfEmpty();
  await refreshDemoActivityImages();
  await connectRedis();
  app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
  });
}

void start();
