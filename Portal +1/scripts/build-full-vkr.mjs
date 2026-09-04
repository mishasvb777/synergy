/**
 * Полная ВКР: титул → указание на задание → содержание → введение →
 * гл.1 (с правками) → гл.2 (с правками) → гл.3 → заключение → литература → приложения.
 */
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  PageBreak,
  Footer,
  PageNumber,
} from 'docx';
import { getGlava2Children, writeGlava2Docx } from './build-glava2.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const diploma = path.join(root, '..');
const diags = path.join(root, 'diagrams');
const ch1Media = path.join(diploma, '_extract/VKR_Glava1_260515_zamech_docx/word/media');
const outFull = path.join(diploma, 'VKR_Ledovskih_Polny.docx');
const outCh1 = path.join(diploma, 'VKR_Glava1_isp.docx');

const border = {
  top: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
  left: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
  right: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
};

function p(text, opts = {}) {
  return new Paragraph({
    alignment: opts.align || AlignmentType.JUSTIFIED,
    spacing: { after: 120, line: 360 },
    indent: opts.indent === false ? {} : { firstLine: 709 },
    children: [
      new TextRun({
        text,
        font: 'Times New Roman',
        size: 28,
        bold: !!opts.bold,
      }),
    ],
  });
}

function center(text, bold = false) {
  return p(text, { align: AlignmentType.CENTER, indent: false, bold });
}

function hStruct(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 240, after: 200, line: 360 },
    children: [new TextRun({ text, font: 'Times New Roman', size: 28, bold: true })],
  });
}

function h(text) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { before: 240, after: 120, line: 360 },
    children: [new TextRun({ text, font: 'Times New Roman', size: 28, bold: true })],
  });
}

function caption(text) {
  return center(text, true);
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function pngSize(buf) {
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function img(file, maxW = 520) {
  if (!fs.existsSync(file)) {
    return center(`[нет файла: ${path.basename(file)}]`);
  }
  const buf = fs.readFileSync(file);
  const { width: iw, height: ih } = pngSize(buf);
  const width = maxW;
  const height = Math.max(160, Math.round((ih / iw) * maxW));
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 40 },
    children: [new ImageRun({ type: 'png', data: buf, transformation: { width, height } })],
  });
}

function table(headers, rows) {
  const width = Math.floor(9000 / headers.length);
  const mk = (text, bold = false) =>
    new TableCell({
      borders: border,
      width: { size: width, type: WidthType.DXA },
      children: [
        new Paragraph({
          spacing: { after: 40, line: 276 },
          children: [new TextRun({ text: String(text), font: 'Times New Roman', size: 22, bold })],
        }),
      ],
    });
  return new Table({
    width: { size: 9000, type: WidthType.DXA },
    rows: [
      new TableRow({ children: headers.map((hdr) => mk(hdr, true)) }),
      ...rows.map((r) => new TableRow({ children: r.map((c) => mk(c)) })),
    ],
  });
}

function empty() {
  return new Paragraph({ spacing: { after: 120 }, children: [] });
}

function titlePage() {
  return [
    center('АВТОНОМНАЯ НЕКОММЕРЧЕСКАЯ ОРГАНИЗАЦИЯ'),
    center('ВЫСШЕГО ОБРАЗОВАНИЯ'),
    center('«МОСКОВСКИЙ УНИВЕРСИТЕТ «СИНЕРГИЯ»'),
    empty(),
    center('Факультет информационных технологий'),
    center('Кафедра цифровой экономики'),
    empty(),
    empty(),
    empty(),
    center('ВЫПУСКНАЯ КВАЛИФИКАЦИОННАЯ РАБОТА'),
    center('(бакалаврская работа)'),
    empty(),
    p('по направлению подготовки 02.03.03 Математическое обеспечение и администрирование информационных систем', {
      align: AlignmentType.CENTER,
      indent: false,
    }),
    p('профиль «Разработка программного обеспечения (Full-stack разработка)»', {
      align: AlignmentType.CENTER,
      indent: false,
    }),
    empty(),
    empty(),
    center('на тему:'),
    p('«Разработка многопользовательского веб-приложения на примере ГК „Иннотех“»', {
      align: AlignmentType.CENTER,
      indent: false,
      bold: true,
    }),
    empty(),
    empty(),
    p('Обучающийся: Ледовских Михаил Алексеевич', { indent: false }),
    p('Руководитель: Новиков С.В.', { indent: false }),
    empty(),
    empty(),
    empty(),
    center('Москва 2026'),
    pageBreak(),
  ];
}

