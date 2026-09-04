import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const xmlPath = path.join(__dirname, '../../_extract/titul_shablon/word/document.xml');
const xml = fs.readFileSync(xmlPath, 'utf8');

// Count tables and show cell texts
const tables = [...xml.matchAll(/<w:tbl[\s>][\s\S]*?<\/w:tbl>/g)];
console.log('tables', tables.length);
tables.forEach((t, ti) => {
  const rows = [...t[0].matchAll(/<w:tr[\s>][\s\S]*?<\/w:tr>/g)];
  console.log('\nTABLE', ti, 'rows', rows.length);
  rows.forEach((r, ri) => {
    const cells = [...r[0].matchAll(/<w:tc[\s>][\s\S]*?<\/w:tc>/g)];
    const cellTexts = cells.map((c) =>
      [...c[0].matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((m) => m[1]).join('')
    );
    console.log('  row', ri, cellTexts);
  });
});

// body structure: paragraphs between tables
const body = xml.match(/<w:body>([\s\S]*)<\/w:body>/)[1];
const parts = body.split(/(?=<w:tbl[\s>])|(?<=<\/w:tbl>)/);
console.log('\nBODY PARTS', parts.length);
parts.forEach((part, i) => {
  if (part.startsWith('<w:tbl')) {
    console.log(i, 'TABLE');
  } else {
    const texts = [...part.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((m) => m[1]);
    if (texts.some((t) => t.trim())) console.log(i, 'P', texts.filter((t) => t.trim()).join(' | '));
  }
});
