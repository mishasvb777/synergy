import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const base = 'c:/Users/Михаил/Desktop/ДИПЛОМ';
const src = path.join(base, 'VKR_Glava1_isp.docx');
const dest = path.join(base, '_extract/check_ch1_tbl');
fs.rmSync(dest, { recursive: true, force: true });
fs.mkdirSync(dest, { recursive: true });
const zip = dest + '.zip';
fs.copyFileSync(src, zip);
const cmd = `Expand-Archive -LiteralPath '${zip}' -DestinationPath '${dest}' -Force`;
spawnSync('powershell', ['-NoProfile', '-Command', cmd], { encoding: 'utf8' });
const xml = fs.readFileSync(path.join(dest, 'word', 'document.xml'), 'utf8');
console.log('w:tbl count', (xml.match(/<w:tbl[\s>]/g) || []).length);
const texts = [...xml.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((m) => m[1]).join('\n');
console.log('has Термин header near table2', /Таблица 2[\s\S]{0,200}Термин/.test(texts.replace(/\n/g, ' ')));
