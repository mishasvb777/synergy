import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { endDb, initDb, query } from './pool.js';
import { schemaStatements } from './schema.js';
import { seedActivityIfEmpty } from './migrate.js';

dotenv.config();

async function seed(): Promise<void> {
  await initDb();
  for (const stmt of schemaStatements) {
    await query(stmt);
  }

  await query(`
    INSERT INTO roles (code, name) VALUES
      ('user', 'Пользователь'),
      ('moderator', 'Модератор'),
      ('admin', 'Администратор')
    ON CONFLICT (code) DO NOTHING
  `);

  const passwordHash = await bcrypt.hash('Password123!', 10);
  const users: Array<[string, string, string]> = [
    ['employee', 'Иванов Иван', 'user'],
    ['moderator', 'Петрова Анна', 'moderator'],
    ['admin', 'Сидоров Алексей', 'admin'],
  ];

  for (const [login, fullName, roleCode] of users) {
    await query(
      `
      INSERT INTO users (login, password_hash, full_name, role_id)
      SELECT $1, $2, $3, r.id
      FROM roles r
      WHERE r.code = $4
      ON CONFLICT (login) DO NOTHING
      `,
      [login, passwordHash, fullName, roleCode]
    );
  }

  await query(`
    INSERT INTO menu_items (code, title, path, min_role, sort_order) VALUES
      ('feed', 'Лента новостей', '/', 'user', 10),
      ('ops', 'Меню операций', '/operations', 'user', 20),
      ('news_manage', 'Управление новостями', '/news/manage', 'moderator', 30),
      ('admin_users', 'Пользователи и роли', '/admin/users', 'admin', 40)
    ON CONFLICT (code) DO NOTHING
  `);

  const { rows: newsCount } = await query<{ c: number }>('SELECT COUNT(*)::int AS c FROM news');
  if (Number(newsCount[0]?.c ?? 0) === 0) {
    const { rows: authors } = await query<{ id: number; role: string }>(
      `SELECT u.id, r.code AS role
       FROM users u JOIN roles r ON r.id = u.role_id
       WHERE u.login IN ('moderator', 'admin')`
    );
    const mod = authors.find((a) => a.role === 'moderator') || authors[0];
    const adm = authors.find((a) => a.role === 'admin') || authors[0];

    const samples: Array<[number, string, string]> = [
      [
        mod.id,
        'Запуск корпоративного портала «Портал+1»',
        'Коллеги, открываем MVP внутреннего портала: единая лента новостей, комментарии и меню операций. Обратную связь оставляйте под этой публикацией.',
      ],
      [
        adm.id,
        'Правила публикации и модерации',
        'Публикации размещают модераторы и администраторы. Комментарии должны соответствовать корпоративной этике. Нарушения рассматриваются модератором.',
      ],
      [
        mod.id,
        'Обновление графика отпусков',
        'Напоминаем: заявки на отпуск оформляются через сервис кадровых операций. Ссылка доступна в меню операций портала.',
      ],
    ];

    for (const [authorId, title, body] of samples) {
      await query(`INSERT INTO news (title, body, author_id) VALUES ($1, $2, $3)`, [
        title,
        body,
        authorId,
      ]);
    }

    const { rows: firstNews } = await query<{ id: number }>(`SELECT id FROM news ORDER BY id LIMIT 1`);
    const { rows: employee } = await query<{ id: number }>(
      `SELECT id FROM users WHERE login = 'employee'`
    );
    if (firstNews[0] && employee[0]) {
      await query(`INSERT INTO comments (news_id, author_id, body) VALUES ($1, $2, $3)`, [
        firstNews[0].id,
        employee[0].id,
        'Отличная новость, спасибо за запуск!',
      ]);
      await query(
        `INSERT INTO reactions (news_id, user_id, reaction_type) VALUES ($1, $2, 'like')
         ON CONFLICT DO NOTHING`,
        [firstNews[0].id, employee[0].id]
      );
    }
  }

  await seedActivityIfEmpty();

  console.log('Database initialized and seeded.');
  console.log('Demo accounts (password: Password123!): employee, moderator, admin');
}

seed()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await endDb();
  });