function assignmentNote() {
  return [
    hStruct('ЗАДАНИЕ НА ВЫПУСКНУЮ КВАЛИФИКАЦИОННУЮ РАБОТУ'),
    p(
      'Утверждённое задание на выпускную квалификационную работу обучающегося Ледовских М.А. (тема: «Разработка многопользовательского веб-приложения на примере ГК „Иннотех“», руководитель Новиков С.В., дата получения задания — 16 марта 2026 г.) прилагается к комплекту ВКР в виде отдельного бланка факультета информационных технологий. Ниже приведена структура работы, соответствующая заданию.'
    ),
    p(
      'Структура ВКР: Введение; Глава 1. Аналитическая часть; Глава 2. Проектная часть; Глава 3. Обоснование экономической эффективности проекта; Заключение; Список использованной литературы; Приложения.'
    ),
    pageBreak(),
  ];
}

function toc() {
  const items = [
    'ВВЕДЕНИЕ',
    'ГЛАВА 1. АНАЛИТИЧЕСКАЯ ЧАСТЬ',
    '1.1. Технико-экономическая характеристика предметной области и предприятия. Анализ деятельности «как есть»',
    '1.2. Характеристика комплекса задач, задачи и обоснование необходимости автоматизации',
    '1.3. Анализ существующих разработок и выбор стратегии автоматизации «как должно быть»',
    '1.4. Обоснование проектных решений',
    'ГЛАВА 2. ПРОЕКТНАЯ ЧАСТЬ',
    '2.1. Разработка проекта автоматизации',
    '2.2. Информационное обеспечение задачи',
    '2.3. Программное обеспечение задачи',
    '2.4. Контрольный пример реализации проекта и его описание',
    'ГЛАВА 3. ОБОСНОВАНИЕ ЭКОНОМИЧЕСКОЙ ЭФФЕКТИВНОСТИ ПРОЕКТА',
    '3.1. Выбор и обоснование методики расчёта экономической эффективности',
    '3.2. Расчёт показателей экономической эффективности проекта',
    'ЗАКЛЮЧЕНИЕ',
    'СПИСОК ИСПОЛЬЗОВАННОЙ ЛИТЕРАТУРЫ',
    'ПРИЛОЖЕНИЯ',
  ];
  return [
    hStruct('СОДЕРЖАНИЕ'),
    ...items.map((t) => p(t, { indent: false })),
    pageBreak(),
  ];
}

function introduction() {
  return [
    hStruct('ВВЕДЕНИЕ'),
    p(
      'Актуальность темы обусловлена ростом потребности крупных ИТ-организаций в единой точке доступа к внутрикорпоративной информации, операционным сервисам и обратной связи сотрудников. Веб-технологии и клиент-серверная архитектура позволяют реализовать корпоративный портал с ролевой моделью, новостной лентой, комментариями и реакциями при контролируемых затратах на сопровождение.'
    ),
    p(
      'Цель выпускной квалификационной работы: разработать и обосновать проектные решения многопользовательского веб-приложения корпоративного портала «Портал+1» на примере учебной модели ГК «Иннотех», обеспечивающего единую точку доступа к новостной ленте, комментариям, реакциям, меню операций и администрированию с ролевым разграничением доступа.'
    ),
    p('Для достижения поставленной цели решаются следующие задачи:'),
    p('1) провести анализ предметной области и процессов распространения внутрикорпоративной информации «как есть»;'),
    p('2) обосновать необходимость автоматизации и сформулировать функциональные и нефункциональные требования к MVP;'),
    p('3) выполнить сравнительный анализ готовых решений и выбрать стратегию собственной разработки;'),
    p('4) обосновать проектные решения по информационному, программному и техническому обеспечению;'),
    p('5) спроектировать и реализовать MVP портала на стеке React, Node.js, PostgreSQL и Redis;'),
    p('6) выполнить контрольный пример опытной эксплуатации и оценить экономическую эффективность проекта.'),
    p(
      'Объект исследования: процессы распространения внутрикорпоративной информации и взаимодействия сотрудников с корпоративными цифровыми сервисами в группе компаний в сфере информационных технологий на примере ГК «Иннотех» (в рамках учебной постановки допускаются обобщённые отраслевые допущения без опоры на конфиденциальные внутренние данные конкретной организации).'
    ),
    p(
      'Предмет исследования: методы и средства разработки многопользовательского веб-приложения — корпоративного портала «Портал+1» с подсистемой новостной ленты, комментариев и реакций, аутентификацией и администрированием, а также проектные решения по программному, информационному и техническому обеспечению на базе React, Node.js, PostgreSQL и Redis.'
    ),
    p(
      'Методы исследования: анализ предметной области и источников; сравнительный анализ программных аналогов; моделирование ролей, данных и компонентов системы; проектирование архитектуры клиент-сервер; обоснование технологического стека; расчёт показателей экономической эффективности.'
    ),
    p(
      'Информационная база исследования: нормативные акты и методические материалы в области защиты информации и проектирования информационных систем; открытые сведения о деятельности ГК «Иннотех»; официальная документация по применяемым технологиям; учебная и научная литература; допущения автора по сценариям «как есть» и «как должно быть» в учебном проекте.'
    ),
    p(
      'Практическая значимость: сформирован прототип (MVP) веб-приложения «Портал+1», который может служить основой для последующего согласования внедрения. Статус использования результатов — подготовка к внедрению / на согласовании у руководства (учебная постановка).'
    ),
    pageBreak(),
  ];
}

