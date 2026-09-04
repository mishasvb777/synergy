/**
 * Fix VKR_Ledovskih_2:
 * - do NOT touch assignment
 * - page numbers
 * - figure explanations in BODY text (before figures), not under captions
 * - rebuild TOC carefully
 */
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const diploma = path.join(__dirname, '../..');
const vkr = path.join(diploma, 'VKR_Ledovskih_2.docx');
const outAlt = path.join(diploma, 'VKR_Ledovskih_2_isp.docx');
const expansionsPath = path.join(diploma, '_extract/vkr2_expansions_inline.json');

const expansions = [
  {
    afterCaption: 'Рис. 14. Этапы жизненного цикла проекта «Портал+1»',
    mark: 'EXP_LC_14',
    paragraphs: [
      'Схема жизненного цикла проекта «Портал+1» (рис. 14) отражает учебную интерпретацию этапов создания веб-приложения. На этапе анализа фиксируются роли пользователей, границы MVP и нефункциональные ограничения по безопасности и производительности ленты. На этапе проектирования согласуются информационная модель, сценарии диалога и состав программных модулей. Реализация включает разработку клиентской SPA и серверного API, настройку схемы данных и механизмов аутентификации. Тестирование проверяет ролевой доступ, сценарии публикации и реакций, а также контрольный пример. Опытная эксплуатация на стенде позволяет уточнить требования ко второй очереди, а сопровождение — вести бэклог улучшений и готовить перенос на промышленный контур PostgreSQL/Redis.',
      'Выбор итерационной модели с выпуском MVP обусловлен необходимостью быстро получить демонстрируемый результат для защиты ВКР и сохранить возможность наращивания функций без смены архитектуры. Контрольные точки между этапами (утверждение FR/NFR, проверка ER-модели, сквозной сценарий «вход — лента — реакция — модерация — админка») делают схему практическим каркасом организации работ.',
    ],
  },
  {
    afterCaption: 'Рис. 15. Информационная (ER) модель «Портал+1»',
    mark: 'EXP_ER_15',
    paragraphs: [
      'Информационная модель (рис. 15) задаёт сущности портала и связи между ними. Справочник ролей определяет иерархию полномочий и используется при фильтрации меню и проверке прав API. Учётные записи хранят логин, email, признак подтверждения почты и ссылку на роль. Новости образуют центр информационного контура: с ними связаны комментарии и реакции, а признак публикации отделяет черновики от ленты.',
      'Комментарии и реакции обеспечивают обратную связь и сохраняют контекст обсуждения за счёт связи одновременно с новостью и автором. Посты активности с изображениями расширяют социальный контур и требуют отдельного хранения вложений. Пункты меню кодируют навигацию к операционным сервисам с учётом минимальной роли. Журнал email_outbox на стенде фиксирует письма подтверждения регистрации. Нормализованные связи «один ко многим» поддерживают целостность данных и упрощают последующее расширение модели.',
    ],
  },
  {
    afterCaption: 'Рис. 16. Дерево функций «Портал+1»',
    mark: 'EXP_FT_16',
    paragraphs: [
      'Дерево функций (рис. 16) декомпозирует MVP по контурам. Аутентификация объединяет вход, регистрацию, подтверждение email и выход. Информирование включает ленту и карточку новости, комментарии, реакции и поиск. Социальный контур охватывает активность, посты, сообщества и события. Справочники и обучение (база знаний, оргструктура, академия, бенефиты) поддерживают самообслуживание. Операционные сервисы связывают портал с HR-, ИТ-заявками, поддержкой и рабочим пространством. Модерация и администрирование замыкают управление контентом и ролями. Такая декомпозиция удобна для планирования разработки и демонстрации полноты MVP.',
    ],
  },
  {
    afterCaption: 'Рис. 17. Сценарий диалога пользователя',
    mark: 'EXP_DL_17',
    paragraphs: [
      'Сценарий диалога (рис. 17) описывает переходы между экранами. Старт — форма входа; при отсутствии учётки выполняются регистрация и подтверждение email. Успешный вход открывает ленту новостей как главный экран, откуда доступны остальные разделы. Ошибка входа не создаёт сессию. Из ленты пользователь переходит к карточке новости, событиям, активности, справочникам и операциям; вложенные экраны сохраняют возврат к родителю. Модератор и администратор получают дополнительные экраны управления, а при недостатке прав показывается Forbidden. Выход возвращает к форме входа. Тем самым подтверждается связность пользовательского пути MVP.',
    ],
  },
  {
    afterCaption: 'Рис. 17а. Диаграмма вариантов использования',
    mark: 'EXP_UC_17A',
    paragraphs: [
      'Диаграмма вариантов использования (рис. 17а) связывает актёров с прецедентами. Сотрудник выполняет вход и регистрацию, работу с новостями и обратной связью, активность, справочные и операционные сервисы, поиск. Модератор дополнительно управляет новостями. Администратор ведёт пользователей и роли. Общие сценарии (подтверждение email, Forbidden, выход) подчёркивают сквозной контроль доступа и согласуются с требованиями FR-01…FR-07.',
    ],
  },
  {
    afterCaption: 'Рис. 18. Дерево вызова программных модулей',
    mark: 'EXP_MOD_18',
    paragraphs: [
      'Дерево вызова модулей (рис. 18) показывает путь от SPA к REST API и предметным модулям. Модуль auth выдаёт JWT, регистрирует пользователей и подтверждает email через сервис mail и email_outbox. Модули news, comments, reactions и activity работают с СУБД; новости используют кэш ленты. Модули menu и admin обеспечивают ролевую навигацию и администрирование. Это модульный монолит: ответственность разделена, развёртывание едино, а при росте нагрузки сервисы можно выносить без ломки API. Инвалидация кэша при изменении новостей и реакций сохраняет актуальность ленты.',
    ],
  },
  {
    afterCaption: 'Рис. 19. Блок-схема модуля переключения реакции (лайк)',
    mark: 'EXP_ALG_19',
    paragraphs: [
      'Блок-схема алгоритма реакции (рис. 19) демонстрирует операционную логику лайка. Проверяется JWT-сессия, затем существование опубликованной новости. Если реакция пользователя уже есть — она удаляется, иначе создаётся. После изменения данных кэш ленты инвалидируется, клиенту возвращается актуальный счётчик. Алгоритм сочетает авторизацию, целостность и согласованность кэша и достаточен для контрольного примера like/unlike на карточке новости.',
    ],
  },
  {
    afterCaption: 'Рис. 42. Диаграммы показателей экономической эффективности',
    mark: 'EXP_ECON_42',
    paragraphs: [
      'Диаграммы экономической эффективности (рис. 42) визуализируют сравнение базового и предлагаемого вариантов: снижение стоимости трудозатрат аудитории и соотношение годовой экономии, затрат первого года, чистого эффекта и затрат на разработку. При учебных допущениях графики удобно вынести в презентацию к защите; при росте аудитории эффект масштабируется практически линейно при более медленном росте эксплуатационных затрат.',
    ],
  },
  {
    afterCaption: 'Рис. 22. Лента новостей корпоративного портала',
    mark: 'EXP_SCR_22',
    paragraphs: [
      'Лента новостей (рис. 22) — центральный экран информирования после входа. Карточки показывают заголовок, фрагмент текста, дату и агрегаты реакций/комментариев, что сокращает поиск объявлений по сравнению с разрозненными рассылками. Навигация ведёт к событиям, активности, справочникам и операциям в одном интерфейсе, автоматизируя доведение новости до сотрудника с сохранением контекста для комментариев.',
    ],
  },
  {
    afterCaption: 'Рис. 26. Лента активности',
    mark: 'EXP_SCR_26',
    paragraphs: [
      'Лента активности (рис. 26) дополняет официальные новости пользовательским контентом. Публикация поста с изображением из БД показывает цикл «ввод — сохранение — отображение» и фиксирует коммуникации внутри корпоративной учётки без перехода во внешние мессенджеры, усиливая практическую значимость социального контура MVP.',
    ],
  },
  {
    afterCaption: 'Рис. 33. Меню операций',
    mark: 'EXP_SCR_33',
    paragraphs: [
      'Меню операций (рис. 33) агрегирует сервисные разделы по роли пользователя и автоматизирует переход к кадровым и ИТ-сервисам без запоминания разрозненных адресов, связывая информационную часть портала с самообслуживанием сотрудника.',
    ],
  },
  {
    afterCaption: 'Рис. 39. Управление новостями (модератор)',
    mark: 'EXP_SCR_39',
    paragraphs: [
      'Экран управления новостями (рис. 39) автоматизирует модерацию: создание и редактирование публикаций, признак публикации. Доступ ограничен ролью модератора, что доказывает управляемость контентного контура наряду с чтением ленты.',
    ],
  },
  {
    afterCaption: 'Рис. 40. Администрирование пользователей',
    mark: 'EXP_SCR_40',
    paragraphs: [
      'Экран администрирования пользователей (рис. 40) завершает ролевую модель: назначение ролей и контроль учёток. Вместе с экраном Forbidden это подтверждает end-to-end проверку полномочий от интерфейса до сервера.',
    ],
  },
];

