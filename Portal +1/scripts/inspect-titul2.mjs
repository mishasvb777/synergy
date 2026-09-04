import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const xmlPath = path.join(__dirname, '../../_extract/titul_shablon/word/document.xml');
const xml = fs.readFileSync(xmlPath, 'utf8');

// Pretty-print table 1 and 2 cell XML snippets (truncated)
const tables = [...xml.matchAll(/<w:tbl[\s>][\s\S]*?<\/w:tbl>/g)];
for (const ti of [1, 2]) {
  const rows = [...tables[ti][0].matchAll(/<w:tr[\s>][\s\S]*?<\/w:tr>/g)];
  console.log('\n==== TABLE', ti, '====');
  rows.forEach((r, ri) => {
    const cells = [...r[0].matchAll(/<w:tc[\s>][\s\S]*?<\/w:tc>/g)];
    cells.forEach((c, ci) => {
      const t = [...c[0].matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((m) => m[1]).join('|');
      const hasP = (c[0].match(/<w:p[\s>]/g) || []).length;
      console.log(`r${ri}c${ci} texts=[${t}] paras=${hasP} len=${c[0].length}`);
    });
  });
}

// Check for logo position
console.log('\nlogo refs', (xml.match(/image1/g) || []).length);
console.log('drawing', (xml.match(/<w:drawing>/g) || []).length);
