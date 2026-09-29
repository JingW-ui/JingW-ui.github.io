# 人生重开模拟器（Remake）镜像同步脚本
# 兼容 Windows PowerShell 5.1 与 PowerShell 7+
# 上游: https://github.com/VickScarlet/remake （MIT License）
# 做的事：
#   1. 从 api.github.com 拉上游 main 源码 tarball（本网络 git 直连 GitHub 会被重置，API 通道可达）
#   2. pnpm 过滤安装 @remake/web 相关工作区（bun 缺失时自动 npm i -g bun）
#   3. build:data（xlsx -> TS）+ build:web（vite，官方 base:'./' 产物全相对路径）
#   4. 镜像 apps/web/dist -> 本目录（保留 sync.ps1 自身）
#   5. index.html 头部打镜像署名注释（幂等替换，含快照 sha 与日期）
#   6. 产物校验：index.html 不得出现根绝对路径引用；汇报文件数/体积并列出 JS 内硬编码域名供人工过目
# 依赖: node / pnpm / tar（Win10 自带）；首次缺 bun 会自动经 npm 安装
# 用法: pwsh -File Games/remake/sync.ps1
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$Root = $PSScriptRoot
$Utf8 = [System.Text.UTF8Encoding]::new($false)
$Work = Join-Path $env:TEMP ('remake-sync-' + (Get-Date -Format 'yyyyMMdd-HHmmss'))

# ---------- 0. 工具链自检 ----------
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) { throw '缺少 pnpm，请先 npm i -g pnpm' }
if (-not (Get-Command bun -ErrorAction SilentlyContinue)) {
  Write-Host 'bun 未安装，自动执行 npm i -g bun ...'
  npm i -g bun
  if ($LASTEXITCODE -ne 0) { throw 'bun 安装失败' }
  $npmBin = Join-Path $env:APPDATA 'npm'
  if (-not (Get-Command bun -ErrorAction SilentlyContinue) -and (Test-Path (Join-Path $npmBin 'bun.cmd'))) {
    $env:Path = "$env:Path;$npmBin"
  }
  if (-not (Get-Command bun -ErrorAction SilentlyContinue)) { throw 'bun 安装后仍不可用，检查 PATH' }
}

# ---------- 1. 拉源码 tarball 并解压 ----------
New-Item -ItemType Directory -Force $Work | Out-Null
$tgz = Join-Path $Work 'remake.tar.gz'
$wc = New-Object Net.WebClient
$wc.Headers.Add('User-Agent', 'jingw-mirror-script')
$wc.DownloadFile('https://api.github.com/repos/VickScarlet/remake/tarball/main', $tgz)
tar -xzf $tgz -C $Work
$src = Get-ChildItem $Work -Directory | Where-Object { $_.Name -like 'VickScarlet-remake-*' } | Select-Object -First 1
if (-not $src) { throw '解压后未找到 VickScarlet-remake-* 目录' }
$sha = $src.Name.Substring('VickScarlet-remake-'.Length)
if (-not (Test-Path (Join-Path $src.FullName 'package.json'))) { throw '上游结构变了：package.json 缺失，人工检查' }
Write-Host ("源码快照 sha: {0}  ({1:N0} KB)" -f $sha, ((Get-Item $tgz).Length / 1KB))

# ---------- 2-3. 安装依赖并构建 ----------
Push-Location $src.FullName
try {
  pnpm install --filter '@remake/web...'
  if ($LASTEXITCODE -ne 0) { throw 'pnpm install 失败' }
  pnpm build:data
  if ($LASTEXITCODE -ne 0) { throw 'build:data 失败' }
  pnpm build:web
  if ($LASTEXITCODE -ne 0) { throw 'build:web 失败' }
} finally { Pop-Location }

$dist = Join-Path $src.FullName 'apps\web\dist'
if (-not (Test-Path (Join-Path $dist 'index.html'))) { throw '构建产物缺 index.html' }

# ---------- 4. 镜像到本目录（保留 sync.ps1） ----------
Get-ChildItem $Root | Where-Object { $_.Name -ne 'sync.ps1' } | Remove-Item -Recurse -Force
Copy-Item (Join-Path $dist '*') $Root -Recurse -Force

# ---------- 5. 署名补丁（幂等） ----------
$htmlPath = Join-Path $Root 'index.html'
$html = [System.IO.File]::ReadAllText($htmlPath, $Utf8)
$stamp = (Get-Date).ToString('yyyy-MM-dd')
$comment = "<!-- 镜像自 VickScarlet/remake（人生重开模拟器 Remake，MIT License）https://github.com/VickScarlet/remake 快照 $sha@$stamp。更新: pwsh -File sync.ps1 -->"
$html = [regex]::Replace($html, '(?m)^<!-- 镜像自 VickScarlet/remake[^\r\n]*-->[\r\n]*', '')
$patched = [regex]::Replace($html, '(?i)(<!doctype html>)', "`$1`n$comment")
[System.IO.File]::WriteAllText($htmlPath, $patched, $Utf8)

# ---------- 6. 校验与汇报 ----------
$warn = @()
if ($patched -match '(?:src|href)="/[^/]') { $warn += 'index.html 存在根绝对路径引用' }
$jsHosts = @{}
Get-ChildItem $Root -Recurse -Filter '*.js' | ForEach-Object {
  $t = [System.IO.File]::ReadAllText($_.FullName)
  [regex]::Matches($t, '(?:https?|wss?)://[a-zA-Z0-9\.-]+') | ForEach-Object { $jsHosts[$_.Value.ToLower()] = $true }
}
$files = Get-ChildItem $Root -Recurse -File
$total = ($files | Measure-Object Length -Sum).Sum
if ($warn.Count) { Write-Warning "产物校验: $($warn -join '；')" } else { Write-Host '产物校验: 全相对路径，无根绝对引用' }
Write-Host ("镜像完成: {0} 个文件, {1:N2} MB" -f $files.Count, ($total / 1MB))
Write-Host ("JS 内硬编码域名（人工过目，应只有命名空间/文档/致谢类）: {0}" -f (($jsHosts.Keys | Sort-Object) -join ', '))
Remove-Item -Recurse -Force $Work -ErrorAction SilentlyContinue
Write-Host '本地预览: python -m http.server 8099 --directory <仓库根> -> http://127.0.0.1:8099/Games/remake/'