/** Число столбцов таблиц главы 1 (по тексту исходника). */
const CH1_TABLE_COLS = {
  1: 2,
  2: 2,
  3: 2,
  4: 3,
  5: 4,
  6: 2,
  7: 3,
  8: 2,
  9: 3,
  10: 3,
  11: 3,
  12: 3,
  13: 3,
};

function isCh1TableStop(line, cellsCollected, cols) {
  if (!line) return true;
  if (/^\d+\.\d+(\.\d+)?\./.test(line)) return true;
  if (/^Таблица\s+\d+/.test(line)) return true;
  if (/^Рис\.\s*\d+/.test(line)) return true;
  if (/^Глава\s+\d/i.test(line)) return true;
  if (/^ФРАГМЕНТ|^Тема:/.test(line)) return true;
  if (/^Хорошо бы/i.test(line)) return true;
  // Проза после таблицы: длинное предложение, когда уже есть хотя бы одна строка данных
  if (cellsCollected >= cols && line.length > 110 && /[.!?]$/.test(line)) return true;
  if (
    cellsCollected >= cols &&
    line.length > 85 &&
    line.split(/\s+/).length > 14 &&
    /[,;—–-]/.test(line)
  ) {
    return true;
  }
  return false;
}

function parseCh1Table(lines, startIdx) {
  let i = startIdx;
  const label = lines[i].trim();
  const num = Number((label.match(/^Таблица\s+(\d+)/) || [])[1]);
  const cols = CH1_TABLE_COLS[num] || 2;
  i++;

  let title = '';
  if (i < lines.length) {
    const t = lines[i].trim();
    if (t && !isCh1TableStop(t, 0, cols) && !/^\d+\.\d/.test(t)) {
      title = t;
      i++;
    }
  }

  const headers = [];
  for (let c = 0; c < cols && i < lines.length; c++) {
    const hcell = lines[i].trim();
    if (isCh1TableStop(hcell, 0, cols)) break;
    headers.push(hcell);
    i++;
  }
  while (headers.length < cols) headers.push('');

  const cells = [];
  while (i < lines.length) {
    const cell = lines[i].trim();
    if (isCh1TableStop(cell, cells.length, cols)) break;
    cells.push(cell);
    i++;
  }

  const rows = [];
  for (let r = 0; r < cells.length; r += cols) {
    const row = cells.slice(r, r + cols);
    while (row.length < cols) row.push('');
    rows.push(row);
  }

  return { label, title, headers, rows, nextIdx: i };
}

