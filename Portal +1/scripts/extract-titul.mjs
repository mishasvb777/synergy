import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const base = path.join(__dirname, '../..');
const src = path.join(base, '3_1_titulnyj_list_vkr_bak_shablon.docx');
const dest = path.join(base, '_extract/titul_shablon');
fs.rmSync(dest, { recursive: true, force: true });
fs.mkdirSync(dest, { recursive: true });
const zip = dest + '.zip';
fs.copyFileSync(src, zip);
const cmd = `Expand-Archive -LiteralPath '${zip.replace(/'/g, "''")}' -DestinationPath '${dest.replace(/'/g, "''")}' -Force`;
spawnSync('powershell', ['-NoProfile', '-Command', cmd], { encoding: 'utf8' });

const xml = fs.readFileSync(path.join(dest, 'word', 'document.xml'), 'utf8');
const withBreaks = xml
  .replace(/<\/w:p>/g, '\n')
  .replace(/<w:br[^/]*\/>/g, '\n')
  .replace(/<w:tab\/>/g, '\t');
const texts = [...withBreaks.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((m) => m[1]).join('');
fs.writeFileSync(path.join(base, '_extract/titul_shablon.txt'), texts, 'utf8');
console.log(texts);
console.log('--- styles snippet ---');
// dump paragraph properties for first paragraphs
const paras = [...xml.matchAll(/<w:p[\s>][\s\S]*?<\/w:p>/g)].slice(0, 40);
paras.forEach((p, i) => {
  const t = [...p[0].matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((m) => m[1]).join('');
  const sz = (p[0].match(/w:sz\s+w:val="(\d+)"/) || [])[1];
  const bold = /w:b[\s/]/.test(p[0]);
  const jc = (p[0].match(/w:jc\s+w:val="([^"]+)"/) || [])[1];
  if (t.trim()) console.log(i, { sz, bold, jc, t: t.slice(0, 100) });
});
const media = path.join(dest, 'word', 'media');
if (fs.existsSync(media)) console.log('media', fs.readdirSync(media));
