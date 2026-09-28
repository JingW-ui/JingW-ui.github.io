# =============================================================
#  sync.ps1 — yang0/handraw-style 画廊镜像同步脚本
#  兼容 Windows PowerShell 5.1 与 PowerShell 7+（本文件必须带 UTF-8 BOM）
#  用法: pwsh -File tools/handraw-style/sync.ps1
#
#  源: GitHub codeload tarball（jsDelivr 对该仓库返回 403：
#      "Package size exceeded the configured limit of 50 MB"，不可用）
#  产物（脚本所在目录）:
#    index.html / layouts.html / colors.html / tutorials.html  （补丁后画廊页）
#    images/                                                    （页面实际引用的图片）
#    LICENSE / version.json
#
#  本地补丁:
#    1. 图片路径 ../../../images/ -> images/（同目录化）
#    2. 版本检查 data-remote-version-url -> 本地 version.json（不再请求 raw.githubusercontent）
#    3. 剥离微信社群弹窗 #wechat-modal + 顶部触发按钮；JS 残余触发点转跳源仓库
#    4. <meta name="robots" content="noindex">
#    5. 镜像声明页脚 + 文件头横幅注释
# =============================================================

$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$Repo       = 'yang0/handraw-style'
$Branch     = 'master'
$RepoUrl    = "https://github.com/$Repo"
$TarballUrl = "https://codeload.github.com/$Repo/tar.gz/refs/heads/$Branch"
$Dest       = $PSScriptRoot
$Pages      = @('index.html', 'layouts.html', 'colors.html', 'tutorials.html')
$Utf8NoBom  = New-Object System.Text.UTF8Encoding($false)

function Read-TextUtf8([string]$Path) {
    [System.IO.File]::ReadAllText($Path, (New-Object System.Text.UTF8Encoding($false)))
}
function Write-TextUtf8([string]$Path, [string]$Text) {
    [System.IO.File]::WriteAllText($Path, $Text, $Utf8NoBom)
}

# ---------- 1. 下载并解压 tarball（3 次重试） ----------
$tmp = Join-Path $env:TEMP ('handraw-sync-' + [guid]::NewGuid().ToString('N').Substring(0, 8))
New-Item -ItemType Directory -Path $tmp -Force | Out-Null
$tgz = Join-Path $tmp 'repo.tar.gz'

$ok = $false
for ($i = 1; $i -le 3; $i++) {
    try {
        Write-Host "[1/5] 下载 tarball（第 $i 次尝试）..."
        Invoke-WebRequest -UseBasicParsing -Uri $TarballUrl -OutFile $tgz
        $ok = $true
        break
    } catch {
        Write-Warning "下载失败：$($_.Exception.Message)"
        Start-Sleep -Seconds (3 * $i)
    }
}
if (-not $ok) { throw 'tarball 下载失败（3 次）。检查网络或 codeload.github.com 可达性。' }
Write-Host ("      tarball 大小：{0:N1} MB" -f ((Get-Item $tgz).Length / 1MB))

Write-Host '[1/5] 解压...'
tar -xzf $tgz -C $tmp
$src = Get-ChildItem $tmp -Directory | Where-Object { $_.Name -like 'handraw-style-*' } | Select-Object -First 1
if (-not $src) { throw '解压后未找到仓库根目录' }
$src = $src.FullName
$gallery = Join-Path $src 'skills\handdraw-style-prompter\gallery'
if (-not (Test-Path (Join-Path $gallery 'index.html'))) { throw "画廊目录不存在：$gallery" }

# ---------- 2. 读取并补丁四个页面 ----------
$FooterNote = ('<footer class="mirror-note" style="margin:26px 0 4px;padding-top:14px;' +
    'border-top:1px solid rgba(0,0,0,.12);text-align:center;font-size:13px;color:#8a8378">' +
    '本页为 <a href="{0}" target="_blank" rel="noopener noreferrer" ' +
    'style="color:#d67d4d;text-decoration:none;font-weight:600">{1}</a>（MIT License）' +
    '的镜像快照，新增编号以源仓库为准</footer>') -f $RepoUrl, $Repo

