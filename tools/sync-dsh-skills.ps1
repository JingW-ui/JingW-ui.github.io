# tools/sync-dsh-skills.ps1
# 把 .claude/skills 下选定的 skill 以 NTFS junction(目录联接)的方式暴露给 DSH:
#   .dsh/skills/<name>  --(junction)-->  .claude/skills/<name>
# 零复制:.dsh/ 已被 .gitignore,仓库不存第二份;编辑 .claude/skills 即时生效,无需重启会话。
#
# 用法:
#   pwsh tools/sync-dsh-skills.ps1                                  # 同步默认清单
#   pwsh tools/sync-dsh-skills.ps1 tailor-resume proposal-review    # 同步指定 skill
#   pwsh tools/sync-dsh-skills.ps1 -List                            # 查看当前 junction 状态
#   pwsh tools/sync-dsh-skills.ps1 -Remove tailor-resume            # 移除 junction(不动源文件)
#
# 换新机器:clone 仓库后跑一次本脚本(默认清单)即可。

param(
    [Parameter(Position = 0, ValueFromRemainingArguments = $true)]
    [string[]]$Names,
    [switch]$Remove,
    [switch]$List
)

$ErrorActionPreference = 'Stop'
$repo    = Split-Path $PSScriptRoot -Parent
$srcRoot = Join-Path $repo '.claude\skills'
$dstRoot = Join-Path $repo '.dsh\skills'
$default = @('tailor-resume', 'proposal-review', 'glassmorphism-design-system', 'add-tool-to-homepage')

function Get-Junctions {
    if (-not (Test-Path $dstRoot)) { return @() }
    Get-ChildItem $dstRoot -Directory | Where-Object { $_.LinkType -eq 'Junction' } |
        ForEach-Object { "{0} -> {1}" -f $_.Name, ($_.Target -join ' ') }
}

if ($List) {
    $j = Get-Junctions
    if ($j.Count -eq 0) { Write-Host '(.dsh\skills 下暂无 junction)'; return }
    $j | ForEach-Object { Write-Host $_ }
    return
}

if (-not $Names -or @($Names).Count -eq 0) { $Names = $default }
if (-not (Test-Path $dstRoot)) { New-Item -ItemType Directory -Path $dstRoot | Out-Null }

foreach ($name in $Names) {
    $target = Join-Path $srcRoot $name
    $link   = Join-Path $dstRoot $name

    if (-not (Test-Path $target)) { Write-Warning "源不存在,跳过: $name"; continue }

    if ($Remove) {
        if (Test-Path $link) {
            if ((Get-Item $link).LinkType -ne 'Junction') { Write-Warning "不是 junction,拒绝删除: $name"; continue }
            [System.IO.Directory]::Delete($link, $false)   # 只删联接本身,不递归、不碰源
            Write-Host "已移除 junction: $name"
        } else { Write-Host "本就不存在: $name" }
        continue
    }

    if (Test-Path $link) {
        $item = Get-Item $link
        if ($item.LinkType -eq 'Junction') { Write-Host "已是 junction,跳过: $name"; continue }
        Write-Warning "同名条目已存在且不是 junction,跳过: $name"
        continue
    }

    New-Item -ItemType Junction -Path $link -Value $target | Out-Null
    Write-Host "已创建 junction: .dsh\skills\$name -> .claude\skills\$name"
}
