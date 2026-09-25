---
name: add-tool-to-homepage
description: 将新的工具或游戏注册到对应主页（tools/index.html 或 Games/index.html），并同步更新个人主页 index.html 的随机推荐池。当用户创建了新工具页面、新游戏页面、想把子项目添加到主页、需要注册新条目到工具箱或游戏中心索引时触发。适用于：添加新工具卡片、添加新游戏卡片、为新工具/游戏创建索引入口、更新分类、把新做的页面纳入索引等场景。即使用户没有明确说"添加到主页"，只要涉及到把新做的工具或游戏页面挂到对应集合页，都应该使用此技能。
---

# 添加工具 / 游戏到主页

将新的工具子项目注册到 `tools/index.html` 工具箱主页，或新的游戏注册到 `Games/index.html` 游戏中心主页，**并同步更新个人主页 `index.html` 的随机推荐池**。

## 核心原则：三处同步 + 自动推送

仓库中有三处维护「工具/游戏清单」，添加任何新条目时**必须全部同步**，否则个人主页的随机推荐位会出现死链或漏推：

1. **集合页索引卡片** —— `tools/index.html`（工具）或 `Games/index.html`（游戏）
2. **统计数字** —— `tools/index.html` 顶部的 `📦 共创见 N 个实用工具`（仅工具需要改，游戏页无计数）
3. **个人主页随机池** —— `index.html` 中的 `TOOLS` 数组（工具）或 `GAMES` 数组（游戏）

**每次添加操作都必须同时更新这三处，缺一不可。完成后必须立即提交并推送到远程仓库。**

## 判断类型

- 工具页面位于 `tools/` 下 → 走【工具流程】
- 游戏页面位于 `Games/` 下 → 走【游戏流程】

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

读取 `tools/index.html` 中的 `<div class="category-tabs">`，确认分类标签是否存在。

**现有分类**：
- `image` - 图片类
- `text` - 字符类
- `time` - 时间类
- `calc` - 计算进制类
- `info` - 信息类
- `other` - 其他实用工具

**如果需要新分类**：在 `</div>` 前插入新标签：
```html
<div class="category-tab" data-category="新分类ID">新分类名称</div>
```

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

在 `tools/index.html` 的 `<div class="tools-grid">` 内，按分类找到合适位置，插入卡片：

```html
<!-- {工具名称} -->
<a href="/tools/{slug}/" class="tool-card" data-category="{分类ID}" data-name="{工具名称}" data-desc="{工具描述}">
    <span class="tool-label">{分类名称}</span>
    <div class="tool-card-header">
        <div class="tool-icon"><img src="{图标URL}" alt="{工具名称}"></div>
        <div class="tool-content">
            <h3 class="tool-name">{工具名称}</h3>
            <p class="tool-description">{工具描述}</p>
        </div>
    </div>
</a>
```

> 注意：`tools/index.html` 卡片的 `tool-label` 是 `<span>` 且置于 `tool-card-header` 之前，与早期文档示例不同，以现有文件实际结构为准。

**插入位置**：同类卡片之后，保持分类内工具的逻辑顺序。

### 5. 更新统计数字（同步点 2，仅工具）

更新 `tools/index.html` 顶部 `stats-banner` 中的计数：

```html
<div class="stats-banner">
    📦 共创见 {N} 个实用工具
</div>
```

`N` = `tools/index.html` 中 `.tool-card` 的实际总数。**统计数与实际卡片数必须一致**，添加后数一遍核对。

### 6. 同步个人主页随机工具池（同步点 3）

打开 `index.html`，找到 `const TOOLS = [ ... ];` 数组，在数组末尾（最后一个 `]` 之前）追加一行：

```javascript
['{slug}','{工具名称}','{工具描述}','{分类ID}'],
```

**数组元素格式**：`[slug, name, desc, category]`，分类 ID 取值与工具箱主页一致（`text` / `image` / `time` / `calc` / `other` / `info`）。

**字段对应规则**：
- `slug` = 工具目录名（不带末尾 `/`），用于拼 `/tools/{slug}/`
- `name` / `desc` = 与工具箱卡片一致（可适当精简描述以适应推荐位）
- `category` = 工具箱卡片的 `data-category`

