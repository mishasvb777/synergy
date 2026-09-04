import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '../diagrams');
fs.mkdirSync(outDir, { recursive: true });

/** Shared CSS for thesis-readable diagrams */
const baseCss = `
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 28px 32px; background: #fff;
    font-family: "Segoe UI", "Times New Roman", sans-serif;
    color: #111;
  }
  h1 {
    margin: 0 0 18px; font-size: 20px; font-weight: 700; text-align: center;
  }
  .root {
    display: block; margin: 0 auto 16px; max-width: 220px;
    padding: 12px 16px; text-align: center; font-weight: 700; font-size: 16px;
    border: 2px solid #222; background: #f3f3f3; border-radius: 8px;
  }
  .branch {
    border: 1.5px solid #333; border-radius: 10px; padding: 10px 12px 12px;
    background: #fafafa; margin-bottom: 10px;
  }
  .branch h2 {
    margin: 0 0 8px; font-size: 14px; font-weight: 700;
    padding-bottom: 6px; border-bottom: 1px solid #ccc;
  }
  .leaves {
    display: flex; flex-wrap: wrap; gap: 6px;
  }
  .leaf {
    border: 1px solid #555; border-radius: 6px; padding: 6px 10px;
    font-size: 13px; background: #fff; line-height: 1.25;
  }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
  .note { margin-top: 10px; font-size: 12px; color: #444; text-align: center; }
`;

const functionTreeHtml = `<!doctype html><html><head><meta charset="utf-8"/>
<style>${baseCss}
  .connector { text-align: center; font-size: 18px; color: #555; margin: 2px 0 8px; }
</style></head><body>
  <div class="root">Портал+1</div>
  <div class="connector">▼</div>
  <div class="grid2">
    <div class="branch">
      <h2>1. Аутентификация</h2>
      <div class="leaves">
        <span class="leaf">Вход</span>
        <span class="leaf">Регистрация</span>
        <span class="leaf">Подтверждение email</span>
        <span class="leaf">Выход</span>
      </div>
    </div>
    <div class="branch">
      <h2>2. Информирование</h2>
      <div class="leaves">
        <span class="leaf">Лента новостей</span>
        <span class="leaf">Карточка новости</span>
        <span class="leaf">Комментарии</span>
        <span class="leaf">Реакции</span>
        <span class="leaf">Поиск по порталу</span>
      </div>
    </div>
    <div class="branch">
      <h2>3. Социальный контур</h2>
      <div class="leaves">
        <span class="leaf">Активность</span>
        <span class="leaf">Пост активности</span>
        <span class="leaf">Сообщества</span>
        <span class="leaf">События</span>
      </div>
    </div>
    <div class="branch">
      <h2>4. Справочники и обучение</h2>
      <div class="leaves">
        <span class="leaf">База знаний (PDF)</span>
        <span class="leaf">Оргструктура</span>
        <span class="leaf">Цифровая Академия</span>
        <span class="leaf">Бенефиты</span>
      </div>
    </div>
    <div class="branch">
      <h2>5. Операционные сервисы</h2>
      <div class="leaves">
        <span class="leaf">Меню операций</span>
        <span class="leaf">Кадровые сервисы</span>
        <span class="leaf">ИТ-поддержка</span>
        <span class="leaf">Поддержка портала</span>
        <span class="leaf">Рабочее пространство</span>
      </div>
    </div>
    <div class="branch">
      <h2>6–7. Модерация и администрирование</h2>
      <div class="leaves">
        <span class="leaf">Создание новостей</span>
        <span class="leaf">Редактирование новостей</span>
        <span class="leaf">Пользователи</span>
        <span class="leaf">Роли</span>
        <span class="leaf">Отказ в доступе</span>
      </div>
    </div>
  </div>
</body></html>`;