function buildChapter1() {
  const sourceTxt = path.join(diploma, '_extract/VKR_Glava1_260515_zamech.txt');
  const raw = fs.readFileSync(sourceTxt, 'utf8');
  let lines = raw.split(/\r?\n/);
  const skipExact = new Set([
    'Первым должен идти титульный лист. После титульного листа должно быть выданное и утвержденное задание. А уже затем Содержание и текст самой ВКР',
    'Во введении еще нужно поставить цель ВКР и сформулировать задачи для ее достижения',
    'Хорошо бы тогда функцйиональные требования представить в виде диаграммы вариантов использования (UML)',
  ]);
  lines = lines.filter((l) => !skipExact.has(l.trim()));

  const startIdx = lines.findIndex((l) => /^Глава\s+1/i.test(l.trim()));
  if (startIdx >= 0) lines = lines.slice(startIdx);

  const kids = [];
  let i = 0;
  let insertedUseCase = false;
  const figFiles = {
    'Рис. 1': path.join(ch1Media, 'image1.png'),
    'Рис. 2': path.join(ch1Media, 'image2.png'),
    'Рис. 3': path.join(ch1Media, 'image3.png'),
  };

  while (i < lines.length) {
    const trimmed = lines[i].trim();
    if (!trimmed) {
      i++;
      continue;
    }

    if (/^Глава\s+1/i.test(trimmed)) {
      kids.push(hStruct('ГЛАВА 1. АНАЛИТИЧЕСКАЯ ЧАСТЬ'));
      i++;
      continue;
    }

    if (!insertedUseCase && trimmed.startsWith('1.2.3. Обоснование необходимости использования вычислительной техники')) {
      kids.push(
        p(
          'Для наглядного представления функциональных требований построена диаграмма вариантов использования (UML). На диаграмме выделены актёры «Сотрудник», «Модератор» и «Администратор» и прецеденты портала: вход и регистрация, новости и обратная связь, активность, справочные и операционные сервисы, управление новостями и пользователями, контроль доступа.'
        )
      );
      kids.push(img(path.join(diags, 'use_case.png'), 540));
      kids.push(caption('Рис. 3а. Диаграмма вариантов использования «Портал+1»'));
      insertedUseCase = true;
      kids.push(h(trimmed));
      i++;
      continue;
    }

    if (/^\d+\.\d+(\.\d+)?\./.test(trimmed)) {
      kids.push(h(trimmed));
      i++;
      continue;
    }

    if (/^Таблица\s+\d+/.test(trimmed)) {
      const parsed = parseCh1Table(lines, i);
      kids.push(caption(parsed.label));
      if (parsed.title) kids.push(center(parsed.title));
      kids.push(table(parsed.headers, parsed.rows));
      kids.push(empty());
      i = parsed.nextIdx;
      continue;
    }

    if (/^Рис\.\s*\d+/.test(trimmed)) {
      kids.push(caption(trimmed));
      const key = Object.keys(figFiles).find((k) => trimmed.startsWith(k));
      if (key && fs.existsSync(figFiles[key])) {
        kids.push(img(figFiles[key], 500));
      }
      i++;
      continue;
    }

    if (/^ФРАГМЕНТ|^Тема:/.test(trimmed)) {
      i++;
      continue;
    }

    kids.push(p(trimmed));
    i++;
  }

  kids.push(pageBreak());
  return kids;
}

