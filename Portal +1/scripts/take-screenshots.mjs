import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '../screenshots');
fs.mkdirSync(outDir, { recursive: true });

const BASE = 'http://localhost:5173';

async function login(page, loginName, password = 'Password123!') {
  await page.goto(`${BASE}/login`);
  await page.waitForSelector('form');
  const inputs = page.locator('input');
  await inputs.nth(0).fill(loginName);
  await inputs.nth(1).fill(password);
  await page.getByRole('button', { name: /Продолжить|Вход/i }).click();
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
  await page.waitForTimeout(600);
}

async function logout(page) {
  const btn = page.getByRole('button', { name: 'Выход' });
  if (await btn.count()) {
    await btn.click();
    await page.waitForURL(/\/login/, { timeout: 10000 });
  }
}

async function shot(page, name) {
  const file = path.join(outDir, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false, type: 'png', animations: 'disabled' });
  console.log('saved', name, `${Math.round(fs.statSync(file).size / 1024)}KB`);
}

async function open(page, route, waitText) {
  await page.goto(`${BASE}${route}`);
  await page.waitForSelector(`text=${waitText}`);
  await page.waitForTimeout(500);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  await page.goto(`${BASE}/login`);
  await page.waitForSelector('form');
  await page.waitForTimeout(300);
  await shot(page, '01_login');

  await open(page, '/register', 'Регистрация');
  await shot(page, '02_register');

  await login(page, 'employee');

  await open(page, '/', 'Новости компании');
  await page.waitForTimeout(700);
  await shot(page, '03_feed');

  await page.locator('a[href^="/news/"]').first().click();
  await page.waitForURL(/\/news\/\d+/);
  await page.waitForSelector('text=Комментарии');
  await page.waitForTimeout(500);
  await shot(page, '04_news_detail');

  const likeBtn = page.getByRole('button', { name: /Нравится|Реакция/i }).first();
  await likeBtn.click();
  await page.waitForTimeout(400);
  await page.getByPlaceholder('Написать комментарий…').fill(
    'Комментарий контрольного примера ВКР.'
  );
  await page.getByRole('button', { name: 'Отправить' }).click();
  await page.waitForTimeout(700);
  await shot(page, '05_news_comment_like');

  await open(page, '/events', 'События');
  await shot(page, '06_events');

  await open(page, '/activity', 'Активность');
  await page.waitForTimeout(1000);
  await shot(page, '07_activity');

  const postLink = page.locator('a[href^="/activity/"]').first();
  if (await postLink.count()) {
    await postLink.click();
    await page.waitForURL(/\/activity\/\d+/);
    await page.waitForTimeout(800);
    await shot(page, '08_activity_post');
  }

  await open(page, '/knowledge', 'База знаний');
  await shot(page, '09_knowledge');

  await open(page, '/org', 'Оргструктура');
  await shot(page, '10_org');

  await open(page, '/academy', 'Цифровая Академия');
  await shot(page, '11_academy');

  await open(page, '/communities', 'Сообщества');
  await shot(page, '12_communities');

  await open(page, '/benefits', 'Бенефиты');
  await shot(page, '13_benefits');

  await open(page, '/operations', 'Операции');
  await shot(page, '14_operations');

  await open(page, '/operations/hr', 'Кадровые сервисы');
  await shot(page, '15_hr');

  await open(page, '/operations/it', 'ИТ-поддержка');
  await shot(page, '16_it');

  await open(page, '/support', 'Поддержка портала');
  await shot(page, '17_support');

  await open(page, '/workspace', 'Мое рабочее пространство');
  await shot(page, '18_workspace');

  await page.goto(`${BASE}/search?q=новост`);
  await page.waitForSelector('text=Поиск');
  await page.waitForTimeout(600);
  await shot(page, '19_search');

  await logout(page);
  await login(page, 'moderator');
  await open(page, '/news/manage', 'Создание и редактирование');
  await shot(page, '20_news_manage');

  await logout(page);
  await login(page, 'admin');
  await open(page, '/admin/users', 'Учётные записи');
  await shot(page, '21_admin_users');

  await logout(page);
  await login(page, 'employee');
  await page.goto(`${BASE}/admin/users`);
  await page.waitForSelector('text=Нет доступа');
  await shot(page, '22_forbidden');

  await browser.close();
  console.log('Done →', outDir);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
