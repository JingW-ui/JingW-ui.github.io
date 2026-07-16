---
name: glassmorphism-design-system
description: JingW-ui 项目提炼的玻璃态（Glassmorphism）Web 设计系统，提供完整的 CSS 变量、玻璃卡片、3D Hover、三栏布局、字体、动画、时间线/导航/统计/徽章等组件规范。当用户要为这个仓库新建或改造网页、个人主页、作品集、仪表盘、工具集合页、落地页，或要求"玻璃态/毛玻璃/glassmorphism 风格"、"半透明卡片"、"和主页 index.html 一致的风格"、"清新渐变背景 + 模糊质感"时使用此技能。即使用户没有明确说"用设计系统"，只要涉及本仓库内 HTML/CSS 页面的视觉设计、想要与现有主页保持统一风格、或新建需要精致动效的页面，都应该先查阅此技能以保证视觉一致性。
---

# JingW-ui 玻璃态设计系统

本仓库主页 `index.html` 沿用的视觉语言：清新三色渐变背景、半透明毛玻璃卡片、柔和阴影、流畅 3D Hover 动效。这套系统让仓库内不同页面（主页、简历、工具箱、游戏等）看起来像同一个产品。

## 什么时候用这个技能

判断要点：**只要是在本仓库里写或改 HTML/CSS，且希望它"看起来跟主页一样"**，就该先读这里。常见触发场景：

- 新建一个页面，希望和 `index.html` 风格统一
- 给现有页面套上玻璃态卡片 / 渐变背景 / 3D hover
- 调色、改圆角、调模糊度等视觉微调
- 复用现成的导航、时间线、统计数字、状态徽章等组件

如果任务只是改文案、改逻辑、改数据，不涉及视觉，则不需要。

## 设计原则

理解这几条原则比死记 CSS 更重要——它们决定了为什么这些数值是这样设的：

1. **轻量通透**：半透明背景 + `backdrop-filter` 模糊，营造"漂浮在渐变之上"的轻盈感。卡片不是实心色块，而是让背景的色彩透出来。
2. **层次靠透明度而非边框**：通过卡片透明度、阴影深浅、模糊强度三档（`shadow-sm/md/lg`、`card-bg` vs `card-bg-strong`）建立视觉层级，而不是用粗边框切割画面。
3. **柔和交互**：所有可交互元素都有过渡动画，hover 时轻微上浮 + 倾斜 + 放大，让人感觉页面"活着"。过渡统一用 `cubic-bezier(0.4, 0, 0.2, 1)`。
4. **色彩克制**：蓝灰为主调，青绿 `--accent-teal` 作主要强调点缀，蓝/粉只在链接和特殊标记时出现。不要把强调色铺满整屏。
5. **细节打磨**：圆角 14/20/28px 三档、阴影偏移与模糊精心配比、动画时长 0.28~0.35s——这些"不明显但舒服"的数值是质感的来源。

## 快速开始

搭一个符合本系统的页面，四步：

### 1. 引入依赖

```html
<!-- Font Awesome 图标 -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<!-- Noto Sans SC 字体 -->
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700&display=swap" rel="stylesheet">
```

### 2. 复制设计令牌

把 [`references/tokens.md`](references/tokens.md) 里的 `:root` CSS 变量整段复制进样式表。这是整个系统的"配色盘"——后续所有组件都引用这些变量，改一处即全局生效。

### 3. 摆出背景 + 容器骨架

```html
<body>
    <!-- 背景装饰：三团模糊光斑，营造氛围 -->
    <div class="bg-decoration bg-decoration-1"></div>
    <div class="bg-decoration bg-decoration-2"></div>
    <div class="bg-decoration bg-decoration-3"></div>

    <div class="main-container">
        <aside class="sidebar-left"><div class="glass-card"><!-- 导航 --></div></aside>
        <main class="content-area">
            <div class="glass-card welcome-card"><!-- 欢迎区 --></div>
            <div class="glass-card section-card"><!-- 内容 --></div>
        </main>
        <aside class="sidebar-right"><div class="glass-card"><!-- 小部件 --></div></aside>
    </div>
</body>
```

背景装饰的具体数值、三栏栅格与响应式断点见 [`references/tokens.md`](references/tokens.md) 的「布局系统」「动画系统」两节。

### 4. 套组件

给元素加 `.glass-card` 类即获得玻璃态外观与 3D Hover。需要导航、时间线、统计数字、状态徽章、联系按钮等现成组件时，查阅 [`references/components.md`](references/components.md)。

## 参考文件索引

内容较多，按需读取，避免一次性加载：

- **[`references/tokens.md`](references/tokens.md)** —— 设计令牌：`:root` CSS 变量（配色/阴影/圆角/过渡）、字体系统、字号层级、布局栅格与响应式断点、动画 keyframes 与背景装饰光斑。**改配色、调模糊、改布局时读这里。**
- **[`references/components.md`](references/components.md)** —— 组件库：`.glass-card` 玻璃卡片与 3D Hover、导航项、推荐卡片、时间线、联系按钮（含品牌色）、数据统计、标签、状态徽章、滚动条样式，以及自定义建议、性能优化与浏览器兼容降级方案。**复用现成组件、加新卡片时读这里。**

## 自定义与降级

主色调、模糊强度、圆角大小都可改 `:root` 变量快速换肤；对不支持 `backdrop-filter` 的浏览器有 `@supports` 降级方案。完整说明见 [`references/components.md`](references/components.md) 末尾两节。

性能要点：`backdrop-filter` 在低端移动设备上开销较大，小屏可降低模糊强度；动画优先用 `transform`/`opacity` 避免重排；字体用 `font-display: swap` 防 FOIT。

---

完整落地示例参考仓库根目录 `index.html`。

**版本**: 1.0 · **最后更新**: 2026-06-19 · **作者**: WangJing
