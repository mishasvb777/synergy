import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import type { DbMode, QueryResult } from '../types.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '../../.pglite-data');

interface DbDriver {
  mode: Exclude<DbMode, null>;
  query: <T = Record<string, unknown>>(text: string, params?: unknown[]) => Promise<QueryResult<T>>;
  end: () => Promise<void>;
}

let driver: DbDriver | null = null;
let mode: DbMode = null;

export async function initDb(): Promise<DbDriver> {
  if (driver) return driver;

  const url = process.env.DATABASE_URL || '';
  const forcePglite = process.env.USE_PGLITE === '1' || !url;

  if (!forcePglite && url.startsWith('postgres')) {
    try {
      const pg = await import('pg');
      const pool = new pg.default.Pool({ connectionString: url, connectionTimeoutMillis: 2500 });
      await pool.query('SELECT 1');
      driver = {
        mode: 'postgres',
        async query<T = Record<string, unknown>>(text: string, params: unknown[] = []) {
          const result = await pool.query(text, params);
          return { rows: result.rows as T[], rowCount: result.rowCount ?? 0 };
        },
        async end() {
          await pool.end();
        },
      };
      mode = 'postgres';
      console.log('DB: PostgreSQL via DATABASE_URL');
      return driver;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn('PostgreSQL unavailable, falling back to PGlite:', message);
    }
  }

  const { PGlite } = await import('@electric-sql/pglite');
  fs.mkdirSync(dataDir, { recursive: true });
  const db = new PGlite(dataDir);

  driver = {
    mode: 'pglite',
    async query<T = Record<string, unknown>>(text: string, params: unknown[] = []) {
      const result = await db.query(text, params);
      return {
        rows: (result.rows || []) as T[],
        rowCount: (result as { affectedRows?: number }).affectedRows ?? result.rows?.length ?? 0,
      };
    },
    async end() {
      await db.close();
    },
  };
  mode = 'pglite';
  console.log('DB: embedded PGlite at', dataDir);
  return driver;
}

export function getDbMode(): DbMode {
  return mode;
}

export async function query<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = []
): Promise<QueryResult<T>> {
  const d = await initDb();
  return d.query<T>(text, params);
}

export async function endDb(): Promise<void> {
  if (driver) {
    await driver.end();
    driver = null;
    mode = null;
  }
}
