---
name: add-tool-to-homepage
description: 将新的工具、游戏或软件注册到对应主页（tools/index.html、Games/index.html 或 softwares/index.html），并同步更新个人主页 index.html 的随机推荐池与 GEO 清单（sitemap.xml、llms.txt、llms-full.txt）。当用户创建了新工具页面、新游戏页面、新软件下载条目、想把子项目添加到主页、需要注册新条目到工具箱/游戏中心/软件下载索引时触发。适用于：添加新工具卡片、添加新游戏卡片、添加新软件卡片、为新工具/游戏/软件创建索引入口、更新分类、把新做的页面纳入索引等场景。即使用户没有明确说"添加到主页"，只要涉及到把新做的工具或游戏页面挂到对应集合页，都应该使用此技能。
---

# 添加工具 / 游戏到主页

将新的工具子项目注册到 `tools/index.html` 工具箱主页、新的游戏注册到 `Games/index.html` 游戏中心主页、新的 Windows 软件注册到 `softwares/index.html` 软件下载中心，**并同步更新个人主页 `index.html` 的随机推荐池与 GEO 清单（sitemap.xml / llms.txt / llms-full.txt）**。

## 核心原则：六处同步 + 自动推送

仓库中有六处维护「工具/游戏/软件清单」，添加任何新条目时**必须全部同步**，否则主页随机推荐位会出现死链或漏推，搜索引擎与 AI 爬虫也发现不了新页面：

1. **集合页索引卡片** —— `tools/index.html`（工具）/ `Games/index.html`（游戏）/ `softwares/index.html`（软件）
2. **统计数字** —— 工具页 `📦 共创建 N 个实用工具` + 所属分区 `section-count`；游戏页分类 chips 计数与副标题；软件页 `共 N 款 Windows 软件` + 分区 `section-count`
3. **个人主页随机池** —— `index.html` 中的 `TOOLS` 数组（工具）或 `GAMES` 数组（游戏；软件不进随机池）
4. **sitemap.xml** —— 新页面 URL + 所属 hub 的 lastmod（同步点 4-6 由脚本一键完成）
5. **llms.txt** —— 对应分区追加条目行（同步点 4-6 由脚本一键完成）
6. **llms-full.txt** —— 追加详情块并刷新生成日期（同步点 4-6 由脚本一键完成）

**同步点 4-6 不要手工编辑**。卡片改完后，在仓库根目录运行一条命令重生成三个清单：

```bash
node .claude/skills/add-tool-to-homepage/scripts/regen-geo.mjs
```

脚本以三个 hub 页的卡片为唯一事实源，自动增删条目、精确继承 lastmod（已存在页面不虚改日期），并输出增删摘要供核对。

**每次添加操作都必须同时更新以上同步点，缺一不可。完成后必须立即提交并推送到远程仓库。**

## 判断类型

- 工具页面位于 `tools/` 下 → 走【工具流程】
- 游戏页面位于 `Games/` 下 → 走【游戏流程】
- 软件下载条目 → 走【软件注册流程】

---

## 工具流程

### 1. 收集工具信息

从对话上下文或目标页面提取（读取 `tools/{slug}/index.html` 的 `<title>` 可获取准确名称）：

| 信息 | 说明 | 示例 |
|------|------|------|
| 工具路径 | 相对于 `/tools/` 的目录名（slug） | `hot-dashboard` |
| 工具名称 | 显示在卡片上的标题 | `60s 信息流` |
| 工具描述 | 一句话介绍功能 | `聚合多平台热搜榜单` |
| 所属分类 | 现有分类或新建 | `信息类` / `info` |
| 图标 | 图片路径或默认 SVG | 见下方图标规范 |

### 2. 确认分类

`tools/index.html` 用**分区（section）**组织卡片：每个分类是一个 `<section class="category-section" data-category="{分类ID}">`，内含标题 `<h2 class="section-title">{分类名称}<span class="section-count">N</span></h2>` 和 `<div class="tools-grid">`（所有卡片都放在这里）。先确认目标分类的 section 是否存在。

**现有分类**（ID → 分区标题；卡片数随注册变化，以文件为准）：
- `image` - 图片工具
- `text` - 字符处理
- `time` - 时间与日期
- `calc` - 计算与换算
- `info` - 信息聚合
- `other` - 实用杂项

**如果需要新分类**：在最后一个 `</section>` 后照现有结构新建一个 `category-section`，同时在搜索区 `<div class="quick-filter" id="quickFilter">` 里补一个 `<button type="button" class="qf-chip" data-cat="新分类ID">新分类名称</button>`，并在 `index.html` 的 `ICONS`、`TAGS` 映射表里各补一条。

