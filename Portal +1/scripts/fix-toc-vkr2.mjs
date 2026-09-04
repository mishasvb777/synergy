import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const diploma = path.join(__dirname, '../..');
const vkr = path.join(diploma, 'VKR_Ledovskih_2.docx');
const outAlt = path.join(diploma, 'VKR_Ledovskih_2_isp.docx');

const tocDefs = [
  ['ВВЕДЕНИЕ', 'ВВЕДЕНИЕ', 'BM_INTRO'],
  ['ГЛАВА 1. АНАЛИТИЧЕСКАЯ ЧАСТЬ', 'ГЛАВА 1. АНАЛИТИЧЕСКАЯ', 'BM_G1'],
  ['1.1. Технико-экономическая характеристика предметной области и предприятия. Анализ деятельности «как есть»', '1.1. Технико-экономическая характеристика', 'BM_11'],
  ['1.2. Характеристика комплекса задач, задачи и обоснование необходимости автоматизации', '1.2. Характеристика комплекса задач', 'BM_12'],
  ['1.3. Анализ существующих разработок и выбор стратегии автоматизации «как должно быть»', '1.3. Анализ существующих разработок', 'BM_13'],
  ['1.4. Обоснование проектных решений', '1.4. Обоснование проектных решений', 'BM_14'],
  ['ГЛАВА 2. ПРОЕКТНАЯ ЧАСТЬ', 'Глава 2. Проектная часть', 'BM_G2'],
  ['2.1. Разработка проекта автоматизации', '2.1. Разработка проекта автоматизации', 'BM_21'],
  ['2.2. Информационное обеспечение задачи', '2.2. Информационное обеспечение задачи', 'BM_22'],
  ['2.3. Программное обеспечение задачи', '2.3. Программное обеспечение задачи', 'BM_23'],
  ['2.4. Контрольный пример реализации проекта и его описание', '2.4. Контрольный пример реализации', 'BM_24'],
  ['ГЛАВА 3. ОБОСНОВАНИЕ ЭКОНОМИЧЕСКОЙ ЭФФЕКТИВНОСТИ ПРОЕКТА', 'ГЛАВА 3. ОБОСНОВАНИЕ ЭКОНОМИЧЕСКОЙ', 'BM_G3'],
  ['3.1. Выбор и обоснование методики расчёта экономической эффективности', '3.1. Выбор и обоснование методики расчёта', 'BM_31'],
  ['3.2. Расчёт показателей экономической эффективности проекта', '3.2. Расчёт показателей экономической', 'BM_32'],
  ['ЗАКЛЮЧЕНИЕ', 'ЗАКЛЮЧЕНИЕ', 'BM_ZAK'],
  ['СПИСОК ИСПОЛЬЗОВАННОЙ ЛИТЕРАТУРЫ', 'СПИСОК ИСПОЛЬЗОВАННОЙ ЛИТЕРАТУРЫ', 'BM_LIT'],
  ['ПРИЛОЖЕНИЯ', 'ПРИЛОЖЕНИЕ А', 'BM_APP'],
];
const pairs = tocDefs
  .map(([a, b, c]) => `@(${JSON.stringify(a)}, ${JSON.stringify(b)}, ${JSON.stringify(c)})`)
  .join(',\n  ');