$Banner = ('<!-- 镜像自 {0}（MIT License）。本地补丁：noindex、剥离社群二维码、图片路径本地化。' +
    '更新：pwsh -File tools/handraw-style/sync.ps1 -->') -f $RepoUrl

# JS 空对象桩：#wechat-modal 节点已剥离，未判空的 wechatModal 调用必须拿到无害实现；
# 残余的 .open-wechat-modal 触发点（如提示条里的“加入交流群”）转跳源仓库
$Stub = ("wechatModal=document.querySelector('#wechat-modal')||" +
    "{showModal:function(){window.open('$RepoUrl','_blank')},close:function(){}," +
    "addEventListener:function(){},querySelector:function(){return{addEventListener:function(){}}}}")

$patchReport = @{}
$pagedText = @{}
foreach ($p in $Pages) {
    $t = Read-TextUtf8 (Join-Path $gallery $p)
    $origLen = $t.Length

    # 2a. noindex
    $n = [regex]::Matches($t, [regex]::Escape('<meta charset="utf-8">')).Count
    if ($n -ne 1) { throw "${p}: charset 锚点数=$n（预期 1）" }
    $t = $t.Replace('<meta charset="utf-8">', '<meta charset="utf-8"><meta name="robots" content="noindex">')

    # 2b. 图片路径同目录化
    $nPath = [regex]::Matches($t, [regex]::Escape('../../../images/')).Count
    $t = $t.Replace('../../../images/', 'images/')

    # 2c. 版本检查指向本地 version.json（仅 index 有）
    $nVer = [regex]::Matches($t, 'data-remote-version-url="https://raw\.githubusercontent\.com/[^"]+version\.json"').Count
    if ($nVer -gt 0) {
        $t = [regex]::Replace($t, 'data-remote-version-url="https://raw\.githubusercontent\.com/[^"]+version\.json"', 'data-remote-version-url="version.json"')
    }

    # 2d. 剥离微信弹窗（每页恰好 1 个）
    $nDlg = [regex]::Matches($t, '(?s)<dialog id="wechat-modal".*?</dialog>').Count
    if ($nDlg -ne 1) { throw "${p}: wechat-modal 弹窗数=$nDlg（预期 1）" }
    $t = [regex]::Replace($t, '(?s)\s*<dialog id="wechat-modal".*?</dialog>', '')

    # 2e. 剥离导航栏触发按钮
    $nBtn = [regex]::Matches($t, '<button class="nav-btn" id="wechat-btn"[^>]*>[^<]*</button>').Count
    if ($nBtn -ne 1) { throw "${p}: wechat-btn 触发按钮数=$nBtn（预期 1）" }
    $t = [regex]::Replace($t, '\s*<button class="nav-btn" id="wechat-btn"[^>]*>[^<]*</button>', '')

    # 2f. JS 空对象桩
    $nStub = [regex]::Matches($t, [regex]::Escape("wechatModal=document.querySelector('#wechat-modal')")).Count
    if ($nStub -ne 1) { throw "${p}: wechatModal 声明数=$nStub（预期 1）" }
    $t = $t.Replace("wechatModal=document.querySelector('#wechat-modal')", $Stub)

    # 2g. 镜像页脚 + 文件头横幅
    $nMain = [regex]::Matches($t, '</main>').Count
    if ($nMain -ne 1) { throw "${p}: </main> 数=$nMain（预期 1）" }
    $t = $t.Replace('</main>', $FooterNote + '</main>')
    $t = [regex]::Replace($t, '(?s)^<!doctype html>\s*', "<!doctype html>`n$Banner`n")

    $pagedText[$p] = $t
    $patchReport[$p] = [pscustomobject]@{ orig = $origLen; imgs = $nPath; ver = $nVer; dlg = $nDlg; btn = $nBtn; stub = $nStub }
}

# ---------- 3. 从补丁后文本解析图片清单并复制 ----------
# 微信二维码在已删弹窗内，解析结果自动不含它们
$imageRefs = @{}
foreach ($p in $Pages) {
    foreach ($m in [regex]::Matches($pagedText[$p], 'images/[A-Za-z0-9_\-/]+\.(?:webp|png)')) {
        $imageRefs[$m.Value] = $true
    }
}
Write-Host ("[2/5] 图片引用清单：{0} 个文件" -f $imageRefs.Count)

