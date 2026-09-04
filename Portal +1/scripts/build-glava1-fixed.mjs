import fs from 'fs';
import path from 'path';
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
  BorderStyle,
  WidthType,
} from 'docx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const diploma = path.join(__dirname, '../..');
const sourceTxt = path.join(diploma, '_extract/VKR_Glava1_260515_zamech.txt');
const useCasePng = path.join(diploma, 'portal-plus1/diagrams/use_case.png');
const outPath = path.join(diploma, 'VKR_Glava1_isp.docx');

const raw = fs.readFileSync(sourceTxt, 'utf8');
let lines = raw.split(/\r?\n/);

// Drop reviewer remarks that are not part of thesis body
const skipExact = new Set([
  'Первым должен идти титульный лист. После титульного листа должно быть выданное и утвержденное задание. А уже затем Содержание и текст самой ВКР',
  'Во введении еще нужно поставить цель ВКР и сформулировать задачи для ее достижения',
  'Хорошо бы тогда функцйиональные требования представить в виде диаграммы вариантов использования (UML)',
]);

lines = lines.filter((l) => !skipExact.has(l.trim()));

const goalBlock = [
  'Цель выпускной квалификационной работы: разработать и обосновать проектные решения многопользовательского веб-приложения корпоративного портала «Портал+1» на примере учебной модели ГК «Иннотех», обеспечивающего единую точку доступа к новостной ленте, комментариям, реакциям, меню операций и администрированию с ролевым разграничением доступа.',
  'Для достижения поставленной цели решаются следующие задачи:',
  '1) провести анализ предметной области и процессов распространения внутрикорпоративной информации «как есть»;',
  '2) обосновать необходимость автоматизации и сформулировать функциональные и нефункциональные требования к MVP;',
  '3) выполнить сравнительный анализ готовых решений и выбрать стратегию собственной разработки;',
  '4) обосновать проектные решения по информационному, программному и техническому обеспечению;',
  '5) спроектировать и реализовать MVP портала на стеке React, Node.js, PostgreSQL и Redis;',
  '6) выполнить контрольный пример опытной эксплуатации и подготовить основу для оценки экономической эффективности.',
];

const border = {
  top: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
  left: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
  right: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
};

function isHeading(line) {
  return (
    /^Глава\s+\d/i.test(line) ||
    /^\d+\.\d+(\.\d+)?\./.test(line) ||
    /^ФРАГМЕНТ/.test(line) ||
    /^Тема:/.test(line) ||
    /^Таблица\s+\d+/.test(line) ||
    /^Рис\.\s*\d+/.test(line)
  );
}

function isTableCaption(line) {
  return /^Таблица\s+\d+/.test(line) || /^Рис\.\s*\d+/.test(line);
}

function p(text, opts = {}) {
  return new Paragraph({
    alignment: opts.align || AlignmentType.JUSTIFIED,
    spacing: { after: 120, line: 360 },
    indent: opts.indent === false ? {} : { firstLine: 709 },
    children: [new TextRun({ text, font: 'Times New Roman', size: 28, bold: !!opts.bold })],
  });
}

function centered(text, bold = false) {
  return p(text, { align: AlignmentType.CENTER, indent: false, bold });
}

function h(text) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { before: 200, after: 120, line: 360 },
    children: [new TextRun({ text, font: 'Times New Roman', size: 28 })],
  });
}

const children = [];
let i = 0;
let insertedGoal = false;
let insertedUseCase = false;

while (i < lines.length) {
  const line = lines[i].trimEnd();
  const trimmed = line.trim();
  if (!trimmed) {
    i++;
    continue;
  }

  if (/^ФРАГМЕНТ|^Тема:|^Глава\s+1/i.test(trimmed)) {
    children.push(centered(trimmed));
    i++;
    continue;
  }

  // Insert goal after practical significance paragraph
  if (!insertedGoal && trimmed.startsWith('Практическая значимость:')) {
    children.push(p(trimmed));
    for (const g of goalBlock) children.push(p(g));
    insertedGoal = true;
    i++;
    continue;
  }

  if (!insertedUseCase && trimmed.startsWith('1.2.3. Обоснование необходимости использования вычислительной техники')) {
    children.push(
      p(
        'Для наглядного представления функциональных требований построена диаграмма вариантов использования (UML). На диаграмме выделены актёры «Сотрудник», «Модератор» и «Администратор» и базовые прецеденты: вход в систему, просмотр ленты, комментирование, реакции, меню операций, управление новостями, администрирование пользователей и ролей.'
      )
    );
    const buf = fs.readFileSync(useCasePng);
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 120, after: 80 },
        children: [new ImageRun({ type: 'png', data: buf, transformation: { width: 520, height: 300 } })],
      })
    );
    children.push(centered('Рис. 3а. Диаграмма вариантов использования «Портал+1»', true));
    insertedUseCase = true;
    children.push(h(trimmed));
    i++;
    continue;
  }

  if (/^\d+\.\d+(\.\d+)?\./.test(trimmed) || /^1\.\d/.test(trimmed)) {
    children.push(h(trimmed));
    i++;
    continue;
  }

  if (/^Таблица\s+\d+/.test(trimmed) || /^Рис\.\s*\d+/.test(trimmed)) {
    children.push(centered(trimmed, true));
    i++;
    if (i < lines.length) {
      const next = lines[i].trim();
      if (next && !isHeading(next) && next.length < 120 && !next.endsWith('.')) {
        children.push(centered(next));
        i++;
      }
    }
    continue;
  }

  // Simple two-column-ish tables detection is hard from plain text; keep as paragraphs
  // Detect table-looking short consecutive lines after "Показатель" headers — keep as plain text paragraphs for fidelity
  children.push(p(trimmed));
  i++;
}

if (!insertedGoal) {
  // fallback insert near top after methods
  children.splice(8, 0, ...goalBlock.map((g) => p(g)));
}

const doc = new Document({
  sections: [
    {
      properties: {
        page: {
          margin: { top: 1134, bottom: 1134, left: 1701, right: 850 },
        },
      },
      children,
    },
  ],
});

const buffer = await Packer.toBuffer(doc);
fs.writeFileSync(outPath, buffer);
console.log('Saved', outPath, 'bytes', buffer.length, 'goal', insertedGoal, 'usecase', insertedUseCase);
