import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const base = path.join(__dirname, '../..');

function extractZip(docx, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const zip = dest + '.zip';
  fs.copyFileSync(docx, zip);
  const cmd = `Expand-Archive -LiteralPath '${zip.replace(/'/g, "''")}' -DestinationPath '${dest.replace(/'/g, "''")}' -Force`;
  const r = spawnSync('powershell', ['-NoProfile', '-Command', cmd], { encoding: 'utf8' });
  if (r.status !== 0) {
    console.error('unzip fail', dest, r.stderr);
  }
}

function textsFromXml(xml) {
  const re = /<w:t[^>]*>([^<]*)<\/w:t>/g;
  let m;
  const out = [];
  while ((m = re.exec(xml))) out.push(m[1]);
  return out.join('');
}

function getComments(docxDir) {
  const p = path.join(docxDir, 'word', 'comments.xml');
  if (!fs.existsSync(p)) return [];
  const xml = fs.readFileSync(p, 'utf8');
  const comments = [];
  const re = /<w:comment\b([^>]*)>([\s\S]*?)<\/w:comment>/g;
  let m;
  while ((m = re.exec(xml))) {
    const attrs = m[1];
    const id = (attrs.match(/w:id="(\d+)"/) || [])[1];
    const author = (attrs.match(/w:author="([^"]*)"/) || [])[1];
    comments.push({ id, author, text: textsFromXml(m[2]) });
  }
  return comments;
}

/** Extract document text with nearby comment refs */
function getDocText(docxDir, maxChars = 80000) {
  const p = path.join(docxDir, 'word', 'document.xml');
  const xml = fs.readFileSync(p, 'utf8');
  // Replace paragraph ends with newlines
  const withBreaks = xml
    .replace(/<\/w:p>/g, '\n')
    .replace(/<w:tab\/>/g, '\t')
    .replace(/<w:br[^/]*\/>/g, '\n');
  return textsFromXml(withBreaks).slice(0, maxChars);
}

const files = ['VKR_Glava2_260728_zamech.docx', 'VKR_Glava1_260515_zamech.docx'];

for (const f of files) {
  const dest = path.join(base, '_extract', f.replace('.docx', '_docx'));
  console.log('\n========', f, '========');
  extractZip(path.join(base, f), dest);
  const cs = getComments(dest);
  console.log('COMMENTS:', cs.length);
  const outComments = path.join(base, '_extract', f.replace('.docx', '_comments.txt'));
  fs.writeFileSync(
    outComments,
    cs.map((c) => `[${c.id}] ${c.author}: ${c.text}`).join('\n\n'),
    'utf8'
  );
  console.log('wrote', outComments);
  const txt = getDocText(dest, 200000);
  const outTxt = path.join(base, '_extract', f.replace('.docx', '_body.txt'));
  fs.writeFileSync(outTxt, txt, 'utf8');
  console.log('body chars', txt.length, '->', outTxt);
}
