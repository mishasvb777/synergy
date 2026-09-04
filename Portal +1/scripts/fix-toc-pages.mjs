import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const diploma = path.join(__dirname, '../..');
const vkr = path.join(diploma, 'VKR_Ledovskih.docx');
const outAlt = path.join(diploma, 'VKR_Ledovskih_isp.docx');

const tocItems = [
  ['ВВЕДЕНИЕ', 'BM_INTRO'],
  ['ГЛАВА 1. АНАЛИТИЧЕСКАЯ ЧАСТЬ', 'BM_G1'],
  ['1.1. Технико-экономическая характеристика предметной области и предприятия. Анализ деятельности «как есть»', 'BM_11'],
  ['1.2. Характеристика комплекса задач, задачи и обоснование необходимости автоматизации', 'BM_12'],
  ['1.3. Анализ существующих разработок и выбор стратегии автоматизации «как должно быть»', 'BM_13'],
  ['1.4. Обоснование проектных решений', 'BM_14'],
  ['ГЛАВА 2. ПРОЕКТНАЯ ЧАСТЬ', 'BM_G2'],
  ['2.1. Разработка проекта автоматизации', 'BM_21'],
  ['2.2. Информационное обеспечение задачи', 'BM_22'],
  ['2.3. Программное обеспечение задачи', 'BM_23'],
  ['2.4. Контрольный пример реализации проекта и его описание', 'BM_24'],
  ['ГЛАВА 3. ОБОСНОВАНИЕ ЭКОНОМИЧЕСКОЙ ЭФФЕКТИВНОСТИ ПРОЕКТА', 'BM_G3'],
  ['3.1. Выбор и обоснование методики расчёта экономической эффективности', 'BM_31'],
  ['3.2. Расчёт показателей экономической эффективности проекта', 'BM_32'],
  ['ЗАКЛЮЧЕНИЕ', 'BM_ZAK'],
  ['СПИСОК ИСПОЛЬЗОВАННОЙ ЛИТЕРАТУРЫ', 'BM_LIT'],
  ['ПРИЛОЖЕНИЯ', 'BM_APP'],
];

const pairs = tocItems.map(([l, b]) => `@(${JSON.stringify(l)}, ${JSON.stringify(b)})`).join(', ');

const ps = `
$ErrorActionPreference = 'Stop'
Get-Process WINWORD -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

$vkr = ${JSON.stringify(vkr)}
$outAlt = ${JSON.stringify(outAlt)}
$items = @(${pairs})

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
$doc = $word.Documents.Open($vkr)
$word.ActiveWindow.View.Type = 3
$doc.Repaginate() | Out-Null
$totalPages = [Math]::Max(1, [int]$doc.ComputeStatistics(2))
$docEnd = [double]$doc.Content.End
Write-Output ('TOTAL ' + $totalPages + ' END ' + $docEnd)

function Find-First([string]$text) {
  $rng = $doc.Content.Duplicate
  $f = $rng.Find
  $f.Text = $text
  $f.Forward = $true
  $f.Wrap = 1
  if ($f.Execute()) { return $rng.Duplicate }
  return $null
}

# Read bookmark character positions and estimate pages
$pages = @{}
foreach ($it in $items) {
  $label = $it[0]; $bm = $it[1]
  if (-not $doc.Bookmarks.Exists($bm)) {
    Write-Output ('NOBM ' + $bm)
    $pages[$label] = ''
    continue
  }
  $start = [double]$doc.Bookmarks.Item($bm).Range.Start
  $infoPage = [int]$doc.Bookmarks.Item($bm).Range.Information(3)
  $est = [int][Math]::Max(1, [Math]::Min($totalPages, [Math]::Round(1 + ($start / $docEnd) * ($totalPages - 1))))
  # Prefer estimate when Word collapses everything to early pages
  $use = $est
  if ($infoPage -gt 1 -and $infoPage -lt $totalPages -and [Math]::Abs($infoPage - $est) -lt 8) {
    $use = $infoPage
  }
  $pages[$label] = $use
  Write-Output ('POS ' + $start + ' info=' + $infoPage + ' est=' + $est + ' use=' + $use + ' ' + $label)
}

# Rebuild TOC as plain text with estimated pages (stable for print)
$tocH = Find-First 'СОДЕРЖАНИЕ'
$rng = $doc.Range($tocH.End, $doc.Content.End)
$f = $rng.Find
$f.Text = 'ВВЕДЕНИЕ'
$f.Forward = $true
$f.Wrap = 0
$null = $f.Execute()
$doc.Range($tocH.End, $rng.Start).Delete() | Out-Null

$tocH = Find-First 'СОДЕРЖАНИЕ'
$pos = $doc.Range($tocH.End, $tocH.End)
foreach ($it in $items) {
  $label = $it[0]
  $p = $pages[$label]
  $pos.InsertAfter($label + [char]9 + [string]$p + [char]13)
  $pos.Collapse(0) | Out-Null
}

$tocH = Find-First 'СОДЕРЖАНИЕ'
$rng = $doc.Range($tocH.End, $doc.Content.End)
$f = $rng.Find
$f.Text = 'ВВЕДЕНИЕ'
$f.Forward = $true
$f.Wrap = 0
$null = $f.Execute()
$tocBody = $doc.Range($tocH.End, $rng.Start)
$tocBody.Font.Name = 'Times New Roman'
$tocBody.Font.Size = 14
foreach ($para in @($tocBody.Paragraphs)) {
  try {
    $para.Format.TabStops.ClearAll() | Out-Null
    $para.Format.TabStops.Add(460, 2, 1) | Out-Null
  } catch {}
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

const scriptPath = path.join(diploma, '_extract/fix_toc_est.ps1');
fs.writeFileSync(scriptPath, '\uFEFF' + ps, 'utf8');
const r = spawnSync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', scriptPath], {
  encoding: 'utf8',
  timeout: 300000,
});
console.log(r.stdout || '');
if (r.stderr) console.error(r.stderr);
if (r.status !== 0) process.exit(r.status || 1);
