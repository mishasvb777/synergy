import fs from 'fs';
import path from 'path';

const docXml = fs.readFileSync(
  path.join('c:/Users/Михаил/Desktop/ДИПЛОМ/_extract/zamech_260807/word/document.xml'),
  'utf8'
);

// Get each red+yellow run separately with surrounding paragraph text
const paras = [...docXml.matchAll(/<w:p[\s>][\s\S]*?<\/w:p>/g)];
const hits = [];
for (const p of paras) {
  const xml = p[0];
  const hasYellow = /w:highlight\s+w:val="yellow"/i.test(xml);
  const hasRed = /w:color\s+w:val="FF0000"/i.test(xml);
  if (!hasYellow && !hasRed) continue;
  const full = [...xml.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((m) => m[1]).join('');
  const remarkParts = [];
  const runRe = /<w:r\b[\s\S]*?<\/w:r>/g;
  let m;
  while ((m = runRe.exec(xml))) {
    const run = m[0];
    const color = (run.match(/w:color\s+w:val="([^"]+)"/i) || [])[1];
    const hi = (run.match(/w:highlight\s+w:val="([^"]+)"/i) || [])[1];
    const text = [...run.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((x) => x[1]).join('');
    if ((color === 'FF0000' || hi === 'yellow') && text) remarkParts.push(text);
  }
  if (remarkParts.length) {
    hits.push({ remark: remarkParts.join(''), para: full.slice(0, 300) });
  }
}

hits.forEach((h, i) => {
  console.log('\n#' + (i + 1));
  console.log('REMARK:', h.remark);
  console.log('PARA:', h.para);
});
console.log('\nTOTAL', hits.length);
