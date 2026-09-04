import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType } from 'docx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const diploma = path.join(__dirname, '../..');
const useCasePng = path.join(diploma, 'portal-plus1/diagrams/use_case.png');
const outPath = path.join(diploma, 'VKR_Glava1_vstavki_po_zamechaniyam.docx');

const p = (text, opts = {}) =>
  new Paragraph({
    alignment: opts.align || AlignmentType.JUSTIFIED,
    spacing: { after: 120, line: 360 },
    indent: opts.indent === false ? {} : { firstLine: 709 },
    children: [new TextRun({ text, font: 'Times New Roman', size: 28, bold: !!opts.bold })],
  });

const children = [
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200, line: 360 },
    children: [new TextRun({ text: 'Вставки в главу 1 по замечаниям проверяющего', font: 'Times New Roman', size: 28, bold: true })],
  }),
  p('1) Удалить из текста ремарки проверяющего (про титульный лист/задание; «нужно поставить цель»; замечание про UML).', { indent: false }),
  p('2) Вставить во введение после абзаца о практической значимости:', { indent: false }),
  p('Цель выпускной квалификационной работы: разработать и обосновать проектные решения многопользовательского веб-приложения корпоративного портала «Портал+1» на примере учебной модели ГК «Иннотех», обеспечивающего единую точку доступа к новостной ленте, комментариям, реакциям, меню операций и администрированию с ролевым разграничением доступа.'),
  p('Для достижения поставленной цели решаются следующие задачи:'),
  p('1) провести анализ предметной области и процессов распространения внутрикорпоративной информации «как есть»;'),
  p('2) обосновать необходимость автоматизации и сформулировать функциональные и нефункциональные требования к MVP;'),
  p('3) выполнить сравнительный анализ готовых решений и выбрать стратегию собственной разработки;'),
  p('4) обосновать проектные решения по информационному, программному и техническому обеспечению;'),
  p('5) спроектировать и реализовать MVP портала на стеке React, Node.js, PostgreSQL и Redis;'),
  p('6) выполнить контрольный пример опытной эксплуатации и подготовить основу для оценки экономической эффективности.'),
  p('3) Перед разделом 1.2.3 вставить текст и рисунок UML use case:', { indent: false }),
  p('Для наглядного представления функциональных требований построена диаграмма вариантов использования (UML). На диаграмме выделены актёры «Сотрудник», «Модератор» и «Администратор» и базовые прецеденты: вход в систему, просмотр ленты, комментирование, реакции, меню операций, управление новостями, администрирование пользователей и ролей.'),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new ImageRun({
        type: 'png',
        data: fs.readFileSync(useCasePng),
        transformation: { width: 520, height: 300 },
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 200 },
    children: [new TextRun({ text: 'Рис. 3а. Диаграмма вариантов использования «Портал+1»', font: 'Times New Roman', size: 28, bold: true })],
  }),
  p('Готовый файл с уже внесёнными правками (текст главы без замечаний + цель/задачи + UML): VKR_Glava1_isp.docx. Исходник с ремарками сохранён как VKR_Glava1_260515_zamech.docx.', { indent: false }),
];

const doc = new Document({
  sections: [{ properties: { page: { margin: { top: 1134, bottom: 1134, left: 1701, right: 850 } } }, children }],
});
fs.writeFileSync(outPath, await Packer.toBuffer(doc));
console.log('Saved', outPath);