fs.writeFileSync(expansionsPath, JSON.stringify(expansions, null, 2), 'utf8');

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

# Guard: do not modify anything before СОДЕРЖАНИЕ (title + assignment)
$tocH0 = Find-First 'СОДЕРЖАНИЕ'
if ($null -eq $tocH0) { throw 'TOC heading missing' }
$assignGuardStart = 0
$assignGuardEnd = $tocH0.Start
Write-Output ('Assignment zone protected 0..' + $assignGuardEnd)

# ---- Page numbers ----
foreach ($section in @($doc.Sections)) {
  try {
    $section.PageSetup.DifferentFirstPageHeaderFooter = $false
    $section.PageSetup.OddAndEvenPagesHeaderFooter = $false
  } catch {}
  $footer = $section.Footers.Item(1)
  $footer.LinkToPrevious = $false
  $footer.Range.Delete() | Out-Null
  $footer.Range.ParagraphFormat.Alignment = 1
  $footer.Range.Font.Name = 'Times New Roman'
  $footer.Range.Font.Size = 12
  try { $null = $footer.PageNumbers.Add(1, $true) } catch { $null = $footer.Range.Fields.Add($footer.Range, 33) }
}
Write-Output 'Page numbers OK'

# ---- Insert expansions BEFORE figures (before image para preceding caption) ----
$inserted = 0
foreach ($exp in $expansions) {
  $mark = [string]$exp.mark
  if ($null -ne (Find-First $mark)) { Write-Output ('SKIP ' + $mark); continue }

  $needle = [string]$exp.afterCaption
  $cap = Find-First $needle
  if ($null -eq $cap -and $needle.Length -gt 36) { $cap = Find-First $needle.Substring(0, 36) }
  if ($null -eq $cap) { Write-Output ('MISS ' + $needle); continue }
  if ($cap.Start -lt $assignGuardEnd) { Write-Output ('SKIP assign-zone ' + $mark); continue }

  $capPara = $cap.Paragraphs.Item(1)
  $cursor = $capPara.Previous
  # skip image / empty paras to find last body text before figure block
  $guard = 0
  while ($null -ne $cursor -and $guard -lt 8) {
    $guard++
    $t = $cursor.Range.Text
    $hasShape = $cursor.Range.InlineShapes.Count -gt 0
    $plain = ''
    if ($null -ne $t) { $plain = $t.Trim().TrimEnd([char]13, [char]7) }
    if ($hasShape -or $plain.Length -lt 2) {
      $cursor = $cursor.Previous
      continue
    }
    break
  }
  if ($null -eq $cursor) { Write-Output ('NOBODY ' + $mark); continue }

  # Insert new body paragraphs AFTER this text para, i.e. before image/caption
  $insertRange = $cursor.Range.Duplicate
  $insertRange.Collapse(0) | Out-Null

  foreach ($paraText in @($exp.paragraphs)) {
    $p = $doc.Paragraphs.Add($insertRange)
    $p.Range.Text = ([string]$paraText) + [char]13
    $p.Range.Font.Name = 'Times New Roman'
    $p.Range.Font.Size = 14
    $p.Range.Font.Bold = $false
    $p.Range.ParagraphFormat.Alignment = 3
    try {
      $p.Range.ParagraphFormat.LineSpacingRule = 5
      $p.Range.ParagraphFormat.LineSpacing = 18
    } catch {}
    $p.Range.ParagraphFormat.FirstLineIndent = 35.4
    $p.Range.ParagraphFormat.SpaceAfter = 8
    $insertRange = $p.Range.Duplicate
    $insertRange.Collapse(0) | Out-Null
    $inserted++
  }

  # hidden marker after inserted text (still before figure)
  $m = $doc.Paragraphs.Add($insertRange)
  $m.Range.Text = $mark + [char]13
  $m.Range.Font.Size = 1
  $m.Range.Font.Color = 16777215
  try { $m.Range.Font.Hidden = $true } catch {}
  $m.Range.ParagraphFormat.SpaceAfter = 0
  $m.Range.ParagraphFormat.FirstLineIndent = 0
  Write-Output ('OK ' + $mark)
}
Write-Output ('Inserted=' + $inserted)