function chapter3() {
  // Учебный расчёт экономической эффективности
  const salaryHour = 850; // руб/час условно
  const staff = 200;
  const daysYear = 220;
  const timeAsIsMin = 12; // минут на поиск/согласование новости/сервиса
  const timeToBeMin = 4;
  const saveMinPerDay = timeAsIsMin - timeToBeMin;
  const saveHoursYear = (staff * daysYear * saveMinPerDay) / 60;
  const saveRubYear = Math.round(saveHoursYear * salaryHour);

  const devHours = 480;
  const rateDev = 1200;
  const costDev = devHours * rateDev;
  const infraYear = 180000;
  const supportYear = 240000;
  const costYear1 = costDev + infraYear + supportYear;
  const annualEffect = saveRubYear - (infraYear + supportYear);
  const paybackYears = +(costDev / Math.max(annualEffect, 1)).toFixed(2);
  const effCoef = +((saveRubYear / costYear1)).toFixed(2);

  return [
    hStruct('ГЛАВА 3. ОБОСНОВАНИЕ ЭКОНОМИЧЕСКОЙ ЭФФЕКТИВНОСТИ ПРОЕКТА'),
    h('3.1. Выбор и обоснование методики расчёта экономической эффективности'),
    p(
      'Для оценки экономического эффекта внедрения «Портал+1» применена методика сравнения базового («как есть») и предлагаемого («как должно быть») вариантов по трудозатратам сотрудников на поиск корпоративной информации и обращение к сервисам. Методика согласуется с подходами оценки эффективности информационных систем: сопоставляются годовые затраты времени, переведённые в стоимостное выражение, с капитальными и эксплуатационными затратами на разработку и сопровождение.'
    ),
    p(
      'В качестве ключевых показателей используются: годовая экономия трудозатрат (в часах и рублях); совокупные затраты первого года (разработка, инфраструктура, сопровождение); чистый годовой эффект после вычета эксплуатационных затрат; срок окупаемости капитальных затрат на разработку; коэффициент эффективности затрат первого года. Расчёт носит учебный характер и опирается на допущения, зафиксированные в таблице исходных данных.'
    ),
    caption('Таблица 22'),
    center('Исходные данные для расчёта (учебная модель)'),
    table(
      ['Показатель', 'Значение', 'Комментарий'],
      [
        ['Численность пользователей портала', String(staff), 'учебная оценка'],
        ['Рабочих дней в году', String(daysYear), 'без учёта отпусков сверх нормы'],
        ['Время на операцию «как есть», мин/день', String(timeAsIsMin), 'поиск по почте/чатам'],
        ['Время на операцию «как должно быть», мин/день', String(timeToBeMin), 'портал'],
        ['Стоимость часа работы сотрудника, руб.', String(salaryHour), 'усреднённо'],
        ['Трудозатраты разработки MVP, чел.-ч', String(devHours), 'аналитика+код+тесты'],
        ['Ставка разработчика, руб./ч', String(rateDev), 'учебная'],
        ['Инфраструктура в год, руб.', String(infraYear), 'хостинг/СУБД/резерв'],
        ['Сопровождение в год, руб.', String(supportYear), 'поддержка и обновления'],
      ]
    ),
    h('3.2. Расчёт показателей экономической эффективности проекта'),
    p(
      `Экономия времени одного сотрудника в день составляет ${saveMinPerDay} мин. Годовая экономия по организации: ${staff} × ${daysYear} × ${saveMinPerDay} / 60 = ${saveHoursYear.toFixed(0)} чел.-ч. В стоимостном выражении: ${saveHoursYear.toFixed(0)} × ${salaryHour} = ${saveRubYear.toLocaleString('ru-RU')} руб./год.`
    ),
    p(
      `Затраты на разработку: ${devHours} × ${rateDev} = ${costDev.toLocaleString('ru-RU')} руб. Затраты первого года с учётом инфраструктуры и сопровождения: ${costYear1.toLocaleString('ru-RU')} руб. Чистый годовой эффект после вычета эксплуатационных затрат: ${annualEffect.toLocaleString('ru-RU')} руб./год.`
    ),
    p(
      `Срок окупаемости затрат на разработку: ${costDev.toLocaleString('ru-RU')} / ${annualEffect.toLocaleString('ru-RU')} ≈ ${paybackYears} года. Коэффициент эффективности затрат первого года (отношение годовой экономии к затратам первого года): ${effCoef}.`
    ),
    caption('Таблица 23'),
    center('Сравнение базового и предлагаемого вариантов'),
    table(
      ['Показатель', 'Базовый («как есть»)', 'Предлагаемый («Портал+1»)'],
      [
        ['Время на типовую операцию, мин/день', String(timeAsIsMin), String(timeToBeMin)],
        ['Годовые трудозатраты аудитории, чел.-ч', String(Math.round((staff * daysYear * timeAsIsMin) / 60)), String(Math.round((staff * daysYear * timeToBeMin) / 60))],
        ['Стоимость трудозатрат, тыс. руб./год', String(Math.round((staff * daysYear * timeAsIsMin * salaryHour) / 60 / 1000)), String(Math.round((staff * daysYear * timeToBeMin * salaryHour) / 60 / 1000))],
        ['Единый контур новостей и сервисов', 'нет', 'да'],
        ['Ролевой контроль доступа', 'фрагментарный', 'RBAC на API'],
      ]
    ),
    caption('Таблица 24'),
    center('Итоговые показатели эффективности проекта'),
    table(
      ['Показатель', 'Значение'],
      [
        ['Годовая экономия, руб.', saveRubYear.toLocaleString('ru-RU')],
        ['Затраты на разработку, руб.', costDev.toLocaleString('ru-RU')],
        ['Затраты первого года, руб.', costYear1.toLocaleString('ru-RU')],
        ['Чистый годовой эффект, руб.', annualEffect.toLocaleString('ru-RU')],
        ['Срок окупаемости разработки, лет', String(paybackYears)],
        ['Коэффициент эффективности (год 1)', String(effCoef)],
      ]
    ),
    p(
      'Таким образом, при принятых допущениях внедрение «Портал+1» обеспечивает положительный чистый годовой эффект и окупаемость затрат на разработку в приемлемый для учебного проекта горизонт. Чувствительность результата определяется численностью активных пользователей и величиной экономии времени; при росте аудитории эффект масштабируется практически линейно, тогда как эксплуатационные затраты растут медленнее.'
    ),
    pageBreak(),
  ];
}

function conclusion() {
  return [
    hStruct('ЗАКЛЮЧЕНИЕ'),
    p(
      'В выпускной квалификационной работе рассмотрена задача разработки многопользовательского веб-приложения корпоративного портала на примере учебной модели ГК «Иннотех». Анализ процессов «как есть» показал фрагментацию каналов информирования и слабую формализацию обратной связи; обоснована необходимость автоматизации и сформулированы требования к MVP «Портал+1».'
    ),
    p(
      'В проектной части выбрана итерационная модель жизненного цикла, спроектированы информационное и программное обеспечение, реализован работающий стенд на стеке React, Node.js, PostgreSQL/PGlite и Redis. Контрольный пример подтвердил работоспособность сквозных сценариев: регистрация и вход, новости и реакции, активность, операционные сервисы, модерация и администрирование.'
    ),
    p(
      'Расчёт экономической эффективности при учебных допущениях показал положительный чистый годовой эффект и приемлемый срок окупаемости затрат на разработку за счёт сокращения времени сотрудников на поиск информации и обращение к сервисам.'
    ),
    p(
      'Цель работы достигнута: выполнен полный цикл от аналитического обоснования до реализации MVP и оценки эффекта. Рекомендации: поэтапное внедрение на инфраструктуре организации, подключение корпоративного SMTP и единого входа, расширение мониторинга и нагрузочное тестирование перед промышленной эксплуатацией. Полученные решения могут быть адаптированы в других ИТ-организациях со схожими требованиями к внутреннему порталу.'
    ),
    pageBreak(),
  ];
}

