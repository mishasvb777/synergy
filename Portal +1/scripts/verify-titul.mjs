import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const base = 'c:/Users/Михаил/Desktop/ДИПЛОМ';
const src = path.join(base, 'VKR_Titul_filled.docx');
const dest = path.join(base, '_extract/titul_filled_check');
fs.rmSync(dest, { recursive: true, force: true });
fs.mkdirSync(dest, { recursive: true });
const zip = dest + '.zip';
fs.copyFileSync(src, zip);
spawnSync(
  'powershell',
  [
    '-NoProfile',
    '-Command',
    `Expand-Archive -LiteralPath ${JSON.stringify(zip)} -DestinationPath ${JSON.stringify(dest)} -Force`,
  ],
  { encoding: 'utf8' }
);
const xml = fs.readFileSync(path.join(dest, 'word', 'document.xml'), 'utf8');
const text = [...xml.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((m) => m[1]).join(' ');
for (const s of [
  'Ледовских Михаил Алексеевич',
  'Новиков С.В.',
  'Иннотех',
  'МОСКВА 2026',
  'ВЫПУСКНАЯ КВАЛИФИКАЦИОННАЯ РАБОТА',
  'Full-stack',
]) {
  console.log(s, '->', text.includes(s));
}
