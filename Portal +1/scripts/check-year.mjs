import fs from 'fs';
const xml = fs.readFileSync(
  'c:/Users/Михаил/Desktop/ДИПЛОМ/_extract/titul_filled_check/word/document.xml',
  'utf8'
);
const t = [...xml.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((m) => m[1]).join('|');
const idx = t.lastIndexOf('МОСКВА');
console.log('last MOSKVA', JSON.stringify(t.slice(idx, idx + 50)));
console.log('joined includes MOSKVA 2026', t.replace(/\|/g, '').includes('МОСКВА 2026'));