function literature() {
  const items = [
    'Казарин О. В., Шубинский И. Б. Надежность и безопасность программного обеспечения : учебное пособие для вузов. — М. : Юрайт, 2021. — 342 с.',
    'Информационные системы управления производственной компанией : учебник и практикум для вузов / под ред. Н. Н. Лычкиной. — М. : Юрайт, 2021. — 249 с.',
    'Организационное и правовое обеспечение информационной безопасности : учебник и практикум для вузов / под ред. А. А. Стрельцова. — М. : Юрайт, 2021. — 325 с.',
    'Ипатова Э. Р., Ипатов Ю. В. Методологии и технологии системного проектирования информационных систем : учебник. — 3-е изд. — М. : ФЛИНТА, 2021. — 256 с.',
    'Чернышов В. Н., Образцов Д. В., Платёнкин А. В. Моделирование информационных процессов и исследование в ИТ : учебное пособие. — Тамбов : ТГТУ, 2017. — 98 с.',
    'Милехина О. В., Захарова Е. Я., Титова В. А. Информационные системы: теоретические предпосылки к построению : учебное пособие. — 2-е изд. — Новосибирск : НГТУ, 2014. — 283 с.',
    'Экономическая информатика: введение в экономический анализ информационных систем : учебник / М. И. Лугачев и др. — М. : ИНФРА-М, 2005. — 956 с.',
    'Нетёсова О. Ю. Информационные системы и технологии в экономике : учебное пособие для вузов. — 3-е изд. — М. : Юрайт, 2021. — 178 с.',
    'Горелов С. В., Горелов В. П., Григорьев Е. А. Основы научных исследований : учебное пособие. — 2-е изд. — М. ; Берлин : Директ-Медиа, 2016. — 534 с.',
    'Мендель А. В. Модели принятия решений : учебное пособие. — М. : Юнити, 2015. — 463 с.',
    'Романова Ю. Д., Винтова Т. А., Коваль П. Е. Информационные технологии в управлении персоналом : учебник и практикум для вузов. — 3-е изд. — М. : Юрайт, 2021. — 271 с.',
    'Басыня Е. А. Системное администрирование и информационная безопасность : учебное пособие. — Новосибирск : НГТУ, 2018. — 79 с.',
    'Филиппов Б. И., Шерстнева О. Г. Информационная безопасность. Основы надежности средств связи : учебник. — М. ; Берлин : Директ-Медиа, 2019. — 240 с.',
    'Назаров С. В., Широков А. И. Современные операционные системы : учебное пособие. — М. : ИНТУИТ : Бином. Лаборатория знаний, 2011. — 280 с.',
    'Власенко А. Ю., Карабцев С. Н., Рейн Т. С. Операционные системы : учебное пособие. — Кемерово : КемГУ, 2019. — 161 с.',
    'Внуков А. А. Защита информации в банковских системах : учебное пособие для вузов. — 2-е изд. — М. : Юрайт, 2021. — 246 с.',
    'ГОСТ 34.601-90. Информационная технология. Комплекс стандартов на автоматизированные системы. Автоматизированные системы. Стадии создания.',
    'ГОСТ 34.602-89. Техническое задание на создание автоматизированной системы.',
    'ГОСТ Р 7.0.5-2008. Библиографическая ссылка. Общие требования и правила составления.',
    'ГОСТ 7.32-2017. Отчет о научно-исследовательской работе. Структура и правила оформления.',
    'Federal Law No. 152-FZ of 27.07.2006 «On Personal Data» (as amended) // ConsultantPlus.',
    'OWASP Foundation. OWASP Top 10 Web Application Security Risks. — 2021. — URL: https://owasp.org/Top10/',
    'Fielding R. T. Architectural Styles and the Design of Network-based Software Architectures : PhD Thesis. — University of California, Irvine, 2000.',
    'Gamma E., Helm R., Johnson R., Vlissides J. Design Patterns: Elements of Reusable Object-Oriented Software. — Addison-Wesley, 1994.',
    'Fowler M. Patterns of Enterprise Application Architecture. — Addison-Wesley, 2002.',
    'Martin R. C. Clean Architecture: A Craftsman’s Guide to Software Structure and Design. — Prentice Hall, 2017.',
    'Newman S. Building Microservices. — 2nd ed. — O’Reilly Media, 2021.',
    'Kleppmann M. Designing Data-Intensive Applications. — O’Reilly Media, 2017.',
    'React Documentation. — URL: https://react.dev/',
    'Node.js Documentation. — URL: https://nodejs.org/docs/',
    'Express.js Guide. — URL: https://expressjs.com/',
    'PostgreSQL 16 Documentation. — URL: https://www.postgresql.org/docs/',
    'Redis Documentation. — URL: https://redis.io/docs/',
    'MDN Web Docs. HTTP overview. — URL: https://developer.mozilla.org/en-US/docs/Web/HTTP',
    'JSON Web Token (JWT). RFC 7519. — IETF, 2015.',
    'The bcrypt Password Hashing Function. — OpenBSD / community implementations.',
    'Material UI Documentation. — URL: https://mui.com/',
    'Vite Documentation. — URL: https://vitejs.dev/',
    'TypeScript Handbook. — URL: https://www.typescriptlang.org/docs/',
    'Somerville I. Software Engineering. — 10th ed. — Pearson, 2015.',
    'Pressman R. S., Maxim B. R. Software Engineering: A Practitioner’s Approach. — 9th ed. — McGraw-Hill, 2019.',
    'Bass L., Clements P., Kazman R. Software Architecture in Practice. — 4th ed. — Addison-Wesley, 2021.',
    'Cohn M. Succeeding with Agile. — Addison-Wesley, 2009.',
    'Pohl K. Requirements Engineering: Fundamentals, Principles, and Techniques. — Springer, 2010.',
    'Larman C. Applying UML and Patterns. — 3rd ed. — Prentice Hall, 2004.',
    'Date C. J. An Introduction to Database Systems. — 8th ed. — Pearson, 2003.',
    'Elmasri R., Navathe S. B. Fundamentals of Database Systems. — 7th ed. — Pearson, 2015.',
    'Tanenbaum A. S., Wetherall D. J. Computer Networks. — 5th ed. — Prentice Hall, 2010.',
    'Stallings W. Cryptography and Network Security. — 8th ed. — Pearson, 2020.',
    'Anderson R. Security Engineering. — 3rd ed. — Wiley, 2020.',
    'Официальный сайт ГК «Иннотех». — URL: https://inno.tech/',
    'Образовательная платформа «Юрайт». — URL: https://urait.ru/',
    'Официальный интернет-портал правовой информации. — URL: http://pravo.gov.ru/',
    'Портал федеральных государственных образовательных стандартов. — URL: http://fgosvo.ru/',
    'КонсультантПлюс. — URL: http://www.consultant.ru/',
  ];
  return [
    hStruct('СПИСОК ИСПОЛЬЗОВАННОЙ ЛИТЕРАТУРЫ'),
    ...items.map((t, idx) => p(`${idx + 1}. ${t}`, { indent: false })),
    pageBreak(),
  ];
}

