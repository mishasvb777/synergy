import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(__dirname, '../diagrams/econ_chart.png');

// Same numbers as chapter 3 in build-full-vkr.mjs
const salaryHour = 850;
const staff = 200;
const daysYear = 220;
const timeAsIsMin = 12;
const timeToBeMin = 4;
const saveMinPerDay = timeAsIsMin - timeToBeMin;
const saveHoursYear = (staff * daysYear * saveMinPerDay) / 60;
const saveRubYear = Math.round(saveHoursYear * salaryHour);
const costDev = 480 * 1200;
const infraYear = 180000;
const supportYear = 240000;
const costYear1 = costDev + infraYear + supportYear;
const annualEffect = saveRubYear - (infraYear + supportYear);
const laborAsIs = Math.round((staff * daysYear * timeAsIsMin * salaryHour) / 60);
const laborToBe = Math.round((staff * daysYear * timeToBeMin * salaryHour) / 60);

const html = `<!doctype html>
<html><head><meta charset="utf-8"/>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
<style>
  body { margin: 0; padding: 24px; background: #fff; font-family: "Times New Roman", serif; }
  h1 { font-size: 18px; text-align: center; margin: 0 0 8px; font-weight: 700; }
  .sub { text-align: center; font-size: 13px; color: #333; margin-bottom: 16px; }
  .wrap { width: 920px; margin: 0 auto; }
  canvas { background: #fff; }
</style></head>
<body>
  <div class="wrap" id="box">
    <h1>Сравнение базового и предлагаемого вариантов</h1>
    <div class="sub">Показатели экономической эффективности проекта «Портал+1» (учебный расчёт)</div>
    <canvas id="c1" height="220"></canvas>
    <canvas id="c2" height="200" style="margin-top:20px"></canvas>
  </div>
  <script>
    const laborAsIs = ${laborAsIs};
    const laborToBe = ${laborToBe};
    const saveRubYear = ${saveRubYear};
    const costYear1 = ${costYear1};
    const annualEffect = ${annualEffect};
    const costDev = ${costDev};
    const fmt = (v) => (v/1000).toFixed(0);

    new Chart(document.getElementById('c1'), {
      type: 'bar',
      data: {
        labels: ['Стоимость трудозатрат аудитории, тыс. руб./год'],
        datasets: [
          { label: 'Базовый («как есть»)', data: [laborAsIs/1000], backgroundColor: '#9e9e9e' },
          { label: 'Предлагаемый («Портал+1»)', data: [laborToBe/1000], backgroundColor: '#2d8c7a' },
        ]
      },
      options: {
        responsive: false,
        animation: false,
        plugins: { legend: { position: 'bottom' } },
        scales: { y: { beginAtZero: true, title: { display: true, text: 'тыс. руб.' } } }
      }
    });

    new Chart(document.getElementById('c2'), {
      type: 'bar',
      data: {
        labels: [
          'Годовая экономия',
          'Затраты 1-го года',
          'Чистый годовой эффект',
          'Затраты на разработку'
        ],
        datasets: [{
          label: 'тыс. руб.',
          data: [saveRubYear/1000, costYear1/1000, annualEffect/1000, costDev/1000],
          backgroundColor: ['#2d8c7a', '#c75b39', '#3a7bd5', '#6b6b6b']
        }]
      },
      options: {
        responsive: false,
        animation: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, title: { display: true, text: 'тыс. руб.' } } }
      }
    });
  </script>
</body></html>`;

const tmp = path.join(__dirname, '../diagrams/econ_chart.html');
fs.writeFileSync(tmp, html, 'utf8');

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 980, height: 820 }, deviceScaleFactor: 2 });
await page.goto('file:///' + tmp.replace(/\\/g, '/'));
await page.waitForTimeout(1200);
const box = await page.locator('#box').boundingBox();
await page.screenshot({
  path: out,
  clip: { x: box.x, y: box.y, width: box.width, height: box.height + 8 },
});
await browser.close();
console.log('saved', out, `${Math.round(fs.statSync(out).size / 1024)} KB`);
console.log({ laborAsIs, laborToBe, saveRubYear, costYear1, annualEffect, costDev });