$missing = @()
foreach ($rel in $imageRefs.Keys) {
    $from = Join-Path $src ($rel -replace '/', '\')
    if (-not (Test-Path $from)) { $missing += $rel }
}
if ($missing.Count -gt 0) { throw ("上游缺少被引用的图片 {0} 个：{1}" -f $missing.Count, ($missing | Select-Object -First 5) -join ', ') }

$imgDir = Join-Path $Dest 'images'
if (Test-Path $imgDir) { Remove-Item $imgDir -Recurse -Force }
$copied = 0
foreach ($rel in $imageRefs.Keys) {
    $to = Join-Path $Dest ($rel -replace '/', '\')
    $toDir = Split-Path $to -Parent
    if (-not (Test-Path $toDir)) { New-Item -ItemType Directory -Path $toDir -Force | Out-Null }
    Copy-Item (Join-Path $src ($rel -replace '/', '\')) $to
    $copied++
}

# ---------- 4. 写出页面 + LICENSE + version.json ----------
foreach ($p in $Pages) { Write-TextUtf8 (Join-Path $Dest $p) $pagedText[$p] }
Copy-Item (Join-Path $src 'LICENSE') (Join-Path $Dest 'LICENSE') -Force
Copy-Item (Join-Path $src 'version.json') (Join-Path $Dest 'version.json') -Force

# ---------- 5. 校验 ----------
Write-Host '[3/5] 校验补丁...'
$fail = @()
foreach ($p in $Pages) {
    $t = Read-TextUtf8 (Join-Path $Dest $p)
    if ($t -match '\.\./\.\./\.\./images/') { $fail += "${p}: 残留上游相对路径" }
    if ($t -match 'id="wechat-modal"|id="wechat-btn"') { $fail += "${p}: 微信区块未剥净" }
    if ($t -match 'raw\.githubusercontent\.com') { $fail += "${p}: 残留 raw.githubusercontent 引用" }
    if ($t -notmatch 'name="robots" content="noindex"') { $fail += "${p}: 缺 noindex" }
    if ($t -notmatch [regex]::Escape($Repo)) { $fail += "${p}: 缺镜像声明" }
}
if ($fail.Count -gt 0) { throw ("补丁校验失败：`n" + ($fail -join "`n")) }

# 每个页面引用的图片都必须真实存在
foreach ($p in $Pages) {
    $t = Read-TextUtf8 (Join-Path $Dest $p)
    foreach ($m in [regex]::Matches($t, 'images/[A-Za-z0-9_\-/]+\.(?:webp|png)')) {
        if (-not (Test-Path (Join-Path $Dest ($m.Value -replace '/', '\')))) {
            throw "$p 引用的 $($m.Value) 在本地不存在"
        }
    }
}

# ---------- 6. 汇总 ----------
$imgStats = Get-ChildItem $imgDir -Recurse -File
$bytes = ($imgStats | Measure-Object Length -Sum).Sum
Write-Host '[4/5] 清理临时目录...'
Remove-Item $tmp -Recurse -Force
Write-Host '[5/5] 完成'
Write-Host ''
Write-Host ("页面：{0} 个（noindex ✓ 镜像页脚 ✓ 社群弹窗已剥离 ✓ 版本检查本地化 ✓）" -f $Pages.Count)
Write-Host ("图片：{0} 个文件，{1:N2} MB" -f $imgStats.Count, ($bytes / 1MB))
foreach ($p in $Pages) {
    $r = $patchReport[$p]
    Write-Host ("  {0,-16} {1,6:N0} -> {2,6:N0} 字符  路径改写 x{3}  verUrl x{4}  弹窗 x{5}  按钮 x{6}  桩 x{7}" -f $p, $r.orig, $pagedText[$p].Length, $r.imgs, $r.ver, $r.dlg, $r.btn, $r.stub)
}
Write-Host ''
Write-Host '下一步：git add tools/handraw-style && git commit && git push origin main'
