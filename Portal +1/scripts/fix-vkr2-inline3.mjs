import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const diploma = path.join(__dirname, '../..');
const vkr = path.join(diploma, 'VKR_Ledovskih_2.docx');
const outAlt = path.join(diploma, 'VKR_Ledovskih_2_isp.docx');
const expansionsPath = path.join(diploma, '_extract/vkr2_expansions_inline.json');

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
const tocPairs = tocDefs
  .map(([a, b, c]) => `@(${JSON.stringify(a)}, ${JSON.stringify(b)}, ${JSON.stringify(c)})`)
  .join(',\n  ');

const ps = `
$ErrorActionPreference = 'Stop'
Get-Process WINWORD -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

$vkr = ${JSON.stringify(vkr)}
$outAlt = ${JSON.stringify(outAlt)}
$expansionsPath = ${JSON.stringify(expansionsPath)}
$expansions = Get-Content -LiteralPath $expansionsPath -Encoding UTF8 | ConvertFrom-Json
$items = @(
  ${tocPairs}
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
  $f.MatchCase = $true
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
  $f.MatchCase = $true
  if ($f.Execute()) { return $rng.Duplicate }
  return $null
}

$tocH0 = Find-First 'СОДЕРЖАНИЕ'
$assignGuardEnd = $tocH0.Start
Write-Output ('Protect assignment before ' + $assignGuardEnd)

foreach ($section in @($doc.Sections)) {
  $footer = $section.Footers.Item(1)
  $footer.LinkToPrevious = $false
  if ($footer.PageNumbers.Count -eq 0) {
    $footer.Range.ParagraphFormat.Alignment = 1
    $footer.Range.Font.Name = 'Times New Roman'
    $footer.Range.Font.Size = 12
    try { $null = $footer.PageNumbers.Add(1, $true) } catch { $null = $footer.Range.Fields.Add($footer.Range, 33) }
  }
}
Write-Output 'Page numbers OK'

$inserted = 0
foreach ($exp in $expansions) {
  $mark = [string]$exp.mark
  if ($null -ne (Find-First $mark)) { Write-Output ('SKIP ' + $mark); continue }

  $needle = [string]$exp.afterCaption
  $cap = Find-First $needle
  if ($null -eq $cap -and $needle.Length -gt 34) { $cap = Find-First $needle.Substring(0, 34) }
  if ($null -eq $cap) { Write-Output ('MISS ' + $needle); continue }
  if ($cap.Start -lt $assignGuardEnd) { Write-Output ('ZONE ' + $mark); continue }

  # Prefer last body paragraph BEFORE any image paragraph that precedes the caption
  $best = $null
  $imageBeforeCap = $null
  foreach ($para in @($doc.Paragraphs)) {
    if ($para.Range.Start -lt $assignGuardEnd) { continue }
    if ($para.Range.End -ge $cap.Start) { break }
    if ($para.Range.InlineShapes.Count -gt 0) { $imageBeforeCap = $para; continue }
    $t = $para.Range.Text
    if ($null -eq $t) { continue }
    $plain = $t.Trim().TrimEnd([char]13, [char]7, [char]11)
    if ($plain.Length -lt 60) { continue }
    if ($plain.StartsWith('Рис.')) { continue }
    if ($plain.StartsWith('Таблица')) { continue }
    if ($plain.StartsWith('EXP_')) { continue }
    if ($plain.Contains('(рис.')) { continue }
    $best = $para
  }
  if ($null -eq $best) { Write-Output ('NOBODY ' + $mark); continue }

  # Insert AFTER body paragraph mark using InsertAfter at End (new paras go before following image/caption)
  $anchorEnd = [long]$best.Range.End
  $block = ($exp.paragraphs -join ([string][char]13)) + [char]13 + $mark
  $ins = $doc.Range($anchorEnd, $anchorEnd)
  $ins.InsertAfter($block + [char]13) | Out-Null

  # Format the newly inserted paragraphs (between old end and caption)
  $cap2 = Find-First $needle
  if ($null -eq $cap2 -and $needle.Length -gt 34) { $cap2 = Find-First $needle.Substring(0, 34) }
  $fmtStart = $anchorEnd
  $fmtEnd = if ($null -ne $cap2) { $cap2.Start } else { $anchorEnd + $block.Length + 10 }
  $fmt = $doc.Range($fmtStart, $fmtEnd)
  foreach ($para in @($fmt.Paragraphs)) {
    $pt = $para.Range.Text
    if ($null -eq $pt) { continue }
    $plain = $pt.Trim().TrimEnd([char]13, [char]7, [char]11)
    if ($plain.StartsWith('EXP_')) {
      $para.Range.Font.Size = 1
      $para.Range.Font.Color = 16777215
      try { $para.Range.Font.Hidden = $true } catch {}
      $para.Range.ParagraphFormat.SpaceAfter = 0
      $para.Range.ParagraphFormat.FirstLineIndent = 0
      continue
    }
    if ($plain.Length -lt 40) { continue }
    $para.Range.Font.Name = 'Times New Roman'
    $para.Range.Font.Size = 14
    $para.Range.Font.Bold = $false
    $para.Range.ParagraphFormat.Alignment = 3
    try {
      $para.Range.ParagraphFormat.LineSpacingRule = 5
      $para.Range.ParagraphFormat.LineSpacing = 18
    } catch {}
    $para.Range.ParagraphFormat.FirstLineIndent = 35.4
    $para.Range.ParagraphFormat.SpaceAfter = 8
    $inserted++
  }

  $probe = Find-First $mark
  $cap3 = Find-First $needle
  if ($null -eq $cap3 -and $needle.Length -gt 34) { $cap3 = Find-First $needle.Substring(0, 34) }
  $ok = ($null -ne $probe -and $null -ne $cap3 -and $probe.Start -lt $cap3.Start)
  Write-Output ('OK ' + $mark + ' beforeCap=' + $ok + ' img=' + ($null -ne $imageBeforeCap))
}
Write-Output ('InsertedParas=' + $inserted)
if ($inserted -lt 8) { throw 'Too few insertions' }

# Rebuild TOC
$act = Find-First 'Актуальность темы обусловлена'
$tocH = Find-First 'СОДЕРЖАНИЕ'
$introH = $null
$cand = Find-From $tocH.End 'ВВЕДЕНИЕ'
while ($null -ne $cand -and $cand.Start -lt $act.Start) {
  $introH = $cand.Duplicate
  $cand = Find-From $cand.End 'ВВЕДЕНИЕ'
}
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
  $startFrom = $minPos
  if ($bm -eq 'BM_ZAK' -and $placed.ContainsKey('BM_G3')) { $startFrom = $placed['BM_G3'] }
  if ($bm -eq 'BM_LIT' -and $placed.ContainsKey('BM_ZAK')) { $startFrom = $placed['BM_ZAK'] }
  if ($bm -eq 'BM_APP' -and $placed.ContainsKey('BM_LIT')) { $startFrom = $placed['BM_LIT'] }
  $hit = $null
  foreach ($para in @($doc.Paragraphs)) {
    if ($para.Range.Start -lt $startFrom) { continue }
    $t = $para.Range.Text
    if ($null -eq $t) { continue }
    $t = $t.Trim().TrimEnd([char]13, [char]7, [char]11)
    if ($t.Length -gt 160) { continue }
    if ($t.StartsWith($key) -or $t -eq $label) { $hit = $para.Range.Duplicate; break }
  }
  if ($null -eq $hit) { Write-Output ('TOCMISS ' + $bm); continue }
  $doc.Bookmarks.Add($bm, $hit) | Out-Null
  $placed[$bm] = [int64]$hit.Start
  $minPos = $hit.Start + 1
}

$delta = $placed['BM_G2'] - $placed['BM_G1']
Write-Output ('DELTA_G1_G2 ' + $delta)
if ($delta -lt 2000) { throw 'Bad bookmarks' }

$doc.Repaginate() | Out-Null
$totalPages = [Math]::Max(2, [int]$doc.ComputeStatistics(2))
$docEnd = [double]$doc.Content.End
Write-Output ('TOTAL_PAGES ' + $totalPages)

$pages = @{}
foreach ($it in $items) {
  $label = $it[0]; $bm = $it[2]
  if (-not $placed.ContainsKey($bm)) { $pages[$label] = ''; continue }
  $pages[$label] = [int][Math]::Max(1, [Math]::Min($totalPages, [Math]::Round(1 + ([double]$placed[$bm] / $docEnd) * ($totalPages - 1))))
  Write-Output ('PAGE ' + $pages[$label] + ' ' + $label)
}

$tocH = Find-First 'СОДЕРЖАНИЕ'
$pos = $doc.Range($tocH.End, $tocH.End)
foreach ($it in $items) {
  $label = $it[0]
  $pos.InsertAfter($label + [char]9 + [string]$pages[$label] + [char]13)
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
    $para.Format.FirstLineIndent = 0
    $para.Format.LeftIndent = 0
    $para.Format.Alignment = 0
    $para.Format.SpaceAfter = 0
    $para.Format.SpaceBefore = 0
    $para.Format.LineSpacingRule = 0
  } catch {}
}

Write-Output ('CONCLUSION_PAGE ' + $pages['ЗАКЛЮЧЕНИЕ'])
if ($null -eq (Find-First 'Актуальность темы обусловлена')) { throw 'Body lost' }
$assignHas = ($doc.Range(0, (Find-First 'СОДЕРЖАНИЕ').Start).Text -match 'EXP_')
Write-Output ('ASSIGN_HAS_EXP ' + $assignHas)
if ($assignHas) { throw 'Assignment was modified' }

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

fs.writeFileSync(path.join(diploma, '_extract/fix_vkr2_inline3.ps1'), '\uFEFF' + ps, 'utf8');
const r = spawnSync(
  'powershell',
  ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', path.join(diploma, '_extract/fix_vkr2_inline3.ps1')],
  { encoding: 'utf8', timeout: 600000 }
);
console.log(r.stdout || '');
if (r.stderr) console.error(r.stderr);
if (r.status !== 0) process.exit(r.status || 1);
