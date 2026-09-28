# sync.ps1 - OSSU CS curriculum snapshot generator
# Pulls README.md from cdn.jsdelivr.net (fallback: raw.githubusercontent.com),
# parses the curriculum tables into data.js for tools/ossu-cs/index.html.
#
# Design rules:
#   * Columns are mapped BY HEADER NAME (not position) - upstream reorders are safe.
#   * Any parse anomaly is FATAL. We never write a half-parsed data.js.
#   * Output is pure ASCII (CJK-free): JSON string escapes handle all non-ASCII,
#     so this script itself and data.js have no encoding pitfalls.
#   * Presentation-only metadata (Chinese labels, icons) lives in index.html,
#     NOT here - re-syncing never clobbers it.

$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$root    = $PSScriptRoot
$outFile = Join-Path $root 'data.js'

$sources = @(
    'https://cdn.jsdelivr.net/gh/ossu/computer-science@master/README.md',
    'https://raw.githubusercontent.com/ossu/computer-science/master/README.md'
)

# ---------------------------------------------------------------- download
$md = $null
$used = $null
foreach ($src in $sources) {
    try {
        Write-Host ("GET " + $src)
        $wc = New-Object System.Net.WebClient
        $wc.Headers.Add('User-Agent', 'JingW-ui-sync/1.0')
        $wc.Encoding = [System.Text.Encoding]::UTF8
        $content = $wc.DownloadString($src)
        if ($content -and $content.Length -gt 10000) {
            $md = $content
            $used = $src
            break
        }
        Write-Warning ("suspiciously small response from " + $src)
    } catch {
        Write-Warning ("failed: " + $src + " -> " + $_.Exception.Message)
    }
}
if (-not $md) { throw 'FATAL: could not download README.md from any source.' }
if ($md -notmatch '##\s+Intro CS') { throw 'FATAL: downloaded README does not look like the OSSU CS curriculum.' }
Write-Host ("Downloaded " + $md.Length + " chars from " + $used)

# ---------------------------------------------------------------- helpers
function Clean-Text([string]$s) {
    if ($null -eq $s) { return '' }
    $t = $s -replace '\*\*', ''
    $t = $t -replace '`', ''
    $t = $t -replace '\\\*', ''
    $t = ($t -replace '\s+', ' ').Trim()
    return $t
}

function Cell-Text([string]$s) {
    if ($null -eq $s) { return $null }
    $t = $s.Trim()
    if ($t -eq '' -or $t -eq '-' -or $t -eq '\-') { return $null }
    return (Clean-Text $t)
}

function Abs-Url([string]$u) {
    if (-not $u) { return $null }
    $u = $u.Trim()
    if ($u -match '^https?://') { return $u }
    if ($u.StartsWith('#')) { return $null }   # in-page anchors are useless off-site
    if ($u -match '^coursepages/([^/]+)/') { return ('https://cs.ossu.dev/coursepages/' + $Matches[1] + '/') }
    return ('https://github.com/ossu/computer-science/blob/master/' + $u)
}

# Decode a markdown cell into ordered segments: text / link
function Decode-Segments([string]$raw) {
    $res = New-Object System.Collections.ArrayList
    if ($null -eq $raw) { return ,$res }
    $s = $raw.Trim()
    if ($s -eq '' -or $s -eq '-' -or $s -eq '\-') { return ,$res }

    $pos = 0
    foreach ($m in [regex]::Matches($s, '\[([^\]]+)\]\(([^)]+)\)')) {
        if ($m.Index -gt $pos) {
            $t = $s.Substring($pos, $m.Index - $pos).Trim(' ', '(', ')')
            if ($t) { [void]$res.Add(@{ t = 'text'; text = (Clean-Text $t) }) }
        }
        $au = Abs-Url $m.Groups[2].Value
        if ($au) {
            [void]$res.Add(@{ t = 'link'; text = (Clean-Text $m.Groups[1].Value); url = $au })
        } else {
            [void]$res.Add(@{ t = 'text'; text = (Clean-Text $m.Groups[1].Value) })
        }
        $pos = $m.Index + $m.Length
    }
    if ($pos -lt $s.Length) {
        $t = $s.Substring($pos).Trim(' ', '(', ')')
        if ($t) { [void]$res.Add(@{ t = 'text'; text = (Clean-Text $t) }) }
    }
    return ,$res
}

function Disc-Links([string]$s) {
    $res = New-Object System.Collections.ArrayList
    if ($null -eq $s) { return ,$res }
    foreach ($g in (Decode-Segments $s)) {
        if ($g.t -eq 'link') {
            [void]$res.Add([ordered]@{ label = (Clean-Text $g.text); url = $g.url })
        }
    }
    return ,$res
}