const ps = `
$ErrorActionPreference = 'Stop'
Get-Process WINWORD -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

$vkr = ${JSON.stringify(vkr)}
$outAlt = ${JSON.stringify(outAlt)}
$items = @(
  ${pairs}
)

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
$doc = $word.Documents.Open($vkr)

function Find-First([string]$text) {
  $rng = $doc.Content.Duplicate
  $f = $rng.Find
  $f.Text = $text
  $f.Forward = $true
  $f.Wrap = 1
  if ($f.Execute()) { return $rng.Duplicate }
  return $null
}
function Find-From([long]$start, [string]$text) {
  $rng = $doc.Range($start, $doc.Content.End)
  $f = $rng.Find
  $f.Text = $text
  $f.Forward = $true
  $f.Wrap = 0
  if ($f.Execute()) { return $rng.Duplicate }
  return $null
}

$act = Find-First 'Актуальность темы обусловлена'
if ($null -eq $act) { throw 'Missing intro body' }
$tocH = Find-First 'СОДЕРЖАНИЕ'
# find last ВВЕДЕНИЕ before Актуальность
$introH = $null
$cand = Find-From $tocH.End 'ВВЕДЕНИЕ'
while ($null -ne $cand -and $cand.Start -lt $act.Start) {
  $introH = $cand.Duplicate
  $cand = Find-From $cand.End 'ВВЕДЕНИЕ'
}
if ($null -eq $introH) { throw 'Intro heading not found' }

# delete TOC entries only
$doc.Range($tocH.End, $introH.Start).Delete() | Out-Null

$tocH = Find-First 'СОДЕРЖАНИЕ'
$act = Find-First 'Актуальность темы обусловлена'
$introH = $null
$cand = Find-From $tocH.End 'ВВЕДЕНИЕ'
while ($null -ne $cand -and $cand.Start -lt $act.Start) {
  $introH = $cand.Duplicate
  $cand = Find-From $cand.End 'ВВЕДЕНИЕ'
}
$bodyStart = $introH.Start

foreach ($it in $items) {
  $bm = $it[2]
  if ($doc.Bookmarks.Exists($bm)) { $doc.Bookmarks.Item($bm).Delete() | Out-Null }
}

$placed = @{}
$minPos = $bodyStart
foreach ($it in $items) {
  $label = $it[0]; $key = $it[1]; $bm = $it[2]
  # special cases order constraints
  $startFrom = $minPos
  if ($bm -eq 'BM_ZAK') {
    if ($placed.ContainsKey('BM_G3')) { $startFrom = $placed['BM_G3'] }
  }
  if ($bm -eq 'BM_LIT') {
    if ($placed.ContainsKey('BM_ZAK')) { $startFrom = $placed['BM_ZAK'] }
  }
  if ($bm -eq 'BM_APP') {
    if ($placed.ContainsKey('BM_LIT')) { $startFrom = $placed['BM_LIT'] }
  }

  $hit = $null
  foreach ($para in @($doc.Paragraphs)) {
    if ($para.Range.Start -lt $startFrom) { continue }
    $t = $para.Range.Text
    if ($null -eq $t) { continue }
    $t = $t.Trim().TrimEnd([char]13, [char]7, [char]11)
    if ($t.Length -gt 160) { continue }
    if ($t.StartsWith($key) -or $t -eq $label) {
      $hit = $para.Range.Duplicate
      break
    }
  }
  if ($null -eq $hit) {
    Write-Output ('MISS ' + $bm + ' ' + $key)
    continue
  }
  $doc.Bookmarks.Add($bm, $hit) | Out-Null
  $placed[$bm] = [int64]$hit.Start
  $minPos = $hit.Start + 1
  Write-Output ('BM ' + $bm + ' pos=' + $hit.Start)
}

$delta = 0
if ($placed.ContainsKey('BM_G1') -and $placed.ContainsKey('BM_G2')) {
  $delta = $placed['BM_G2'] - $placed['BM_G1']
}
Write-Output ('DELTA_G1_G2 ' + $delta)
if ($delta -lt 2000) { throw 'TOC bookmark placement failed' }

$doc.Repaginate() | Out-Null
$totalPages = [Math]::Max(2, [int]$doc.ComputeStatistics(2))
$docEnd = [double]$doc.Content.End
Write-Output ('TOTAL_PAGES ' + $totalPages)

$pages = @{}
foreach ($it in $items) {
  $label = $it[0]; $bm = $it[2]
  if (-not $placed.ContainsKey($bm)) { $pages[$label] = ''; continue }
  $start = [double]$placed[$bm]
  $est = [int][Math]::Max(1, [Math]::Min($totalPages, [Math]::Round(1 + ($start / $docEnd) * ($totalPages - 1))))
  $pages[$label] = $est
  Write-Output ('PAGE ' + $est + ' ' + $label)
}

$tocH = Find-First 'СОДЕРЖАНИЕ'
$pos = $doc.Range($tocH.End, $tocH.End)
foreach ($it in $items) {
  $label = $it[0]
  $p = $pages[$label]
  $pos.InsertAfter($label + [char]9 + [string]$p + [char]13)
  $pos.Collapse(0) | Out-Null
}
$tocH = Find-First 'СОДЕРЖАНИЕ'
$act = Find-First 'Актуальность темы обусловлена'
$introH = $null
$cand = Find-From $tocH.End 'ВВЕДЕНИЕ'
while ($null -ne $cand -and $cand.Start -lt $act.Start) {
  $introH = $cand.Duplicate
  $cand = Find-From $cand.End 'ВВЕДЕНИЕ'
}
$tocBody = $doc.Range($tocH.End, $introH.Start)
$tocBody.Font.Name = 'Times New Roman'
$tocBody.Font.Size = 14
foreach ($para in @($tocBody.Paragraphs)) {
  try {
    $para.Format.TabStops.ClearAll() | Out-Null
    $para.Format.TabStops.Add(460, 2, 1) | Out-Null
  } catch {}
}

Write-Output ('CONCLUSION_PAGE ' + $pages['ЗАКЛЮЧЕНИЕ'])

$wdFormat = 12
try {
  $doc.SaveAs2([ref]$vkr, [ref]$wdFormat) | Out-Null
  Write-Output ('Saved ' + $vkr)
} catch {
  $doc.SaveAs2([ref]$outAlt, [ref]$wdFormat) | Out-Null
  Write-Output ('Locked, saved ' + $outAlt)
}
$doc.Close($false) | Out-Null
$word.Quit() | Out-Null
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
`;

fs.writeFileSync(path.join(diploma, '_extract/fix_toc_vkr2.ps1'), '\uFEFF' + ps, 'utf8');
const r = spawnSync(
  'powershell',
  ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', path.join(diploma, '_extract/fix_toc_vkr2.ps1')],
  { encoding: 'utf8', timeout: 600000 }
);
console.log(r.stdout || '');
if (r.stderr) console.error(r.stderr);
if (r.status !== 0) process.exit(r.status || 1);
