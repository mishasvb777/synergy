import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const base = path.join(__dirname, '../..');
const docXml = path.join(base, '_extract/VKR_Glava1_260515_zamech_docx/word/document.xml');
const xml = fs.readFileSync(docXml, 'utf8');

// Find runs with red color or highlight
const redRuns = [];
const re = /<w:r\b[\s\S]*?<\/w:r>/g;
let m;
while ((m = re.exec(xml))) {
  const run = m[0];
  const isRed = /w:color\s+w:val="(?:FF0000|C00000|FF0000|ff0000|c00000)"/i.test(run)
    || /w:highlight\s+w:val="/i.test(run)
    || /w:color\s+w:val="FF0000"/i.test(run);
  const texts = [];
  const tr = /<w:t[^>]*>([^<]*)<\/w:t>/g;
  let t;
  while ((t = tr.exec(run))) texts.push(t[1]);
  const text = texts.join('');
  if (!text.trim()) continue;
  if (isRed || /w:color\s+w:val="(?!000000|auto)/i.test(run)) {
    const color = (run.match(/w:color\s+w:val="([^"]+)"/i) || [])[1];
    const hi = (run.match(/w:highlight\s+w:val="([^"]+)"/i) || [])[1];
    if (color && color.toLowerCase() !== '000000' && color.toLowerCase() !== 'auto') {
      redRuns.push({ color, hi, text });
    } else if (hi) {
      redRuns.push({ color, hi, text });
    }
  }
}

console.log('colored runs', redRuns.length);
const uniq = [];
const seen = new Set();
for (const r of redRuns) {
  const key = r.text.trim();
  if (seen.has(key)) continue;
  seen.add(key);
  uniq.push(r);
}
fs.writeFileSync(
  path.join(base, '_extract/VKR_Glava1_colored_remarks.txt'),
  uniq.map((r) => `[${r.color || ''}|${r.hi || ''}] ${r.text}`).join('\n'),
  'utf8'
);
console.log('unique', uniq.length);

// Also check for w:commentRange or annotations
console.log('commentRange', (xml.match(/commentRange/g) || []).length);
console.log('ins/del', (xml.match(/<w:ins\b/g) || []).length, (xml.match(/<w:del\b/g) || []).length);

// Dump first 80 unique colored
uniq.slice(0, 120).forEach((r, i) => console.log(i, r.color, r.hi, JSON.stringify(r.text)));

