import type { Request } from 'express';
import type { DbUser } from '../types.js';

export interface AuthedRequest extends Request {
  user: DbUser;
}