### 3. 准备图标

**优先级**：
1. 用户提供的图片路径（如 `/tools/assets/logo/xxx.webp`）
2. 现有 logo 文件
3. 默认 SVG 图标（内联 data URI，临时使用）

**默认 SVG 图标示例**：

信息类（蓝色网格）：
```
data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%233b82f6' stroke-width='2'%3E%3Crect x='3' y='3' width='7' height='7' rx='1'/%3E%3Crect x='14' y='3' width='7' height='7' rx='1'/%3E%3Crect x='3' y='14' width='7' height='7' rx='1'/%3E%3Crect x='14' y='14' width='7' height='7' rx='1'/%3E%3C/svg%3E
```

趋势类（红色折线）：
```
data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23e36d6e' stroke-width='2'%3E%3Cpolyline points='23 6 13.5 15.5 8.5 10.5 1 18'/%3E%3Cpolyline points='17 6 23 6 23 12'/%3E%3C/svg%3E
```

工具类（绿色扳手）：
```
data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2322c55e' stroke-width='2'%3E%3Cpath d='M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z'/%3E%3C/svg%3E
```

### 4. 在工具箱主页添加卡片（同步点 1）

在 `tools/index.html` 目标分类的 `<section class="category-section" data-category="{分类ID}">` 内、`<div class="tools-grid">` 中同类卡片之后插入：

```html
<a href="/tools/{slug}/" class="tool-card" data-name="{工具名称}" data-desc="{工具描述}" title="{工具描述}">
    <div class="tool-icon"><img src="{图标URL}" alt="{工具名称}"></div>
    <h3 class="tool-name">{工具名称}</h3>
</a>
```

> 注意：实际结构里卡片**没有** `data-category` 属性（分类靠外层 section 分组），也没有 `tool-label` / `tool-card-header` / `tool-content` 包裹层和描述段落——描述只存在于 `data-desc`（搜索用）和 `title`（悬停提示）两个属性中。以现有文件实际结构为准。

**插入位置**：同一 section 的 `tools-grid` 内同类卡片之后，保持分类内工具的逻辑顺序。

### 5. 更新统计数字（同步点 2，仅工具）

两处计数都要 +1：

1. 所属分区标题里的计数：

```html
<h2 class="section-title">信息聚合<span class="section-count">15</span></h2>  <!-- 15 → 16 -->
```

2. 顶部 `stats-banner` 总数：

```html
<div class="stats-banner">
    📦 共创建 74 个实用工具
</div>
```

**两个数字必须与实际卡片数一致**：添加后数一遍 `.tool-card` 总数（应等于 banner 数字）和该分区内的卡片数（应等于 section-count）。

### 6. 同步个人主页随机工具池（同步点 3）

打开 `index.html`，找到 `const TOOLS = [ ... ];` 数组，在数组末尾（最后一个 `]` 之前）追加一行：

```javascript
['{slug}','{工具名称}','{工具描述}','{分类ID}'],
```

> 原最后一行通常没有尾逗号，追加前记得先给上一行补上 `,`。

**数组元素格式**：`[slug, name, desc, category]`，分类 ID 取值与工具箱主页一致（`text` / `image` / `time` / `calc` / `other` / `info`）。

**字段对应规则**：
- `slug` = 工具目录名（不带末尾 `/`），用于拼 `/tools/{slug}/`
- `name` / `desc` = 与工具箱卡片一致（可适当精简描述以适应推荐位）
- `category` = 工具所属 `category-section` 的 `data-category`（卡片本身没有该属性）

`ICONS` 和 `TAGS` 映射表已覆盖全部现有分类，无需改动；若新增了全新分类 ID，需同步在 `ICONS` 和 `TAGS` 对象里补一条。

### 7. GEO 清单重生成（同步点 4-6）

在仓库根目录运行：

```bash
node .claude/skills/add-tool-to-homepage/scripts/regen-geo.mjs
```

核对输出摘要：sitemap.xml 新增 `/tools/{slug}/` 且 hub lastmod 刷新；llms.txt 工具分区与 llms-full.txt 各新增条目。脚本幂等，重复运行无害。

---

## 游戏流程

### 1. 收集游戏信息

从对话上下文或 `Games/{slug}/index.html` 的 `<title>` 提取：

