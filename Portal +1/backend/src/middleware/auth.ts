import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../db/pool.js';
import type { DbUser, JwtPayload, RoleCode } from '../types.js';

const ROLE_RANK: Record<RoleCode, number> = { user: 1, moderator: 2, admin: 3 };

export interface AuthedRequest extends Request {
  user: DbUser;
}

export function signToken(user: DbUser): string {
  const payload: JwtPayload = {
    sub: user.id,
    login: user.login,
    role: user.role_code,
    name: user.full_name,
  };
  return jwt.sign(payload, process.env.JWT_SECRET || 'dev-secret', {
    expiresIn: (process.env.JWT_EXPIRES_IN || '8h') as jwt.SignOptions['expiresIn'],
  });
}

export async function authRequired(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Требуется аутентификация' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    const payload = decoded as unknown as JwtPayload;
    const { rows } = await query<DbUser>(
      `SELECT u.id, u.login, u.full_name, u.is_active, r.code AS role_code, r.name AS role_name
       FROM users u
       JOIN roles r ON r.id = u.role_id
       WHERE u.id = $1`,
      [payload.sub]
    );
    if (!rows[0] || !rows[0].is_active) {
      return res.status(401).json({ error: 'Пользователь неактивен или не найден' });
    }
    (req as AuthedRequest).user = rows[0];
    return next();
  } catch {
    return res.status(401).json({ error: 'Недействительный токен' });
  }
}

export function requireRole(minRole: RoleCode) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthedRequest).user;
    const userRank = ROLE_RANK[user.role_code] || 0;
    const need = ROLE_RANK[minRole] || 99;
    if (userRank < need) {
      return res.status(403).json({ error: 'Недостаточно прав для операции' });
    }
    return next();
  };
}

export function roleAllowed(userRole: RoleCode, minRole: string): boolean {
  return (ROLE_RANK[userRole] || 0) >= (ROLE_RANK[minRole as RoleCode] || 99);
}