# ---- Rebuild TOC only (do not touch assignment) ----
$act = Find-First 'Актуальность темы обусловлена'
if ($null -eq $act) { throw 'Intro body missing' }
$tocH = Find-First 'СОДЕРЖАНИЕ'
$introH = $null
$cand = Find-From $tocH.End 'ВВЕДЕНИЕ'
while ($null -ne $cand -and $cand.Start -lt $act.Start) {
  $introH = $cand.Duplicate
  $cand = Find-From $cand.End 'ВВЕДЕНИЕ'
}
if ($null -eq $introH) { throw 'Intro heading missing' }

# Only delete TOC entries between СОДЕРЖАНИЕ and ВВЕДЕНИЕ
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
  Write-Output ('BM ' + $bm + ' pos=' + $hit.Start)
}

$delta = 0
if ($placed.ContainsKey('BM_G1') -and $placed.ContainsKey('BM_G2')) { $delta = $placed['BM_G2'] - $placed['BM_G1'] }
Write-Output ('DELTA_G1_G2 ' + $delta)
if ($delta -lt 2000) { throw 'Bad TOC bookmarks' }

$doc.Repaginate() | Out-Null
$totalPages = [Math]::Max(2, [int]$doc.ComputeStatistics(2))
$docEnd = [double]$doc.Content.End
Write-Output ('TOTAL_PAGES ' + $totalPages)

