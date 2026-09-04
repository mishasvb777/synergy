import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const diploma = path.join(__dirname, '../..');
const template = path.join(diploma, '3_1_titulnyj_list_vkr_bak_shablon.docx');
const filled = path.join(diploma, 'VKR_Titul_filled.docx');

const theme =
  'Разработка многопользовательского веб-приложения на примере ГК «Иннотех»';
const student = 'Ледовских Михаил Алексеевич';
const supervisor = 'Новиков С.В.';

// Keep PS1 ASCII-only except here-strings for Russian values
const ps = `
$ErrorActionPreference = 'Stop'
Get-Process WINWORD -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

$template = ${JSON.stringify(template)}
$filled = ${JSON.stringify(filled)}
$theme = ${JSON.stringify(theme)}
$student = ${JSON.stringify(student)}
$supervisor = ${JSON.stringify(supervisor)}

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
$doc = $word.Documents.Open($template)

function Set-CellText($table, $row, $col, $text) {
  $cell = $table.Cell($row, $col)
  $rng = $cell.Range
  $rng.MoveEnd(1, -1) | Out-Null
  $rng.Text = $text
}

$find = $doc.Content.Find
$find.ClearFormatting() | Out-Null
$find.Replacement.ClearFormatting() | Out-Null
$null = $find.Execute("20__", $false, $false, $false, $false, $false, $true, 1, $false, "2026", 2)

Set-CellText $doc.Tables.Item(2) 1 2 $theme
Set-CellText $doc.Tables.Item(3) 1 2 $student
Set-CellText $doc.Tables.Item(3) 3 2 $supervisor

if (Test-Path -LiteralPath $filled) { Remove-Item -LiteralPath $filled -Force }
$wdFormatXMLDocument = 12
$doc.SaveAs2([ref]$filled, [ref]$wdFormatXMLDocument) | Out-Null
$doc.Close() | Out-Null
$word.Quit() | Out-Null
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
Write-Output ("Saved " + $filled)
`;

const scriptPath = path.join(diploma, '_extract/fill_titul.ps1');
fs.writeFileSync(scriptPath, '\uFEFF' + ps, 'utf8');
const r = spawnSync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', scriptPath], {
  encoding: 'utf8',
  timeout: 120000,
});
console.log(r.stdout || '');
if (r.stderr) console.error(r.stderr);
if (r.status !== 0) process.exit(r.status || 1);
console.log('OK', filled, `${Math.round(fs.statSync(filled).size / 1024)} KB`);