function Parse-Weeks([string]$s) {
    if (-not $s) { return $null }
    $t = $s.Trim().ToLower().Replace([char]0x2013, '-')
    if ($t -eq '' -or $t -eq '-' -or $t -eq '\-') { return $null }
    if ($t -match '(\d+)\s*month') { return [int][math]::Ceiling([double]$Matches[1] * 4.3) }
    $nums = @([regex]::Matches($t, '\d+') | ForEach-Object { [int]$_.Value })
    if ($nums.Count -ge 1) { return ($nums | Measure-Object -Maximum).Maximum }
    return $null
}

function Parse-Hours([string]$s) {
    if (-not $s) { return $null }
    $t = $s.Trim().ToLower().Replace([char]0x2013, '-')
    if ($t -match '(\d+)\s*-\s*(\d+)\s*hours?') { return [math]::Round(([int]$Matches[1] + [int]$Matches[2]) / 2.0, 1) }
    if ($t -match '(\d+(?:\.\d+)?)\s*hours?') { return [double]$Matches[1] }
    return $null
}

function Slug([string]$t) {
    return (($t.ToLower() -replace '[^a-z0-9]+', '-').Trim('-'))
}

function Split-Row([string]$line) {
    $t = $line.Trim()
    if ($t.StartsWith('|')) { $t = $t.Substring(1) }
    if ($t.EndsWith('|'))   { $t = $t.Substring(0, $t.Length - 1) }
    return @($t -split '\|' | ForEach-Object { $_.Trim() })
}

function New-Sec([string]$id, [string]$title, [string]$parent, [string]$kind) {
    $s = [ordered]@{}
    $s.id        = $id
    $s.title     = $title
    $s.parent    = $parent
    $s.kind      = $kind          # prose | courses | group
    $s.intro     = $null
    $s.topics    = New-Object System.Collections.ArrayList
    $s.bullets   = New-Object System.Collections.ArrayList
    $s.footnote  = $null
    $s.chooseOne = $false
    $s.courses   = New-Object System.Collections.ArrayList
    return $s
}

function ConvertTo-Course([hashtable]$row, [bool]$chooseOne) {
    $cell  = $row['course']
    $star  = $cell -match '\*'          # bare * or escaped \* (jsDelivr raw uses bare *)
    $clean = ($cell -replace '\*', ' ').Trim()

    $segs = Decode-Segments $clean
    $main = $null
    $alts = New-Object System.Collections.ArrayList
    foreach ($g in $segs) {
        if ($g.t -eq 'link') {
            if (-not $main) { $main = $g }
            else { [void]$alts.Add([ordered]@{ label = (Clean-Text $g.text); url = $g.url }) }
        }
    }
    if (-not $main) { throw ('FATAL: course row without a course link: ' + $cell) }

    $c = [ordered]@{}
    $c.name      = $main.text
    $c.url       = (Abs-Url $main.url)
    $c.alts      = $alts
    $c.duration  = (Cell-Text $row['duration'])
    $c.effort    = (Cell-Text $row['effort'])
    $c.weeks     = (Parse-Weeks $row['duration'])
    $c.hpw       = (Parse-Hours  $row['effort'])
    $c.prereq    = (Decode-Segments $row['prereq'])
    $c.note      = (Decode-Segments $row['note'])
    $c.discussion = (Disc-Links $row['discussion'])
    $c.chooseOne = $chooseOne
    $c.footnote  = [bool]$star
    return $c
}

# ---------------------------------------------------------------- parse
$lines = $md -replace "`r", '' -split "`n"
$sections = New-Object System.Collections.ArrayList

$keepH2 = @('Prerequisites', 'Intro CS', 'Core CS', 'Advanced CS', 'Final project')

$curTop = $null
$cur = $null
$inTopics = $false
$inTable = $false
$tableHeader = $null
$colMap = $null
$pendingChooseOne = $false