const dialogHtml = `<!doctype html><html><head><meta charset="utf-8"/>
<style>${baseCss}
  .flow { display: flex; flex-direction: column; gap: 10px; max-width: 920px; margin: 0 auto; }
  .row { display: flex; flex-wrap: wrap; gap: 8px; align-items: stretch; justify-content: center; }
  .box {
    border: 1.5px solid #333; border-radius: 8px; padding: 8px 12px;
    background: #fff; font-size: 13px; text-align: center; min-width: 120px;
  }
  .box.main { background: #e8f0ee; border-width: 2px; font-weight: 700; }
  .box.start, .box.end { border-radius: 20px; background: #eee; font-weight: 650; }
  .box.warn { background: #f7ecec; }
  .arrow { text-align: center; font-size: 12px; color: #333; line-height: 1.35; }
  .group {
    border: 1.5px dashed #666; border-radius: 10px; padding: 10px;
    background: #fcfcfc; width: 100%;
  }
  .group h2 { margin: 0 0 8px; font-size: 13px; font-weight: 700; text-align: center; }
  .label { font-size: 11px; color: #444; margin: 0 4px; align-self: center; }
</style></head><body>
  <div class="flow">
    <div class="row">
      <div class="box start">Старт</div>
    </div>
    <div class="arrow">↓</div>
    <div class="row">
      <div class="box">Вход</div>
      <span class="label">нет аккаунта →</span>
      <div class="box">Регистрация</div>
      <span class="label">→</span>
      <div class="box">Confirm email</div>
      <span class="label">→ вход</span>
    </div>
    <div class="arrow">ошибка ↺ &nbsp;&nbsp;|&nbsp;&nbsp; успех ↓</div>
    <div class="row">
      <div class="box main">Новости (главный экран)</div>
    </div>
    <div class="arrow">навигация по разделам портала ↓</div>

    <div class="group">
      <h2>Информирование и обратная связь</h2>
      <div class="row">
        <div class="box">Карточка новости</div>
        <div class="box">Комментарии / реакции</div>
        <div class="box">Поиск</div>
      </div>
    </div>

    <div class="group">
      <h2>Социальный контур</h2>
      <div class="row">
        <div class="box">События</div>
        <div class="box">Активность</div>
        <div class="box">Пост активности</div>
        <div class="box">Сообщества</div>
      </div>
    </div>

    <div class="group">
      <h2>Справочники и обучение</h2>
      <div class="row">
        <div class="box">База знаний</div>
        <div class="box">Оргструктура</div>
        <div class="box">Цифровая Академия</div>
        <div class="box">Бенефиты</div>
      </div>
    </div>

    <div class="group">
      <h2>Операционные сервисы</h2>
      <div class="row">
        <div class="box">Операции</div>
        <div class="box">Кадровые сервисы</div>
        <div class="box">ИТ-поддержка</div>
        <div class="box">Поддержка портала</div>
        <div class="box">Рабочее пространство</div>
      </div>
    </div>

    <div class="group">
      <h2>Модерация и администрирование</h2>
      <div class="row">
        <div class="box">Управление новостями</div>
        <div class="box">Админка (пользователи)</div>
        <div class="box warn">Forbidden (нет прав)</div>
      </div>
    </div>

    <div class="arrow">↓ выход из системы</div>
    <div class="row"><div class="box end">Выход → экран входа</div></div>
  </div>
</body></html>`;

const useCaseHtml = `<!doctype html><html><head><meta charset="utf-8"/>
<style>${baseCss}
  .actors {
    display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 14px;
  }
  .actor {
    border: 2px solid #222; border-radius: 12px; padding: 12px; background: #f5f5f5;
  }
  .actor .who {
    text-align: center; font-weight: 700; font-size: 15px; margin-bottom: 10px;
  }
  .actor .who::before {
    content: "● "; color: #2d6a5a;
  }
  .uc {
    display: block; border: 1px solid #444; border-radius: 16px; padding: 6px 10px;
    margin: 5px 0; font-size: 12.5px; background: #fff; text-align: center;
  }
  .shared {
    border: 1.5px dashed #555; border-radius: 10px; padding: 10px 12px; margin-top: 4px;
    background: #fafafa;
  }
  .shared h2 { margin: 0 0 8px; font-size: 13px; text-align: center; }
  .shared .row { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; }
  .shared .uc { margin: 0; min-width: 140px; }
</style></head><body>
  <div class="actors">
    <div class="actor">
      <div class="who">Сотрудник</div>
      <span class="uc">Вход / регистрация</span>
      <span class="uc">Новости и карточка</span>
      <span class="uc">Комментарии, реакции</span>
      <span class="uc">Активность и пост</span>
      <span class="uc">События, сообщества</span>
      <span class="uc">База знаний, оргструктура</span>
      <span class="uc">Академия, бенефиты</span>
      <span class="uc">Операции, HR, ИТ</span>
      <span class="uc">Поддержка, workspace</span>
      <span class="uc">Поиск</span>
    </div>
    <div class="actor">
      <div class="who">Модератор</div>
      <span class="uc">Вход</span>
      <span class="uc">Новости (просмотр)</span>
      <span class="uc">Активность</span>
      <span class="uc">Управление новостями</span>
      <span class="uc">Все сервисы сотрудника</span>
    </div>
    <div class="actor">
      <div class="who">Администратор</div>
      <span class="uc">Вход</span>
      <span class="uc">Новости (просмотр)</span>
      <span class="uc">Управление новостями</span>
      <span class="uc">Пользователи и роли</span>
      <span class="uc">Все сервисы сотрудника</span>
    </div>
  </div>
  <div class="shared">
    <h2>Общие сценарии контроля доступа</h2>
    <div class="row">
      <span class="uc">Подтверждение email</span>
      <span class="uc">Отказ в доступе (Forbidden)</span>
      <span class="uc">Выход из системы</span>
    </div>
  </div>
</body></html>`;