| 信息 | 说明 | 示例 |
|------|------|------|
| 游戏路径 | 相对于 `/Games/` 的目录名（slug） | `snake` |
| 游戏名称 | 卡片标题 | `霓虹贪吃蛇` |
| 缩略图 | `Games/assets/img/` 下的图片文件 | `snake.webp` |

游戏无分类系统，无需选分类。

### 2. 确认缩略图

游戏卡片必须使用 webp 缩略图，位于 `Games/assets/img/` 下。若用户未提供，需先确认图片是否存在；缺失时向用户索要，不要用占位图糊弄。

### 3. 在游戏中心主页添加卡片（同步点 1）

在 `Games/index.html` 的 `<div class="games-container">` 内**最上方**（最新优先排序）插入卡片：

```html
<div class="game-card" data-href="/Games/{slug}/" data-cat="{分类ID}" data-name="{游戏名称}">
    <img src="assets/img/{图片文件}" alt="{游戏名称}" class="game-image">
    <div class="game-overlay">{游戏名称}</div>
</div>
```

> `data-href` 用绝对路径 `/Games/{slug}/` 与多数卡片一致；`src` 用相对路径 `assets/img/xxx.webp`。
> `data-cat` 分类 ID：`action`（动作·竞速）/ `puzzle`（益智·牌类）/ `scene`（3D 场景·氛围）/ `toy`（玩具·音乐）。

**计数同步（重要）**：游戏中心顶部分类 chips 与副标题带统计数字。添加后必须：
- 对应分类 chip 的 `<span class="cnt">` 数字 +1
- "全部" chip 计数 +1
- 副标题 `共 N 个游戏` +1
- 若上游是第三方作品，部署前先确认许可证允许转载（历史教训：mario_js 代码 MIT 但任天堂素材不可用）

### 4. 同步个人主页随机游戏池（同步点 2）

打开 `index.html`，找到 `const GAMES = [ ... ];` 数组，在数组末尾（最后一个 `]` 之前）追加一行：

```javascript
['{slug}/', '{游戏名称}', '{游戏描述}', '{图片文件}'],
```

**数组元素格式**：`[slug(带/), name, desc, img]`

**字段对应规则**：
- `slug` = 游戏目录名 **带末尾 `/`**，用于拼 `/Games/{slug}/`（如 `'snake/'`）
- `name` = 与游戏卡片 `game-overlay` 文本一致
- `desc` = 一句话游戏介绍，风格对齐现有条目（如「经典贪吃蛇的霓虹赛博风格重制」）
- `img` = 仅文件名（如 `snake.webp`），代码会自动拼 `/Games/assets/img/` 前缀

### 5. GEO 清单重生成（同步点 4-6）

同工具流程：仓库根目录运行 `node .claude/skills/add-tool-to-homepage/scripts/regen-geo.mjs`，核对 sitemap.xml 新增 `/Games/{slug}/`、llms.txt 游戏分区新增一行。

---

## 软件注册流程

向 `softwares/index.html` 软件下载中心添加新的 Windows 软件条目。

### 1. 收集软件信息

| 信息 | 说明 | 示例 |
|------|------|------|
| 软件名称 | 卡片标题 | `自动化任务工具` |
| 描述 | 一句话功能介绍（同时是 GEO 清单的描述来源） | `强大的自动化任务管理工具，智能执行各类任务` |
| 下载链接 | GitHub Releases exe 直链或网盘链接 | `https://github.com/JingW-ui/AutoTask-UI-/releases/download/...` |
| 版本号 | 按钮文案用；无版本则只写「立即下载」 | `v2.0.8` |
| 仓库链接 | 开源仓库主页，有则必填 | `https://github.com/JingW-ui/AutoTask-UI-` |
| 所属分类 | `image`（图像）/ `auto`（自动化）/ `ai`（AI·医学影像）/ `data`（数据·影视） | `auto` |
| QQ 群 | 加群短链 + 当前人数（手工维护，tooltip 标注更新月份） | 可选 |

### 2. 添加清单卡片（同步点 1）

在目标分类 `<section class="category-section" data-category="{cat}">` 的 `.software-grid` 末尾插入卡片。卡片是 `div` 容器（内含下载/仓库/QQ 多个链接，**绝不能用 `<a>` 包裹整卡**——链接嵌套不合法）：