function appendix() {
  const files = [
    path.join(root, 'backend/src/middleware/auth.ts'),
    path.join(root, 'backend/src/routes/reactions.ts'),
    path.join(root, 'backend/src/routes/auth.ts'),
  ];
  let code = '';
  for (const f of files) {
    if (!fs.existsSync(f)) continue;
    code += `// ===== ${path.basename(f)} =====\n`;
    code += fs.readFileSync(f, 'utf8') + '\n\n';
  }
  const lines = code.split(/\r?\n/).slice(0, 420);
  const chunks = [];
  for (let i = 0; i < lines.length; i += 40) {
    chunks.push(lines.slice(i, i + 40).join('\n'));
  }

  return [
    hStruct('ПРИЛОЖЕНИЕ А'),
    center('Фрагмент листинга программного кода основных модулей MVP «Портал+1»'),
    p(
      'Ниже приведён фрагмент исходного кода серверных модулей аутентификации и переключения реакции (лайк), реализованных на TypeScript (Node.js / Express).',
      { indent: false }
    ),
    ...chunks.map(
      (block) =>
        new Paragraph({
          spacing: { after: 80, line: 276 },
          children: [new TextRun({ text: block, font: 'Courier New', size: 18 })],
        })
    ),
  ];
}

async function writeCh1Fixed() {
  const kids = [
    center('ФРАГМЕНТ ВЫПУСКНОЙ КВАЛИФИКАЦИОННОЙ РАБОТЫ'),
    p(
      'Тема: Разработка многопользовательского веб-приложения на примере ГК «Иннотех» (учебный проект «Портал+1»).',
      { align: AlignmentType.CENTER, indent: false }
    ),
    ...introduction().filter((x) => true).slice(0, -1), // intro without trailing pageBreak duplicate handling
  ];
  // Better: just rebuild ch1-only with goal already in isp via buildChapter1 path - for isp file include intro fragment + ch1
  const doc = new Document({
    sections: [
      {
        properties: { page: { margin: { top: 1134, bottom: 1134, left: 1701, right: 850 } } },
        children: [
          center('ФРАГМЕНТ ВЫПУСКНОЙ КВАЛИФИКАЦИОННОЙ РАБОТЫ'),
          p(
            'Тема: Разработка многопользовательского веб-приложения на примере ГК «Иннотех» (учебный проект «Портал+1»).',
            { align: AlignmentType.CENTER, indent: false }
          ),
          hStruct('ФРАГМЕНТ ВВЕДЕНИЯ'),
          ...introduction().slice(1, -1),
          ...buildChapter1().slice(0, -1),
        ],
      },
    ],
  });
  const buf = await Packer.toBuffer(doc);
  fs.writeFileSync(outCh1, buf);
  console.log('Saved', outCh1, `${Math.round(buf.length / 1024)} KB`);
}