/** Mermaid diagrams kept for other figures */
const mermaidDiagrams = {
  lifecycle: `flowchart TD
  A[Анализ требований] --> B[Проектирование]
  B --> C[Реализация MVP]
  C --> D[Тестирование]
  D --> E[Опытная эксплуатация]
  E --> F[Сопровождение и развитие]
  F -.-> A`,

  info_model: `erDiagram
  ROLES ||--o{ USERS : has
  USERS ||--o{ NEWS : authors
  USERS ||--o{ COMMENTS : writes
  USERS ||--o{ REACTIONS : leaves
  USERS ||--o{ ACTIVITY_POSTS : authors
  NEWS ||--o{ COMMENTS : has
  NEWS ||--o{ REACTIONS : has
  ROLES {
    int id
    string code
    string name
  }
  USERS {
    int id
    string login
    string email
    bool email_verified
    string full_name
    int role_id
  }
  NEWS {
    int id
    string title
    text body
    int author_id
    bool is_published
  }
  COMMENTS {
    int id
    int news_id
    int author_id
    text body
  }
  REACTIONS {
    int id
    int news_id
    int user_id
    string reaction_type
  }
  ACTIVITY_POSTS {
    int id
    string title
    text body
    string post_type
    int community_id
    text image_data
    int author_id
  }
  MENU_ITEMS {
    int id
    string code
    string path
    string min_role
  }
  EMAIL_OUTBOX {
    int id
    string recipient
    string subject
    text body
  }`,

  modules: `flowchart TD
  FE[React SPA pages] --> API[Express API]
  API --> AuthM[auth]
  API --> NewsM[news]
  API --> CommM[comments]
  API --> ReactM[reactions]
  API --> ActM[activity]
  API --> MenuM[menu]
  API --> AdmM[admin]
  AuthM --> MailS[mail service]
  AuthM --> DB[(PostgreSQL/PGlite)]
  NewsM --> DB
  CommM --> DB
  ReactM --> DB
  ActM --> DB
  MenuM --> DB
  AdmM --> DB
  MailS --> Outbox[(email_outbox)]
  NewsM --> Cache[(Redis/Memory)]`,

  algorithm: `flowchart TD
  S([Запрос лайка]) --> A{Пользователь авторизован?}
  A -->|нет| E1[401]
  A -->|да| B{Новость существует?}
  B -->|нет| E2[404]
  B -->|да| C{Лайк уже есть?}
  C -->|да| D[Удалить реакцию]
  C -->|нет| F[Добавить реакцию]
  D --> G[Инвалидировать кэш ленты]
  F --> G
  G --> H[Вернуть likesCount]
  H --> Z([Конец])`,
};

const mermaidHtml = (code) => `<!doctype html>
<html><head>
<meta charset="utf-8"/>
<script type="module">
  import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
  mermaid.initialize({
    startOnLoad: true,
    theme: 'neutral',
    securityLevel: 'loose',
    flowchart: { htmlLabels: true, curve: 'basis', nodeSpacing: 40, rankSpacing: 50 },
  });
</script>
<style>
  body { margin: 0; padding: 24px; background: #fff; font-family: Segoe UI, sans-serif; }
  .box { display: inline-block; min-width: 900px; }
</style>
</head>
<body><div class="box"><pre class="mermaid">${code}</pre></div></body></html>`;

async function shotFull(page, html, name, width = 980) {
  const file = path.join(outDir, `${name}.html`);
  fs.writeFileSync(file, html, 'utf8');
  await page.setViewportSize({ width, height: 1400 });
  await page.goto('file:///' + file.replace(/\\/g, '/'));
  await page.waitForTimeout(800);
  const body = await page.locator('body').boundingBox();
  await page.screenshot({
    path: path.join(outDir, `${name}.png`),
    clip: {
      x: 0,
      y: 0,
      width: Math.ceil(body.width),
      height: Math.ceil(body.height),
    },
  });
  console.log('diagram', name);
}

async function shotMermaid(page, name, code) {
  const file = path.join(outDir, `${name}.html`);
  fs.writeFileSync(file, mermaidHtml(code), 'utf8');
  await page.setViewportSize({ width: 1200, height: 1100 });
  await page.goto('file:///' + file.replace(/\\/g, '/'));
  await page.waitForTimeout(2200);
  const box = await page.locator('.box').boundingBox();
  await page.screenshot({
    path: path.join(outDir, `${name}.png`),
    clip: {
      x: box.x,
      y: box.y,
      width: Math.min(box.width + 10, 1180),
      height: Math.min(box.height + 20, 1050),
    },
  });
  console.log('diagram', name);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ deviceScaleFactor: 2 });

  await shotFull(page, functionTreeHtml, 'function_tree', 980);
  await shotFull(page, dialogHtml, 'dialog', 980);
  await shotFull(page, useCaseHtml, 'use_case', 980);

  for (const [name, code] of Object.entries(mermaidDiagrams)) {
    await shotMermaid(page, name, code);
  }

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
