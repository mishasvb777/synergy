export type RoleCode = 'user' | 'moderator' | 'admin';

export interface DbUser {
  id: number;
  login: string;
  full_name: string;
  is_active: boolean;
  role_code: RoleCode;
  role_name: string;
  password_hash?: string;
}

export interface AuthUser {
  id: number;
  login: string;
  fullName: string;
  role: RoleCode;
  roleName: string;
}

export interface JwtPayload {
  sub: number;
  login: string;
  role: RoleCode;
  name: string;
}

export interface QueryResult<T = Record<string, unknown>> {
  rows: T[];
  rowCount: number;
}

export type DbMode = 'postgres' | 'pglite' | null;
