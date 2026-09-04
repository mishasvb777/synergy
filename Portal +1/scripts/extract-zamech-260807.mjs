import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const src = String.raw`c:\Users\Михаил\Downloads\VKR_Ledovskih_260807_zamech.docx`;
const dest = String.raw`c:\Users\Михаил\Desktop\ДИПЛОМ\_extract\zamech_260807`;
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

function textsFromXml(xml) {
  return [...xml.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((m) => m[1]).join('');
}

const commentsPath = path.join(dest, 'word', 'comments.xml');
const comments = [];
if (fs.existsSync(commentsPath)) {
  const xml = fs.readFileSync(commentsPath, 'utf8');
  const re = /<w:comment\b([^>]*)>([\s\S]*?)<\/w:comment>/g;
  let m;
  while ((m = re.exec(xml))) {
    const id = (m[1].match(/w:id="(\d+)"/) || [])[1];
    const author = (m[1].match(/w:author="([^"]*)"/) || [])[1];
    comments.push({ id, author, text: textsFromXml(m[2]) });
  }
}

const docXml = fs.readFileSync(path.join(dest, 'word', 'document.xml'), 'utf8');
const colored = [];
const runRe = /<w:r\b[\s\S]*?<\/w:r>/g;
let rm;
while ((rm = runRe.exec(docXml))) {
  const run = rm[0];
  const color = (run.match(/w:color\s+w:val="([^"]+)"/i) || [])[1];
  const hi = (run.match(/w:highlight\s+w:val="([^"]+)"/i) || [])[1];
  const text = [...run.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((x) => x[1]).join('');
  if (!text.trim()) continue;
  if ((color && !/^0{6}$/i.test(color) && color.toLowerCase() !== 'auto') || hi) {
    colored.push({ color: color || '', hi: hi || '', text });
  }
}

// merge adjacent same-color remarks
const merged = [];
for (const c of colored) {
  const prev = merged[merged.length - 1];
  if (prev && prev.color === c.color && prev.hi === c.hi) prev.text += c.text;
  else merged.push({ ...c });
}

const out = path.join(dest, '..', 'zamech_260807_remarks.txt');
const bodyBreaks = docXml
  .replace(/<\/w:p>/g, '\n')
  .replace(/<w:tab\/>/g, '\t');
const body = textsFromXml(bodyBreaks);
fs.writeFileSync(
  out,
  [
    '=== COMMENTS ' + comments.length + ' ===',
    ...comments.map((c) => `[${c.id}] ${c.author}: ${c.text}`),
    '',
    '=== COLORED ' + merged.length + ' ===',
    ...merged.map((c, i) => `${i + 1}. [${c.color}|${c.hi}] ${c.text}`),
  ].join('\n\n'),
  'utf8'
);
fs.writeFileSync(path.join(dest, '..', 'zamech_260807_body.txt'), body.slice(0, 250000), 'utf8');
console.log('comments', comments.length);
console.log('colored unique-ish', merged.length);
merged.forEach((c, i) => console.log(i + 1, c.color, c.hi, JSON.stringify(c.text.slice(0, 200))));
console.log('body chars', body.length);
console.log('wrote', out);