for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]

    # ---- h2 sections
    if ($line -match '^##\s+([^#].*?)\s*$') {
        $title = $Matches[1].Trim()
        $inTopics = $false; $inTable = $false; $pendingChooseOne = $false
        if ($keepH2 -contains $title) {
            switch ($title) {
                'Prerequisites' { $kind = 'prose' }
                'Intro CS'      { $kind = 'courses' }
                'Final project' { $kind = 'courses' }
                default         { $kind = 'group' }
            }
            $curTop = New-Sec (Slug $title) $title '' $kind
            $cur = $curTop
            [void]$sections.Add($curTop)
        } else {
            $curTop = $null
            $cur = $null
        }
        continue
    }

    # ---- h3 subsections (only inside group sections)
    if ($line -match '^###\s+([^#].*?)\s*$') {
        $inTopics = $false; $inTable = $false
        if ($curTop -and $curTop.kind -eq 'group') {
            $title = $Matches[1].Trim()
            $cur = New-Sec (Slug $title) $title $curTop.id 'courses'
            [void]$sections.Add($cur)
        }
        continue
    }

    # ---- topics covered block (backticked tags, one per line)
    if ($inTopics) {
        if ($line -match '^`([^`]+)`\s*$') {
            if ($cur) { [void]$cur.topics.Add($Matches[1].Trim()) }
            continue
        }
        if ($line.Trim() -eq '') { continue }
        $inTopics = $false
    }
    if ($line -match '^\*\*Topics covered\*\*') { $inTopics = $true; continue }

    # ---- "choose one" marker before a second table
    if ($line -match 'Choose\s+\*\*one\*\*\s+of the following') {
        $pendingChooseOne = $true
        if ($cur) { $cur.chooseOne = $true }
        continue
    }

    # ---- table header
    if (-not $inTable -and $line -match '^\s*\|?\s*Courses\s*\|') {
        $hdr = Split-Row $line
        if ($hdr.Count -lt 2 -or $hdr[0] -ne 'Courses') {
            throw ('FATAL: unexpected table header near line ' + ($i + 1) + ': ' + $line)
        }
        $j = $i + 1
        while ($j -lt $lines.Count -and $lines[$j].Trim() -eq '') { $j++ }
        if ($j -ge $lines.Count -or $lines[$j] -notmatch '^[\s|:\-]+$') {
            throw ('FATAL: missing separator row after table header near line ' + ($i + 1))
        }
        $colMap = @{}
        for ($c = 0; $c -lt $hdr.Count; $c++) {
            $name = ($hdr[$c] -replace '\s+', ' ').Trim().ToLower()
            switch -Regex ($name) {
                '^courses$'                        { $colMap[$c] = 'course' }
                '^duration$'                       { $colMap[$c] = 'duration' }
                '^effort$'                         { $colMap[$c] = 'effort' }
                '^prerequisites$'                  { $colMap[$c] = 'prereq' }
                '^discussion$'                     { $colMap[$c] = 'discussion' }
                '^(notes|additional text / assignments)$' { $colMap[$c] = 'note' }
                default { throw ('FATAL: unknown table column "' + $hdr[$c] + '" near line ' + ($i + 1)) }
            }
        }
        $tableHeader = $hdr
        $inTable = $true
        $i = $j
        continue
    }

    # ---- table body
    if ($inTable) {
        if ($line.Trim() -eq '') { $inTable = $false; $pendingChooseOne = $false; continue }
        if ($line -match '^[\s|:\-]+$') { continue }
        if ($line -match '\|') {
            if (-not $cur) { throw ('FATAL: table row outside a known section near line ' + ($i + 1)) }
            $cells = Split-Row $line
            if ($cells.Count -ne $tableHeader.Count) {
                throw ('FATAL: row has ' + $cells.Count + ' cells but header has ' + $tableHeader.Count + ' near line ' + ($i + 1) + ': ' + $line)
            }
            $row = @{}
            for ($c = 0; $c -lt $tableHeader.Count; $c++) { $row[$colMap[$c]] = $cells[$c] }
            [void]$cur.courses.Add((ConvertTo-Course $row $pendingChooseOne))
            continue
        }
        # non-row text ends the table (footnote lines etc.)
        $inTable = $false
        $pendingChooseOne = $false
    }

    # ---- after-table footnote "(\*) ..."
    if ($line -match '^\(\*\)\s*(.+)$') {
        if ($cur) { $cur.footnote = (Clean-Text $Matches[1]) }
        continue
    }

    # ---- bullets + first-paragraph intro
    if ($cur) {
        if ($line -match '^-\s+(.+)$') {
            [void]$cur.bullets.Add((Decode-Segments $Matches[1]))
            continue
        }
        if (-not $cur.intro -and $line.Trim() -ne '' -and
            $line -notmatch '^\s*\|' -and $line -notmatch '^!\[' -and $line -notmatch '^\*\*Topics') {
            $cur.intro = (Clean-Text $line)
        }
    }
}

# ---------------------------------------------------------------- validate
$byId = @{}
foreach ($s in $sections) { $byId[$s.id] = $s }

$mustIds = @('prerequisites','intro-cs','core-cs','core-programming','core-math','cs-tools',
             'core-systems','core-theory','core-security','core-applications','core-ethics',
             'advanced-cs','advanced-programming','advanced-systems','advanced-theory',
             'advanced-information-security','advanced-math','final-project')
$missing = @($mustIds | Where-Object { -not $byId.ContainsKey($_) })
if ($missing.Count -gt 0) { throw ('FATAL: missing expected sections: ' + ($missing -join ', ')) }

foreach ($s in $sections) {
    if ($s.kind -eq 'courses' -and $s.courses.Count -eq 0) {
        throw ('FATAL: section ' + $s.id + ' has no courses')
    }
}

