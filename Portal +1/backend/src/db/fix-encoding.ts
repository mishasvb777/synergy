import dotenv from 'dotenv';
import { endDb, initDb, query } from './pool.js';

dotenv.config();

async function fix() {
  await initDb();

  await query(`DELETE FROM news WHERE title LIKE '%?%' OR body LIKE '%????%'`);

  // Deduplicate earlier fix inserts
  await query(`
    DELETE FROM news
    WHERE title = 'Тест модератора: контрольная публикация'
      AND id NOT IN (
        SELECT MIN(id) FROM news WHERE title = 'Тест модератора: контрольная публикация'
      )
  `);

  const { rows: existing } = await query<{ c: number }>(
    `SELECT COUNT(*)::int AS c FROM news WHERE title = 'Тест модератора: контрольная публикация'`
  );

  if (Number(existing[0]?.c ?? 0) === 0) {
    const { rows: authors } = await query<{ id: number }>(
      `SELECT u.id FROM users u JOIN roles r ON r.id = u.role_id WHERE r.code = 'moderator' LIMIT 1`
    );
    const authorId = authors[0]?.id;
    if (!authorId) throw new Error('Moderator not found');
    await query(
      `INSERT INTO news (title, body, author_id, is_published) VALUES ($1, $2, $3, TRUE)`,
      [
        'Тест модератора: контрольная публикация',
        'Контрольная публикация для MVP. Текст сохранён в UTF-8.',
        authorId,
      ]
    );
  }

  console.log('Encoding fix applied.');
}

fix()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await endDb();
  });