```html
<div class="software-card" data-name="{名称}" data-desc="{描述}" title="{描述}">
    <div class="software-icon"><img src="{图标}" alt="{名称}"></div>
    <div class="software-main">
        <div class="sw-head">
            <h3 class="software-name">{名称}</h3>
        </div>
        <p class="software-desc">{描述}</p>
        <div class="sw-meta">
            <a class="repo-pill" href="{仓库链接}" target="_blank" rel="noopener noreferrer" title="开源仓库 {owner}/{repo}">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">{GitHub 图标 path}</svg>{repo 名}
                <img src="https://img.shields.io/github/stars/{owner}/{repo}.svg?style=flat-square&label=%E2%98%85&labelColor=ffffff&color=ffffff" alt="stars" loading="lazy" onerror="this.style.display='none'">
            </a>
        </div>
    </div>
    <a href="{下载链接}" download class="download-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        立即下载 {版本号}
    </a>
</div>
```

要点：
- 星数徽章按需添加；仓库星数较少时可先不放（参照 MediScreen-Brain 的做法），并在卡内留 HTML 注释说明恢复方式
- 有 QQ 群的卡在 `.sw-head` 里加 `<a class="qq-link" href="{加群短链}" target="_blank" rel="noopener noreferrer" title="QQ 交流群 · {N}+ 人（YYYY-MM）"><svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>QQ</title><path d="{Simple Icons QQ path}"/></svg>{N}+人</a>`；人数是手工数据，同步时记得更新 tooltip 月份
- 网盘下载改用外链图标 + `target="_blank" rel="noopener noreferrer"`
- GitHub 图标 / QQ path / 下载图标直接从现有卡片复制，保持全页一致

### 3. 推荐区（可选，同步点 2）

重点软件可同时加入顶部 `<div class="featured-grid">` 推荐区（保持 3 张以内）。推荐卡是 `<div class="featured-card" data-href="{下载链接}">`：

- 内部 `.featured-link`（**真实** `<a download>`，包住 icon/名称/版本——JS 失效时仍可下载）
- `.featured-pills` 里放 repo-pill 与 qq-link 独立链接（有则放）
- 整卡点击由页面 JS 补齐（点击卡内链接除外）

### 4. 统计与手工数据（同步点 3）

- 顶部 banner：`📦 共 11 款 Windows 软件` → N+1
- 所属分区 `section-count` +1
- QQ 群人数变化时手动更新 pill 文本与 tooltip 月份

### 5. GEO 清单重生成（同步点 4-6）

同工具流程：仓库根目录运行 `node .claude/skills/add-tool-to-homepage/scripts/regen-geo.mjs`，脚本会把新软件写入 sitemap.xml（hub lastmod 刷新）、llms.txt 与 llms-full.txt 的软件分区。

---

## 完成：提交并推送到远程仓库

所有同步点完成后，**必须立即提交并推送**到远程仓库。用户设置了 Gitee → GitHub 镜像，**只需推送到 Gitee（origin）即可**，不要推送到 github remote。

### 工具注册提交模板

```bash
git add index.html tools/index.html sitemap.xml llms.txt llms-full.txt

git commit -m "feat(tools): 将{工具名称}注册到工具箱主页和随机推荐池

- tools/index.html: 新增 {slug} 工具卡片（{分类名称}），统计数 {N-1}→{N}
- index.html: TOOLS 数组追加 {slug} 条目
- sitemap.xml/llms.txt/llms-full.txt: GEO 清单同步（regen-geo.mjs）

Co-Authored-By: Claude <noreply@anthropic.com>"

git push origin main
```

### 游戏注册提交模板

```bash
git add index.html Games/index.html sitemap.xml llms.txt llms-full.txt

git commit -m "feat(games): 将{游戏名称}注册到游戏中心主页和随机推荐池

- Games/index.html: 新增 {slug} 游戏卡片
- index.html: GAMES 数组追加 {slug} 条目
- sitemap.xml/llms.txt/llms-full.txt: GEO 清单同步（regen-geo.mjs）

Co-Authored-By: Claude <noreply@anthropic.com>"

git push origin main
```

### 软件注册提交模板

```bash
git add softwares/index.html sitemap.xml llms.txt llms-full.txt

git commit -m "feat(softwares): 将{软件名称}添加到软件下载中心

- softwares/index.html: 新增 {软件名称} 卡片（{分类名称}），总款数 {N-1}→{N}
- sitemap.xml/llms.txt/llms-full.txt: GEO 清单同步（regen-geo.mjs）

Co-Authored-By: Claude <noreply@anthropic.com>"

git push origin main
```

> **注意**：如果工作区还有其他未暂存的改动（如工具/游戏/软件自身的页面文件），也应一并 `git add` 加入本次提交，保持一次注册操作对应一个完整提交。

---

## 完整示例

