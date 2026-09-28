# 《高性价比人生指南》镜像同步脚本
# 兼容 Windows PowerShell 5.1 与 PowerShell 7+
# 上游: https://github.com/eternity4719/HowToLiveBetter （Unlicense，公有领域）
# 做的事：
#   1. 拉取 index.html / README.md / book/*.md / docs/*.md（顶层长文）到本目录
#      —— book 与 docs 文件清单从 README.md 的链接里动态解析，上游加章节自动跟上
#   2. 对 index.html 应用本地补丁：
#      a. 剥离 Google Analytics（作者预置 ga:start/ga:end 剥离标记）
#      b. 剥离侧栏广告位
#      c. robots 改 noindex（镜像不与源站抢搜索排名）
#      d. 页脚追加镜像快照说明
#   3. 汇报文件数与体积
# 用法: pwsh -File tools/life-better/sync.ps1
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$Upstream = 'https://cdn.jsdelivr.net/gh/eternity4719/HowToLiveBetter@main/'
$Root     = $PSScriptRoot
$Utf8     = [System.Text.UTF8Encoding]::new($false)

function Get-EncodedPath([string]$path) {
  # 逐段百分号编码，保留 /；上游链接若是 %XX 形式先解回原名
  if ($path -match '%[0-9a-fA-F]{2}') { $path = [uri]::UnescapeDataString($path) }
  return (($path -split '/') | ForEach-Object { [uri]::EscapeDataString($_) }) -join '/'
}

function Save-File([string]$path, [string]$dest) {
  $url = $Upstream + (Get-EncodedPath $path)
  for ($i = 1; ; $i++) {
    try {
      $tmp = $dest + '.dl'
      Invoke-WebRequest -UseBasicParsing -Uri $url -OutFile $tmp -TimeoutSec 60
      Move-Item -Force $tmp $dest
      return (Get-Item $dest).Length
    } catch {
      if ($i -ge 3) { throw "下载失败: $path — $($_.Exception.Message)" }
      Start-Sleep -Seconds $i
    } finally {
      if (Test-Path ($dest + '.dl')) { Remove-Item -Force ($dest + '.dl') -ErrorAction SilentlyContinue }
    }
  }
}

# ---------- 1. index.html + 本地补丁 ----------
$indexPath = Join-Path $Root 'index.html'
$bytes = (Invoke-WebRequest -UseBasicParsing -Uri ($Upstream + 'index.html') -TimeoutSec 60).Content
$text = if ($bytes -is [string]) { $bytes } else { [System.Text.Encoding]::UTF8.GetString($bytes) }

$patched = [regex]::Replace($text, '(?s)\s*<!-- ga:start.*?ga:end -->', '')
$patched = [regex]::Replace($patched, '(?s)\s*<div class="group ad">.*?</div>(?=\s*</aside>)', '')
$patched = [regex]::Replace($patched, '<meta name="robots" content="[^"]*"',
  '<meta name="robots" content="noindex"', 'IgnoreCase')
$patched = [regex]::Replace($patched, 'Unlicense，公有领域。',
  'Unlicense，公有领域。本页为镜像快照，最新内容以 <a href="https://github.com/eternity4719/HowToLiveBetter" target="_blank" rel="noopener">源仓库</a> 为准。')
$patched = [regex]::Replace($patched, '^<!doctype html>',
  "<!doctype html>`n<!-- 镜像自 eternity4719/HowToLiveBetter（Unlicense 公有领域）。本地补丁：剥 GA/广告、noindex。更新：pwsh -File sync.ps1 -->",
  'IgnoreCase')

$warn = @()
if ($patched -match 'googletagmanager|G-NTPGXCLMP6') { $warn += 'GA 未剥净' }
if ($patched -match 'mcyyy')                   { $warn += '广告未剥净' }
if ($patched -notmatch 'noindex')              { $warn += 'noindex 未生效' }
if ($warn.Count) { Write-Warning "补丁校验: $($warn -join '；')" }
else { Write-Host '补丁校验: GA 已剥 / 广告已剥 / noindex 已生效' }

[System.IO.File]::WriteAllText($indexPath, $patched, $Utf8)
Write-Host ("index.html  {0,8:N0} bytes（补丁后）" -f (Get-Item $indexPath).Length)

# ---------- 2. README.md ----------
$r1 = Save-File 'README.md' (Join-Path $Root 'README.md')
Write-Host ("README.md   {0,8:N0} bytes" -f $r1)
$readme = [System.IO.File]::ReadAllText((Join-Path $Root 'README.md'), $Utf8)

# ---------- 3. book/*.md 与顶层 docs/*.md（清单来自 README 链接） ----------
$bookFiles = [regex]::Matches($readme, '\((book/[^)]+\.md)\)') | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique
$docFiles  = [regex]::Matches($readme, '\((docs/[^/)]+\.md)\)') | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique
if (-not $bookFiles.Count) { throw 'README 里没解析到 book/*.md 链接，上游结构可能变了，人工检查' }

$total = (Get-Item $indexPath).Length + $r1; $count = 2
foreach ($f in $bookFiles) {
  $dest = Join-Path $Root ($f -replace '/', [IO.Path]::DirectorySeparatorChar)
  $destDir = Split-Path $dest -Parent
  if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Force $destDir | Out-Null }
  $total += Save-File $f $dest; $count++
}
Write-Host ("book/       {0,3} 个文件" -f $bookFiles.Count)
foreach ($f in $docFiles) {
  $dest = Join-Path $Root ($f -replace '/', [IO.Path]::DirectorySeparatorChar)
  $destDir = Split-Path $dest -Parent
  if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Force $destDir | Out-Null }
  $total += Save-File $f $dest; $count++
}
Write-Host ("docs/       {0,3} 个顶层长文" -f $docFiles.Count)
Write-Host ("合计        {0,3} 个文件, {1:N1} MB" -f $count, ($total / 1MB))
Write-Host '完成。本地预览: python -m http.server 8099 -> http://127.0.0.1:8099/tools/life-better/'
