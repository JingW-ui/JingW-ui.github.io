# tools/gpt-image-gallery/build.ps1
# 重建 GPT Image 2 提示词画廊数据快照 data.json
# 数据源: freestylefly/awesome-gpt-image-2 (MIT) 的 docs/gallery-part-{1,2}.md 与 gallery.md 分类索引
# 图片不落盘 —— 页面通过 jsDelivr 直链仓库原图, 本脚本只生成元数据 JSON
#
# 用法: pwsh tools/gpt-image-gallery/build.ps1   (在仓库根目录或任意目录均可)
# 注意: 本脚本含中文, Windows PowerShell 5.1 要求文件保存为 UTF-8 with BOM, 否则解析错乱

$ErrorActionPreference = 'Stop'
$repo   = 'freestylefly/awesome-gpt-image-2'
$branch = 'main'
$cdn    = "https://cdn.jsdelivr.net/gh/$repo@$branch"
$outDir = Join-Path $PSScriptRoot 'data'
$tmpDir = Join-Path $env:TEMP 'gpt-image-gallery-src'

New-Item -ItemType Directory -Force -Path $outDir, $tmpDir | Out-Null

function Get-Source([string]$name) {
    $local = Join-Path $tmpDir $name
    if (-not (Test-Path $local) -or (Get-Item $local).Length -lt 1KB) {
        Write-Host "下载 $name ..."
        curl.exe -sL --fail --retry 3 --max-time 180 -o $local "$cdn/docs/$name"
        if ($LASTEXITCODE -ne 0) { throw "下载失败: $name (exit $LASTEXITCODE)" }
    }
    else { Write-Host "缓存命中 $name" }
    return [IO.File]::ReadAllText($local)
}

$part1    = Get-Source 'gallery-part-1.md'
$part2    = Get-Source 'gallery-part-2.md'
$indexDoc = Get-Source 'gallery.md'

# ---------- 1. 解析分类索引 (gallery.md: <a name="cat-x"></a> + "### emoji 名称 · N cases" + 例号列表) ----------
$catMatches = [regex]::Matches($indexDoc, '(?s)<a name="(cat-[\w-]+)"></a>\s*###\s*\S+\s*([^·]+?)\s*·\s*\d+\s*cases(.*?)(?=<a name="cat-|\z)')
$catName = @{}          # catId -> 中文名
$catOrder = @()         # 保持索引顺序
$caseCat = @{}          # caseN -> catId (索引优先, 先到先得)
foreach ($m in $catMatches) {
    $cid = $m.Groups[1].Value; $cname = $m.Groups[2].Value.Trim()
    if (-not $catName.ContainsKey($cid)) { $catName[$cid] = $cname; $catOrder += $cid }
    foreach ($l in [regex]::Matches($m.Groups[3].Value, '\]\(\./gallery-part-\d\.md#case-(\d+)\)')) {
        $n = [int]$l.Groups[1].Value
        if (-not $caseCat.ContainsKey($n)) { $caseCat[$n] = $cid }
    }
}
Write-Host ("分类索引: {0} 类, 命中 {1} 例" -f $catOrder.Count, $caseCat.Count)

# ---------- 2. 标题关键词兜底分类 (索引未覆盖的例) ----------
$kwRules = @(
    @('cat-history',      '国风|古风|历史|唐朝|唐代|大明|明朝|宋朝|北宋|南宋|三国|武则天|苏轼|杜甫|李白|朱元璋|李成桂|御用|登基|篆刻|工笔画|圣旨|皇宫|长卷'),
    @('cat-document',     '处方|课本|书法|笔记|报纸|日报|杂志|文档|画册|教材|药方|黄历|手账|学习卡|回忆卡|词汇|食谱|题|书签|明信片'),
    @('cat-ui',           '界面|截图|网页|UI|FaceTime|朋友圈|微博|推特|直播|视频封面|资料卡|主页|中控|App 图标|App图标'),
    @('cat-infographic',  '信息图|图谱|图解|可视化|百科图|科普|拆解|因果链|技术详解|学习表|分析图|分析报告|结构板|图鉴|时间轴'),
    @('cat-poster',       '海报|KV|排版|字体|Campaign'),
    @('cat-product',      '电商|商品|广告|产品|包装|菜单|详情页|货架|展架|饮品|补剂|香水|口红|薯片|棒棒糖|饮料|苏打|玩具发布'),
    @('cat-brand',        '品牌|Logo|logo|标志|吉祥物|视觉识别|VI|触点系统'),
    @('cat-character',    '角色|人设|设定图|设定表|设定板|Lookbook|头像|玩偶|手办'),
    @('cat-architecture', '建筑|地图|地标|空间|室内|公寓|地铁|酒店套房|城市系统'),
    @('cat-scene',        '场景|叙事|分镜|Storyboard| storyboard|绘本|微缩世界|冒险者|魔像'),
    @('cat-photo',        '摄影|写真|人像|抓拍|街拍|自拍|胶片|照片|肖像|CCD|相机|镜头'),
    @('cat-illustration', '插画|绘画|涂鸦|水彩|艺术|像素|刺绣|纸雕|拼贴|羊毛毡|Sketchbook|速写|手绘')
)

