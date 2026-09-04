import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const diploma = path.join(__dirname, '../..');
const vkr = path.join(diploma, 'VKR_Ledovskih.docx');
const zadanie = path.join(diploma, 'Zadanie na VKR Ledovskih.docx');
const chart = path.join(diploma, 'portal-plus1/diagrams/econ_chart.png');
const outAlt = path.join(diploma, 'VKR_Ledovskih_isp.docx');

const tocDefs = [
  ['ВВЕДЕНИЕ', 'ВВЕДЕНИЕ', 'BM_INTRO'],
  ['ГЛАВА 1. АНАЛИТИЧЕСКАЯ ЧАСТЬ', 'ГЛАВА 1.', 'BM_G1'],
  ['1.1. Технико-экономическая характеристика предметной области и предприятия. Анализ деятельности «как есть»', '1.1. Технико-экономическая', 'BM_11'],
  ['1.2. Характеристика комплекса задач, задачи и обоснование необходимости автоматизации', '1.2. Характеристика комплекса', 'BM_12'],
  ['1.3. Анализ существующих разработок и выбор стратегии автоматизации «как должно быть»', '1.3. Анализ существующих', 'BM_13'],
  ['1.4. Обоснование проектных решений', '1.4. Обоснование проектных', 'BM_14'],
  ['ГЛАВА 2. ПРОЕКТНАЯ ЧАСТЬ', 'Глава 2. Проектная', 'BM_G2'],
  ['2.1. Разработка проекта автоматизации', '2.1. Разработка проекта', 'BM_21'],
  ['2.2. Информационное обеспечение задачи', '2.2. Информационное обеспечение', 'BM_22'],
  ['2.3. Программное обеспечение задачи', '2.3. Программное обеспечение', 'BM_23'],
  ['2.4. Контрольный пример реализации проекта и его описание', '2.4. Контрольный пример', 'BM_24'],
  ['ГЛАВА 3. ОБОСНОВАНИЕ ЭКОНОМИЧЕСКОЙ ЭФФЕКТИВНОСТИ ПРОЕКТА', 'ГЛАВА 3. ОБОСНОВАНИЕ', 'BM_G3'],
  ['3.1. Выбор и обоснование методики расчёта экономической эффективности', '3.1. Выбор и обоснование методики', 'BM_31'],
  ['3.2. Расчёт показателей экономической эффективности проекта', '3.2. Расчёт показателей', 'BM_32'],
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
$zadanie = ${JSON.stringify(zadanie)}
$chart = ${JSON.stringify(chart)}
$outAlt = ${JSON.stringify(outAlt)}
$items = @(
  ${pairs}
)

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
$doc = $word.Documents.Open($vkr)
$word.ActiveWindow.View.Type = 3

function Find-First([string]$text) {
  $rng = $doc.Content.Duplicate
  $f = $rng.Find
  $f.ClearFormatting() | Out-Null
  $f.Text = $text
  $f.Forward = $true
  $f.Wrap = 1
  $f.MatchWildcards = $false
  if ($f.Execute()) { return $rng.Duplicate }
  return $null
}

function Find-From([long]$start, [string]$text) {
  $rng = $doc.Range($start, $doc.Content.End)
  $f = $rng.Find
  $f.ClearFormatting() | Out-Null
  $f.Text = $text
  $f.Forward = $true
  $f.Wrap = 0
  if ($f.Execute()) { return $rng.Duplicate }
  return $null
}

# ---- 1. Full assignment ----
$assignH = Find-First 'ЗАДАНИЕ НА ВЫПУСКНУЮ КВАЛИФИКАЦИОННУЮ РАБОТУ'
$tocH = Find-First 'СОДЕРЖАНИЕ'
if ($null -eq $assignH -or $null -eq $tocH) { throw 'assign/toc heading missing' }

$already = Find-From $assignH.Start 'Основные вопросы, подлежащие разработке'
if ($null -eq $already) {
  $doc.Range($assignH.Start, $tocH.Start).Delete() | Out-Null
  $tocH = Find-First 'СОДЕРЖАНИЕ'
  $ins = $doc.Range($tocH.Start, $tocH.Start)
  $ins.InsertFile($zadanie) | Out-Null
  $tocH = Find-First 'СОДЕРЖАНИЕ'
  $br = $doc.Range($tocH.Start, $tocH.Start)
  $br.InsertBreak(7) | Out-Null
  Write-Output 'Assignment OK'
} else {
  Write-Output 'Assignment already present'
}

# ---- 2. Economic chart before conclusion ----
$anchorText = 'Актуальность темы обусловлена'
# ensure body exists
if ($null -eq (Find-First $anchorText)) { throw 'Body missing - abort' }

$zak = $null
# Find ЗАКЛЮЧЕНИЕ that appears AFTER chapter 3 content marker
$ch3 = Find-First 'ГЛАВА 3. ОБОСНОВАНИЕ ЭКОНОМИЧЕСКОЙ ЭФФЕКТИВНОСТИ'
if ($null -eq $ch3) { $ch3 = Find-First '3.2. Расчёт показателей экономической эффективности' }
if ($null -eq $ch3) { throw 'Chapter 3 not found' }
$zak = Find-From $ch3.End 'ЗАКЛЮЧЕНИЕ'
if ($null -eq $zak) { throw 'Conclusion not found after ch3' }

if ($null -eq (Find-From $ch3.Start 'Рис. 42.')) {
  $zak.Collapse(1) | Out-Null
  $p1 = $doc.Paragraphs.Add($zak)
  $p1.Range.Text = 'На основании выполненных расчётов построены диаграммы сравнения базового и предлагаемого вариантов, которые могут быть использованы в презентации к защите.' + [char]13
  $p1.Range.Font.Name = 'Times New Roman'
  $p1.Range.Font.Size = 14
  $p1.Range.Font.Bold = $false
  $p1.Range.ParagraphFormat.Alignment = 3
  $p1.Range.ParagraphFormat.FirstLineIndent = 35.4

  $zak = Find-From $ch3.End 'ЗАКЛЮЧЕНИЕ'
  $zak.Collapse(1) | Out-Null
  $p2 = $doc.Paragraphs.Add($zak)
  $p2.Range.ParagraphFormat.Alignment = 1
  $p2.Range.ParagraphFormat.FirstLineIndent = 0
  $pic = $p2.Range.InlineShapes.AddPicture($chart)
  $pic.Width = 450

  $zak = Find-From $ch3.End 'ЗАКЛЮЧЕНИЕ'
  $zak.Collapse(1) | Out-Null
  $p3 = $doc.Paragraphs.Add($zak)
  $p3.Range.Text = 'Рис. 42. Диаграммы показателей экономической эффективности проекта «Портал+1»' + [char]13
  $p3.Range.Font.Name = 'Times New Roman'
  $p3.Range.Font.Size = 14
  $p3.Range.Font.Bold = $true
  $p3.Range.ParagraphFormat.Alignment = 1
  $p3.Range.ParagraphFormat.FirstLineIndent = 0
  Write-Output 'Chart OK'
} else {
  Write-Output 'Chart already present'
}

# ---- 3. TOC with pages ----
# Body starts at real introduction content
$act = Find-First 'Актуальность темы обусловлена'
if ($null -eq $act) { throw 'Intro content missing' }
# heading ВВЕДЕНИЕ just before it
$introH = $null
$searchFrom = (Find-First 'СОДЕРЖАНИЕ').End
$rng = $doc.Range($searchFrom, $act.Start)
# walk paragraphs backward from act to find ВВЕДЕНИЕ
$cand = Find-From $searchFrom 'ВВЕДЕНИЕ'
while ($null -ne $cand -and $cand.Start -lt $act.Start) {
  $introH = $cand.Duplicate
  $cand = Find-From ($cand.End) 'ВВЕДЕНИЕ'
}
if ($null -eq $introH) { throw 'Intro heading missing' }
$bodyStart = $introH.Start

$tocH = Find-First 'СОДЕРЖАНИЕ'
$doc.Range($tocH.End, $introH.Start).Delete() | Out-Null

# refresh bodyStart after delete
$act = Find-First 'Актуальность темы обусловлена'
$tocH = Find-First 'СОДЕРЖАНИЕ'
$introH = Find-From $tocH.End 'ВВЕДЕНИЕ'
$bodyStart = $introH.Start

# clear bookmarks
foreach ($it in $items) {
  $bm = $it[2]
  if ($doc.Bookmarks.Exists($bm)) { $doc.Bookmarks.Item($bm).Delete() | Out-Null }
}

$placed = @{}
foreach ($para in @($doc.Paragraphs)) {
  if ($para.Range.Start -lt $bodyStart) { continue }
  $t = $para.Range.Text
  if ($null -eq $t) { continue }
  $t = $t.Trim().TrimEnd([char]13, [char]7, [char]11)
  if ($t.Length -gt 180) { continue } # skip body paragraphs
  foreach ($it in $items) {
    $label = $it[0]; $key = $it[1]; $bm = $it[2]
    if ($placed.ContainsKey($bm)) { continue }
    if ($t.StartsWith($key) -or $t -eq $label -or $t.StartsWith($label)) {
      $doc.Bookmarks.Add($bm, $para.Range) | Out-Null
      $placed[$bm] = [int64]$para.Range.Start
      Write-Output ('BM ' + $bm + ' pos=' + $para.Range.Start + ' ' + $t.Substring(0, [Math]::Min(55, $t.Length)))
      break
    }
  }
}

# sanity: chapter2 bookmark must be far from chapter1
if (-not $placed.ContainsKey('BM_G1') -or -not $placed.ContainsKey('BM_G2')) { throw 'Missing chapter bookmarks' }
$delta = $placed['BM_G2'] - $placed['BM_G1']
Write-Output ('DELTA_G1_G2 ' + $delta)
if ($delta -lt 500) { throw 'Bookmarks look wrong (headings too close) - abort TOC' }

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
$introH = Find-From $tocH.End 'ВВЕДЕНИЕ'
$tocBody = $doc.Range($tocH.End, $introH.Start)
$tocBody.Font.Name = 'Times New Roman'
$tocBody.Font.Size = 14
foreach ($para in @($tocBody.Paragraphs)) {
  try {
    $para.Format.TabStops.ClearAll() | Out-Null
    $para.Format.TabStops.Add(460, 2, 1) | Out-Null
  } catch {}
}
Write-Output 'TOC OK'

# final body check
if ($null -eq (Find-First 'Актуальность темы обусловлена')) { throw 'Body lost before save' }
if ($null -eq (Find-First 'Рис. 22.')) { throw 'Screenshots section lost before save' }

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

const scriptPath = path.join(diploma, '_extract/fix_vkr_safe.ps1');
fs.writeFileSync(scriptPath, '\uFEFF' + ps, 'utf8');
const r = spawnSync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', scriptPath], {
  encoding: 'utf8',
  timeout: 600000,
});
console.log(r.stdout || '');
if (r.stderr) console.error(r.stderr);
if (r.status !== 0) process.exit(r.status || 1);