`ICONS` 和 `TAGS` 映射表已覆盖全部现有分类，无需改动；若新增了全新分类 ID，需同步在 `ICONS` 和 `TAGS` 对象里补一条。

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

在 `Games/index.html` 的 `<div class="games-container">` 内末尾追加卡片：

```html
<div class="game-card" data-href="/Games/{slug}/">
    <img src="assets/img/{图片文件}" alt="{游戏名称}" class="game-image">
    <div class="game-overlay">{游戏名称}</div>
</div>
```

> `data-href` 用绝对路径 `/Games/{slug}/` 与多数卡片一致；`src` 用相对路径 `assets/img/xxx.webp`。

**统计数字**：游戏主页为响应式网格、**无计数条**，无需改数字。

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

---

## 完成：提交并推送到远程仓库

所有同步点完成后，**必须立即提交并推送**到远程仓库。用户设置了 Gitee → GitHub 镜像，**只需推送到 Gitee（origin）即可**，不要推送到 github remote。

### 工具注册提交模板

```bash
git add index.html tools/index.html

git commit -m "feat(tools): 将{工具名称}注册到工具箱主页和随机推荐池

- tools/index.html: 新增 {slug} 工具卡片（{分类名称}），统计数 {N-1}→{N}
- index.html: TOOLS 数组追加 {slug} 条目

Co-Authored-By: Claude <noreply@anthropic.com>"

git push origin main
```

### 游戏注册提交模板

```bash
git add index.html Games/index.html

git commit -m "feat(games): 将{游戏名称}注册到游戏中心主页和随机推荐池

- Games/index.html: 新增 {slug} 游戏卡片
- index.html: GAMES 数组追加 {slug} 条目

Co-Authored-By: Claude <noreply@anthropic.com>"

git push origin main
```

> **注意**：如果工作区还有其他未暂存的改动（如工具/游戏自身的页面文件），也应一并 `git add` 加入本次提交，保持一次注册操作对应一个完整提交。

---

## 完整示例

### 示例 A：添加工具 `tools/world_clock/`，分类「时间类」

1. 读取 `tools/world_clock/index.html` 的 `<title>` → 名称「世界时钟墙」
2. 确认 `time` 分类已存在
3. 用默认 SVG 图标
4. **同步点 1**：在 `tools/index.html` 同类卡片后插入：
```html
<!-- 世界时钟墙 -->
<a href="/tools/world_clock/" class="tool-card" data-category="time" data-name="世界时钟墙" data-desc="多城市时区实时时钟，一眼掌握全球各地时间">
    <span class="tool-label">时间类</span>
    <div class="tool-card-header">
        <div class="tool-icon"><img src="data:image/svg+xml,..." alt="世界时钟墙"></div>
        <div class="tool-content">
            <h3 class="tool-name">世界时钟墙</h3>
            <p class="tool-description">多城市时区实时时钟，一眼掌握全球各地时间</p>
        </div>
    </div>
</a>
```
5. **同步点 2**：`📦 共创见 58 个实用工具` → `59 个`（数一遍实际卡片数核对）
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

如需修改或删除现有工具/游戏，**三处都要同步**：

- **修改**：分别改 `tools/index.html` 或 `Games/index.html` 的卡片、`index.html` 数组中对应行；工具还要核对统计数字。
- **删除**：删除集合页卡片 → 删除 `index.html` 数组对应行 → 工具需更新统计数字（减 1）→ 用 `git rm` 删除工具/游戏目录。
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
- `tools/index.html` 的 `data-name` 和 `data-desc` 用于搜索功能，确保准确
- 工具分类名称和 ID 要对应（如 `info` → `信息`，`time` → `时间类`）
- 工具路径末尾要有 `/`（卡片 `href`）；但 `index.html` 的 `TOOLS` 数组里 slug **不带** `/`，`GAMES` 数组里 slug **带** `/`，注意区分
- 完成后简短列出三处改动，便于核对一致性
- **注册完成后必须立即 `git commit` + `git push origin main`**，只推 Gitee（origin），不推 GitHub（github remote，用户已设置 Gitee→GitHub 镜像自动同步）