$pages = @{}
foreach ($it in $items) {
  $label = $it[0]; $bm = $it[2]
  if (-not $placed.ContainsKey($bm)) { $pages[$label] = ''; continue }
  $est = [int][Math]::Max(1, [Math]::Min($totalPages, [Math]::Round(1 + ([double]$placed[$bm] / $docEnd) * ($totalPages - 1))))
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
$tocBody.ParagraphFormat.FirstLineIndent = 0
$tocBody.ParagraphFormat.Alignment = 0 # left
foreach ($para in @($tocBody.Paragraphs)) {
  try {
    $para.Format.TabStops.ClearAll() | Out-Null
    $para.Format.TabStops.Add(460, 2, 1) | Out-Null
    $para.Format.FirstLineIndent = 0
    $para.Format.Alignment = 0
  } catch {}
}
Write-Output ('CONCLUSION_PAGE ' + $pages['ЗАКЛЮЧЕНИЕ'])

# Final guards
if ($null -eq (Find-First 'Актуальность темы обусловлена')) { throw 'Body lost' }
$tocH = Find-First 'СОДЕРЖАНИЕ'
$assignProbe = Find-First 'ЗАДАНИЕ'
if ($null -ne $assignProbe -and $assignProbe.Start -gt $tocH.Start) { throw 'Assignment moved after TOC unexpectedly' }

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

fs.writeFileSync(path.join(diploma, '_extract/fix_vkr2_inline.ps1'), '\uFEFF' + ps, 'utf8');
const r = spawnSync(
  'powershell',
  ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', path.join(diploma, '_extract/fix_vkr2_inline.ps1')],
  { encoding: 'utf8', timeout: 600000 }
);
console.log(r.stdout || '');
if (r.stderr) console.error(r.stderr);
if (r.status !== 0) process.exit(r.status || 1);