### 示例 A：添加工具 `tools/world_clock/`，分类「时间类」

1. 读取 `tools/world_clock/index.html` 的 `<title>` → 名称「世界时钟墙」
2. 确认 `time` 分类已存在
3. 用默认 SVG 图标
4. **同步点 1**：在 `tools/index.html` 的 `time` 分区（`<section class="category-section" data-category="time">`）内、同类卡片后插入：
```html
<a href="/tools/world_clock/" class="tool-card" data-name="世界时钟墙" data-desc="多城市时区实时时钟，一眼掌握全球各地时间" title="多城市时区实时时钟，一眼掌握全球各地时间">
    <div class="tool-icon"><img src="data:image/svg+xml,..." alt="世界时钟墙"></div>
    <h3 class="tool-name">世界时钟墙</h3>
</a>
```
5. **同步点 2**：`time` 分区的 `section-count` +1，`📦 共创建 58 个实用工具` → `59 个`（数一遍实际卡片数核对）
6. **同步点 3**：在 `index.html` 的 `TOOLS` 数组末尾追加：
```javascript
['world_clock','世界时钟墙','多城市时区实时时钟，一眼掌握全球各地时间','time']
```
7. **提交推送**：`git add index.html tools/index.html && git commit -m "feat(tools): 将世界时钟墙注册到工具箱主页和随机推荐池" && git push origin main`

### 示例 B：添加游戏 `Games/piano/`

1. 读取 `Games/piano/index.html` 的 `<title>` → 名称「按键钢琴」
2. 确认缩略图 `Games/assets/img/piano.webp` 存在
3. **同步点 1**：在 `Games/index.html` 的 `games-container` 末尾追加：
```html
<div class="game-card" data-href="/Games/piano/">
    <img src="assets/img/piano.webp" alt="按键钢琴" class="game-image">
    <div class="game-overlay">按键钢琴</div>
</div>
```
4. **同步点 2**：在 `index.html` 的 `GAMES` 数组末尾追加：
```javascript
['piano/', '按键钢琴', '网页版按键钢琴，键盘弹奏美妙旋律', 'piano.webp']
```
5. **提交推送**：`git add index.html Games/index.html && git commit -m "feat(games): 将按键钢琴注册到游戏中心主页和随机推荐池" && git push origin main`

---

## 修改 / 删除已有条目

如需修改或删除现有工具/游戏/软件，**六处都要同步**：

- **修改**：分别改 `tools/index.html`、`Games/index.html` 或 `softwares/index.html` 的卡片、`index.html` 数组中对应行（软件无随机池条目）；工具/软件还要核对统计数字。
- **删除**：删除集合页卡片 → 删除 `index.html` 数组对应行（软件无）→ 更新统计数字（减 1）→ 用 `git rm` 删除工具/游戏目录 → **运行 regen-geo.mjs**（自动从 sitemap 与 llms 系列清理该条目，防止孤儿 URL）。
- 定位技巧：在 `index.html` 数组里搜索 `slug`（工具不带 `/`，游戏带 `/`）；在集合页搜索 `data-name=` 或 `data-href=`。

### 合并重复工具的判断原则

若发现功能重叠的工具（如两个文本对比工具），优先保留：
- **无外部 CDN 依赖**的（CDN 挂了就废）
- 功能更全、UI 更成熟的
- 历史更久的（已在主页长期存在）

删除冗余项并按上述「删除」流程三处同步。

---

## 注意事项

- 图标/缩略图优先使用 webp，工具放 `/tools/assets/logo/`，游戏放 `Games/assets/img/`
- 临时可用内联 SVG data URI，后续替换为正式图片
- `tools/index.html` 的 `data-name` 和 `data-desc` 用于搜索功能，**同时是 GEO 清单的描述来源**，确保准确
- 工具分类名称和 ID 要对应（如 `info` → `信息聚合`，`time` → `时间与日期`，见「现有分类」清单）
- 工具路径末尾要有 `/`（卡片 `href`）；但 `index.html` 的 `TOOLS` 数组里 slug **不带** `/`，`GAMES` 数组里 slug **带** `/`，注意区分
- 完成后简短列出各处改动，便于核对一致性
- `sitemap.xml` / `llms.txt` / `llms-full.txt` 由 `regen-geo.mjs` 生成，**不要手工编辑**（`robots.txt` 是手写文件，不归脚本管）
- **注册完成后必须立即 `git commit` + `git push origin main`**，只推 Gitee（origin），不推 GitHub（github remote，用户已设置 Gitee→GitHub 镜像自动同步）