async function main() {
  if (process.env.SKIP_G2 !== '1') {
    console.log('Writing chapter 2 upd...');
    await writeGlava2Docx();
  }

  console.log('Writing chapter 1 isp...');
  await writeCh1Fixed();

  console.log('Assembling body (without title page)...');
  const children = [
    ...assignmentNote(),
    ...toc(),
    ...introduction(),
    ...buildChapter1(),
    ...getGlava2Children(),
    pageBreak(),
    ...chapter3(),
    ...conclusion(),
    ...literature(),
    ...appendix(),
  ];

  const doc = new Document({
    sections: [
      {
        properties: {
          page: { margin: { top: 1134, bottom: 1134, left: 1701, right: 850 } },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    font: 'Times New Roman',
                    size: 20,
                    children: [PageNumber.CURRENT],
                  }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  const bodyPath = path.join(diploma, 'VKR_Ledovskih_Body.docx');
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(bodyPath, buffer);
  console.log('Saved body', bodyPath, `${Math.round(buffer.length / 1024)} KB`);

  console.log('Filling official title template...');
  const fill = spawnSync('node', [path.join(__dirname, 'fill-titul.mjs')], {
    encoding: 'utf8',
    cwd: root,
  });
  process.stdout.write(fill.stdout || '');
  if (fill.status !== 0) {
    console.error(fill.stderr);
    throw new Error('fill-titul failed');
  }

  console.log('Merging title + body into full VKR...');
  const titulFilled = path.join(diploma, 'VKR_Titul_filled.docx');
  const outAlt = path.join(diploma, 'VKR_Ledovskih_Polny_upd.docx');
  const mergePs = `
$ErrorActionPreference = 'Stop'
Get-Process WINWORD -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1
$titul = ${JSON.stringify(titulFilled)}
$body = ${JSON.stringify(bodyPath)}
$out = ${JSON.stringify(outFull)}
$outAlt = ${JSON.stringify(outAlt)}

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
$doc = $word.Documents.Open($titul)
$word.Selection.EndKey(6) | Out-Null
$word.Selection.InsertBreak(7) | Out-Null
$word.Selection.InsertFile($body) | Out-Null

$wdFormatXMLDocument = 12
try {
  if (Test-Path -LiteralPath $out) { Remove-Item -LiteralPath $out -Force -ErrorAction Stop }
  $doc.SaveAs2([ref]$out, [ref]$wdFormatXMLDocument) | Out-Null
  Write-Output ("Saved " + $out)
} catch {
  if (Test-Path -LiteralPath $outAlt) { Remove-Item -LiteralPath $outAlt -Force -ErrorAction SilentlyContinue }
  $doc.SaveAs2([ref]$outAlt, [ref]$wdFormatXMLDocument) | Out-Null
  Write-Output ("Locked, saved " + $outAlt)
}
$doc.Close() | Out-Null
$word.Quit() | Out-Null
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
`;
  const mergePath = path.join(diploma, '_extract/merge_titul.ps1');
  fs.writeFileSync(mergePath, '\uFEFF' + mergePs, 'utf8');
  const merge = spawnSync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', mergePath], {
    encoding: 'utf8',
    timeout: 300000,
  });
  process.stdout.write(merge.stdout || '');
  if (merge.stderr) process.stderr.write(merge.stderr);
  if (merge.status !== 0) throw new Error('merge failed');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
