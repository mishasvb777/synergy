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

# Hide EXP_ markers
$marks = @('EXP_LC_14','EXP_ER_15','EXP_FT_16','EXP_DL_17','EXP_UC_17A','EXP_MOD_18','EXP_ALG_19','EXP_ECON_42','EXP_SCR_22','EXP_SCR_26','EXP_SCR_33','EXP_SCR_39','EXP_SCR_40')
foreach ($m in $marks) {
  $hit = Find-First $m
  if ($null -ne $hit) {
    try { $hit.Font.Hidden = $true } catch {}
    try { $hit.Font.Size = 1; $hit.Font.Color = 16777215 } catch {}
  }
}
Write-Output 'Markers hidden'

# Ensure page numbers exist
foreach ($section in @($doc.Sections)) {
  $footer = $section.Footers.Item(1)
  if ($footer.PageNumbers.Count -eq 0) {
    $footer.Range.ParagraphFormat.Alignment = 1
    $footer.Range.Font.Name = 'Times New Roman'
    $footer.Range.Font.Size = 12
    try { $null = $footer.PageNumbers.Add(1, $true) } catch { $footer.Range.Fields.Add($footer.Range, 33) | Out-Null }
  }
}

# Rebuild TOC pages using bookmark positions in body
$act = Find-First 'Актуальность темы обусловлена'
if ($null -eq $act) { throw 'body missing' }
$tocH = Find-First 'СОДЕРЖАНИЕ'
$introH = Find-From $tocH.End 'ВВЕДЕНИЕ'
$bodyStart = $introH.Start
$doc.Range($tocH.End, $introH.Start).Delete() | Out-Null

$tocH = Find-First 'СОДЕРЖАНИЕ'
$introH = Find-From $tocH.End 'ВВЕДЕНИЕ'
$bodyStart = $introH.Start

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
  if ($t.Length -gt 180) { continue }
  foreach ($it in $items) {
    $label = $it[0]; $key = $it[1]; $bm = $it[2]
    if ($placed.ContainsKey($bm)) { continue }
    if ($t.StartsWith($key) -or $t.StartsWith($label)) {
      $doc.Bookmarks.Add($bm, $para.Range) | Out-Null
      $placed[$bm] = [int64]$para.Range.Start
      break
    }
  }
}

if (-not $placed.ContainsKey('BM_G2') -or ($placed['BM_G2'] - $placed['BM_G1'] -lt 500)) {
  Write-Output 'WARN bookmarks close; keep previous TOC pages logic carefully'
}

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

$zakPos = $placed['BM_ZAK']
if ($zakPos) {
  $estZ = [int][Math]::Round(1 + ([double]$zakPos / $docEnd) * ($totalPages - 1))
  Write-Output ('CONCLUSION_PAGE_EST ' + $estZ)
}

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

const scriptPath = path.join(diploma, '_extract/finalize_vkr2.ps1');
fs.writeFileSync(scriptPath, '\uFEFF' + ps, 'utf8');
const r = spawnSync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', scriptPath], {
  encoding: 'utf8',
  timeout: 600000,
});
console.log(r.stdout || '');
if (r.stderr) console.error(r.stderr);
if (r.status !== 0) process.exit(r.status || 1);
