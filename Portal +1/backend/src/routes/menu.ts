import { Router } from 'express';
import { query } from '../db/pool.js';
import { authRequired, roleAllowed, type AuthedRequest } from '../middleware/auth.js';

const router = Router();

router.get('/', authRequired, async (req, res) => {
  const user = (req as AuthedRequest).user;
  const { rows } = await query<{
    id: number;
    code: string;
    title: string;
    path: string;
    minRole: string;
    sortOrder: number;
  }>(
    `SELECT id, code, title, path, min_role AS "minRole", sort_order AS "sortOrder"
     FROM menu_items
     WHERE is_active = TRUE
     ORDER BY sort_order ASC`
  );
  const items = rows.filter((item) => roleAllowed(user.role_code, item.minRole));
  res.json({ items });
});

export default router;