# ---------- 3. 解析案例块 ----------
$allText = $part1 + "`n" + $part2
$blocks = [regex]::Split($allText, '<a name="case-(\d+)"></a>')
# Split 产生交错数组: [前置文本, '1', case1正文, '2', case2正文, ...]
$cases = New-Object System.Collections.Generic.List[object]
for ($i = 1; $i -lt $blocks.Count - 1; $i += 2) {
    $n = [int]$blocks[$i]; $body = $blocks[$i + 1]

    $t = [regex]::Match($body, '###\s*例\s*\d+：\s*(.+)')
    $title = if ($t.Success) { $t.Groups[1].Value.Trim() } else { "例 $n" }

    # 不依赖 alt 文本(上游 alt 可能含转义方括号), 直接抓块内第一个图片路径引用
    $img = [regex]::Match($body, '\(\.\./data/images/([^)]+)\)')
    if (-not $img.Success) { Write-Warning "例 $n 缺图片引用, 跳过"; continue }

    $s = [regex]::Match($body, '\*\*来源：\*\*\s*([^\r\n]+)')
    $src = if ($s.Success) { $s.Groups[1].Value.Trim() } else { '' }
    if ($src -eq '未提供') { $src = '' }

    $p = [regex]::Match($body, '(?s)```text\s*(.*?)```')
    $prompt = if ($p.Success) { $p.Groups[1].Value.Trim() } else { '' }

    if ($caseCat.ContainsKey($n)) { $cat = $caseCat[$n] }
    else {
        $cat = $null
        foreach ($r in $kwRules) {
            if ($r[1] -and [regex]::IsMatch($title, $r[1])) { $cat = $r[0]; break }
        }
        if (-not $cat) { $cat = 'cat-other' }
    }
    $cases.Add([pscustomobject]@{ n = $n; title = $title; img = $img.Groups[1].Value.Trim(); src = $src; cat = $cat; prompt = $prompt })
}

# ---------- 4. 分类覆盖统计 ----------
$missing = $cases | Where-Object { $_.cat -eq 'cat-other' -and -not $caseCat.ContainsKey($_.n) }
Write-Host ("解析案例: {0} 条 (编号范围 {1}-{2})" -f $cases.Count, ($cases | Measure-Object -Minimum -Property n).Minimum, ($cases | Measure-Object -Maximum -Property n).Maximum)
$noPrompt = @($cases | Where-Object { -not $_.prompt })
if ($noPrompt.Count) { Write-Warning ("{0} 条无提示词: {1}" -f $noPrompt.Count, (($noPrompt | Select-Object -First 10 -ExpandProperty n) -join ',')) }
$fallback = @($cases | Where-Object { -not $caseCat.ContainsKey($_.n) })
Write-Host ("标题兜底分类: {0} 条" -f $fallback.Count)

# ---------- 5. 生成 JSON (手写序列化, 保留中文原文, UTF-8 无 BOM) ----------
function Esc([string]$s) {
    if (-not $s) { return '' }
    $s.Replace('\', '\\').Replace('"', '\"').Replace("`r", '\r').Replace("`n", '\n').Replace("`t", '\t')
}
$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine('{')
[void]$sb.AppendLine('  "repo": "https://github.com/freestylefly/awesome-gpt-image-2",')
[void]$sb.AppendLine('  "license": "MIT",')
[void]$sb.AppendLine(('  "imageBase": "https://cdn.jsdelivr.net/gh/freestylefly/awesome-gpt-image-2@main/data/images/",'))
[void]$sb.AppendLine(('  "generated": "' + (Get-Date -Format 'yyyy-MM-dd') + '",'))
[void]$sb.AppendLine('  "categories": [')
$catJson = foreach ($cid in $catOrder) { '    { "id": "' + $cid + '", "name": "' + (Esc $catName[$cid]) + '" }' }
[void]$sb.AppendLine(($catJson -join ",`n"))
[void]$sb.AppendLine('  ],')
[void]$sb.AppendLine('  "cases": [')
$caseJson = foreach ($c in $cases) {
    '    { "n": ' + $c.n + ', "title": "' + (Esc $c.title) + '", "img": "' + (Esc $c.img) + '", "src": "' + (Esc $c.src) + '", "cat": "' + $c.cat + '", "prompt": "' + (Esc $c.prompt) + '" }'
}
[void]$sb.AppendLine(($caseJson -join ",`n"))
[void]$sb.AppendLine('  ]')
[void]$sb.Append('}')
$out = Join-Path $outDir 'data.json'
[IO.File]::WriteAllText($out, $sb.ToString(), (New-Object System.Text.UTF8Encoding($false)))
Write-Host ("已生成 {0}  ({1} KB)" -f $out, [math]::Round((Get-Item $out).Length / 1KB))