$total = ($sections | ForEach-Object { $_.courses.Count } | Measure-Object -Sum).Sum
if ($total -lt 55 -or $total -gt 75) {
    throw ('FATAL: total course count ' + $total + ' outside expected 55..75 - upstream format likely changed')
}

# soft checks: known counts as of 2026-09 (warn only, upstream may legitimately change)
$expected = @{
    'intro-cs' = 1; 'core-programming' = 5; 'core-math' = 4; 'cs-tools' = 1
    'core-systems' = 4; 'core-theory' = 2; 'core-security' = 5; 'core-applications' = 6
    'core-ethics' = 3; 'advanced-programming' = 6; 'advanced-systems' = 3; 'advanced-theory' = 3
    'advanced-information-security' = 6; 'advanced-math' = 5; 'final-project' = 9
}
foreach ($k in $expected.Keys) {
    if ($byId.ContainsKey($k) -and $byId[$k].courses.Count -ne $expected[$k]) {
        Write-Warning ('section ' + $k + ' has ' + $byId[$k].courses.Count + ' courses, reference count was ' + $expected[$k] + ' (review data.js)')
    }
}

# ---------------------------------------------------------------- emit
function Json-Escape([string]$s) {
    $sb = New-Object System.Text.StringBuilder
    foreach ($ch in $s.ToCharArray()) {
        $code = [int]$ch
        if ($ch -eq '"') { [void]$sb.Append('\"') }
        elseif ($ch -eq '\') { [void]$sb.Append('\\') }
        elseif ($ch -eq "`n") { [void]$sb.Append('\n') }
        elseif ($ch -eq "`r") { [void]$sb.Append('\r') }
        elseif ($ch -eq "`t") { [void]$sb.Append('\t') }
        elseif ($code -lt 32) { [void]$sb.Append('\u' + $code.ToString('x4')) }
        elseif ($code -gt 126) { [void]$sb.Append('\u' + $code.ToString('x4')) }
        else { [void]$sb.Append($ch) }
    }
    return $sb.ToString()
}

function Format-Number($n) {
    $r = [math]::Round([double]$n, 1)
    if ($r -eq [math]::Floor($r)) { return [string][int]$r }
    return $r.ToString([System.Globalization.CultureInfo]::InvariantCulture)
}

function To-Json($o) {
    if ($null -eq $o) { return 'null' }
    if ($o -is [bool]) { if ($o) { return 'true' } else { return 'false' } }
    if ($o -is [int] -or $o -is [long]) { return $o.ToString([System.Globalization.CultureInfo]::InvariantCulture) }
    if ($o -is [double] -or $o -is [single] -or $o -is [decimal]) { return (Format-Number $o) }
    if ($o -is [string]) { return ('"' + (Json-Escape $o) + '"') }
    if ($o -is [System.Collections.IDictionary]) {
        $pairs = @()
        foreach ($k in $o.Keys) {
            $pairs += ('"' + (Json-Escape ([string]$k)) + '":' + (To-Json $o[$k]))
        }
        return ('{' + ($pairs -join ',') + '}')
    }
    if ($o -is [System.Collections.ICollection]) {
        $items = @()
        foreach ($v in $o) { $items += (To-Json $v) }
        return ('[' + ($items -join ',') + ']')
    }
    throw ('FATAL: cannot serialize type ' + $o.GetType().FullName)
}

$data = [ordered]@{}
$data.snapshot = [DateTime]::UtcNow.ToString('yyyy-MM-dd')
$data.source   = 'https://github.com/ossu/computer-science'
$data.site     = 'https://cs.ossu.dev'
$data.license  = 'MIT'
$data.sections = $sections

$json = To-Json $data
$jsHeader = @(
    '/* OSSU CS curriculum snapshot - parsed from ossu/computer-science README.md@master.'
    '   Source: https://github.com/ossu/computer-science  (MIT License) | Site: https://cs.ossu.dev'
    '   Generated by sync.ps1 - DO NOT EDIT BY HAND, re-run sync.ps1 instead. */'
) -join "`n"

[IO.File]::WriteAllText($outFile, $jsHeader + "`n" + 'window.OSSU_DATA=' + $json + ';' + "`n", (New-Object System.Text.UTF8Encoding($false)))

# ---------------------------------------------------------------- report
Write-Host ''
Write-Host ('Snapshot date : ' + $data.snapshot)
foreach ($s in $sections) {
    Write-Host ('  ' + $s.id.PadRight(34) + $s.courses.Count)
}
Write-Host ('Total courses : ' + $total)
Write-Host ('Wrote         : ' + $outFile + ' (' + [math]::Round((Get-Item $outFile).Length / 1KB, 1) + ' KB)')
