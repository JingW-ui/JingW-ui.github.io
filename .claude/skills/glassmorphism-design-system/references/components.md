# 组件库参考

基于设计令牌（见 [`tokens.md`](tokens.md)）的现成组件。复制即用，hover/过渡已内置。

## 目录

- [玻璃卡片 glass-card](#玻璃卡片-glass-card)
- [3D Hover 效果](#3d-hover-效果)
- [导航项](#导航项)
- [推荐卡片](#推荐卡片)
- [时间线](#时间线)
- [联系按钮](#联系按钮)
- [数据统计](#数据统计)
- [标签](#标签)
- [状态徽章](#状态徽章)
- [滚动条样式](#滚动条样式)
- [自定义建议](#自定义建议)
- [性能优化建议](#性能优化建议)
- [浏览器兼容性](#浏览器兼容性)

---

## 玻璃卡片 glass-card

整个系统的核心容器。半透明背景 + 高斯模糊 + 半透明边框，让背景色彩透过来形成"玻璃"质感。

```css
.glass-card {
    background: var(--card-bg);
    backdrop-filter: blur(24px) saturate(140%);
    -webkit-backdrop-filter: blur(24px) saturate(140%);
    border: 1px solid var(--card-border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
    transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1),
                box-shadow 0.35s ease,
                backdrop-filter 0.35s ease;
    overflow: hidden;
}
```

要点：
- `blur(24px) saturate(140%)`：模糊让背后渐变变柔和，提饱和让色彩更鲜活——两者搭配才有"通透又鲜艳"的效果，缺一不可。
- 边框用 `rgba(255,255,255,0.55)` 而非实色，模拟玻璃边缘的高光。
- `overflow: hidden` 确保卡片内容不破坏圆角。
- 同时写 `-webkit-` 前缀，Safari 需要。

## 3D Hover 效果

卡片 hover 时的招牌动效：轻微倾斜 + 上浮 + 放大 + 增强模糊，配合内阴影形成边缘光晕。

```css
.glass-card:hover {
    box-shadow: 0 16px 48px rgba(20,40,50,0.16),
                0 0 0 1px rgba(255,255,255,0.5) inset;
    transform: perspective(800px) rotateX(2deg) rotateY(-2deg)
               translateY(-4px) scale(1.015);
    backdrop-filter: blur(32px) saturate(180%) brightness(1.05);
    -webkit-backdrop-filter: blur(32px) saturate(180%) brightness(1.05);
}
```

效果拆解：
- `perspective(800px)`: 创建 3D 透视空间
- `rotateX(2deg) rotateY(-2deg)`: 轻微倾斜，产生立体感
- `translateY(-4px)`: 上浮效果
- `scale(1.015)`: 轻微放大
- 内阴影 `inset`: 增加玻璃边缘光晕
- 增强的 `backdrop-filter`: hover 时更模糊、更饱和、更亮

倾斜角度刻意很小（2deg），过大显得轻浮；放大仅 1.5%，几乎察觉不到却让卡片"活"起来。这些数值是反复调试的结果，改动时小心。

## 导航项

左栏导航条目，hover 时背景变亮 + 轻微放大 + 图标转青绿。

```css
.nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 9px 14px;
    border-radius: var(--radius-sm);
    color: var(--text-secondary);
    text-decoration: none;
    font-size: 13.5px;
    font-weight: 500;
    transition: var(--transition);
    margin-bottom: 1px;
}

.nav-item:hover {
    background: rgba(255,255,255,0.6);
    color: var(--text-primary);
    transform: scale(1.02);
}

.nav-item i {
    width: 18px;
    text-align: center;
    opacity: 0.7;
    font-size: 14px;
}

.nav-item:hover i {
    opacity: 1;
    color: var(--accent-teal);
}
```

图标默认 `opacity: 0.7` 弱化，hover 时提亮并转青绿——这是"色彩克制"原则的体现：常态不抢眼，交互时才点睛。

## 推荐卡片

中栏的推荐内容条目，左图标 + 右标题描述 + 底部标签。

```css
.recommend-item {
    display: flex;
    gap: 14px;
    padding: 13px;
    border-radius: var(--radius-sm);
    background: var(--card-bg);
    text-decoration: none;
    transition: var(--transition);
    align-items: flex-start;
}

.recommend-item:hover {
    background: rgba(255,255,255,0.78);
    transform: scale(1.02);
}

.recommend-icon {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    background: linear-gradient(135deg, #d9efef, #c4e3e8);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 21px;
    flex-shrink: 0;
}

.recommend-tag {
    display: inline-block;
    font-size: 11px;
    color: var(--accent-teal);
    background: rgba(45,212,191,0.12);
    padding: 2px 10px;
    border-radius: 10px;
    margin-top: 7px;
}
```

## 时间线

经历/履历展示，左侧渐变竖线 + 节点圆点。

```css
.timeline {
    position: relative;
    padding-left: 22px;
}

.timeline::before {
    content: '';
    position: absolute;
    left: 5px;
    top: 4px;
    bottom: 4px;
    width: 2px;
    background: linear-gradient(to bottom, var(--accent-teal), #7dd3fc, transparent);
}

.timeline-item {
    position: relative;
    margin-bottom: 16px;
}

.timeline-item::before {
    content: '';
    position: absolute;
    left: -22px;
    top: 5px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--accent-teal);
    border: 2px solid #fff;
    box-shadow: 0 0 0 2px rgba(45,212,191,0.3);
}

.timeline-year {
    font-size: 11.5px;
    color: var(--accent-teal);
    font-weight: 600;
    margin-bottom: 3px;
}

.timeline-title {
    font-size: 13.5px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 3px;
}

.timeline-desc {
    font-size: 12px;
    color: var(--text-muted);
    line-height: 1.6;
}
```

竖线用青绿→天蓝→透明的渐变收尾，避免底部硬切断点；节点圆点带白色描边和青绿外发光，与竖线颜色呼应。

## 联系按钮

社交联系图标按钮，每个平台保留各自品牌色（仅在图标上）。

```css
.contact-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 38px;
    border-radius: 10px;
    background: rgba(255,255,255,0.5);
    text-decoration: none;
    transition: var(--transition);
    border: 1px solid var(--card-border);
}

.contact-btn:hover {
    transform: scale(1.1);
    box-shadow: var(--shadow-sm);
}

/* 品牌色：仅作用于图标，按钮底色保持玻璃态统一 */
.contact-btn i.c-email { color: #DB4437; }
.contact-btn i.c-github { color: #1a1a2e; }
.contact-btn i.c-bili { color: #fb7299; }
.contact-btn i.c-douyin { color: #111; }
.contact-btn i.c-wechat { color: #07c160; }
.contact-btn i.c-rss { color: var(--accent-blue); }
```

品牌色只染图标不染按钮——这是平衡"平台辨识度"与"全局风格统一"的折中。

## 数据统计

欢迎区的数字统计块，数值用蓝→青渐变文字。

```css
.welcome-stat {
    text-align: center;
    padding: 5px 10px;
    border-radius: 10px;
    background: rgba(255,255,255,0.5);
    transition: var(--transition);
    min-width: 78px;
}

.welcome-stat:hover {
    transform: scale(1.04);
    background: rgba(255,255,255,0.72);
}

.welcome-stat .stat-value {
    font-family: 'Courier New', monospace;
    font-size: 17px;
    font-weight: 800;
    background: linear-gradient(135deg, #3b82f6, #2dd4bf);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    line-height: 1.2;
}

.welcome-stat .stat-label {
    font-size: 9.5px;
    color: var(--text-muted);
    margin-top: 1px;
}
```

渐变文字用 `background-clip: text` + `text-fill-color: transparent` 实现，需带 `-webkit-` 前缀。等宽字体保证数字位数变化时不抖动。

## 标签

轻量标签，无背景填充，仅靠极淡阴影浮起。

```css
.hero-tag {
    font-size: 11.5px;
    padding: 5px 12px;
    border-radius: 16px;
    background: transparent;
    color: var(--text-primary);
    border: none;
    font-weight: 600;
    box-shadow: 0 1px 3px rgba(20,40,50,0.05);
}
```

## 状态徽章

带脉动图标的渐变背景徽章，用于"开发中/在线"等状态提示。

```css
.dev-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 10px;
    border-radius: 12px;
    background: linear-gradient(135deg, rgba(45,212,191,0.15), rgba(59,130,246,0.15));
    font-size: 11px;
    font-weight: 600;
    color: var(--accent-teal);
    white-space: nowrap;
}

.dev-badge i {
    animation: pulse 1.5s ease-in-out infinite;
    font-size: 12px;
}
```

⚠️ 徽章图标复用了 `pulse` 关键帧，但 `pulse` 含 `translate(-50%, -50%)`（为居中光斑设计）。此处图标非绝对居中定位，会被该 translate 推偏。若发现图标位置异常，为徽章单独定义一个不含 translate 的脉动关键帧（如 `pulse-icon`）再引用。

## 滚动条样式

细窄半透明滚动条，与整体通透风格一致。

```css
::-webkit-scrollbar {
    width: 6px;
}

::-webkit-scrollbar-track {
    background: transparent;
}

::-webkit-scrollbar-thumb {
    background: rgba(20,40,50,0.12);
    border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
    background: rgba(20,40,50,0.22);
}
```

## 自定义建议

### 修改主色调

换肤最简单的方式——改 `:root` 变量即可全局生效：

```css
:root {
    --accent-teal: #your-color;       /* 主强调色 */
    --bg-gradient-1: #your-light-color;
    --bg-gradient-2: #your-medium-color;
    --bg-gradient-3: #your-dark-color;
}
```

### 调整模糊强度

模糊越强越通透，但性能开销也越大。移动端建议下调：

```css
.glass-card {
    backdrop-filter: blur(30px) saturate(150%);
}
```

### 修改圆角大小

圆角越大越柔和，越小越方正。三档保持比例关系：

```css
:root {
    --radius-sm: 10px;  /* 更方正 */
    --radius-md: 16px;
    --radius-lg: 24px;
}
```

## 性能优化建议

1. **`backdrop-filter` 性能**: 移动设备开销大，小屏降低模糊强度或减少使用卡片数量。
2. **动画优化**: 优先用 `transform` 和 `opacity`（GPU 加速、不触发重排），避免动画 `width`/`height`/`top`。
3. **图片优化**: 用 `object-fit: cover` 确保图片正确裁剪填满容器。
4. **字体加载**: `font-display: swap` 避免 FOIT（字体加载期间文字不可见）。

## 浏览器兼容性

- ✅ Chrome 76+
- ✅ Firefox 103+
- ✅ Safari 9+
- ✅ Edge 79+

不支持 `backdrop-filter` 的浏览器，用 `@supports` 提供更不透明背景的降级方案，保证可读性：

```css
.glass-card {
    background: rgba(255, 255, 255, 0.85); /* 降级：更不透明的背景 */
}

@supports (backdrop-filter: blur(24px)) {
    .glass-card {
        background: var(--card-bg);
        backdrop-filter: blur(24px) saturate(140%);
    }
}
```

降级思路：模糊不可用时，提高背景不透明度补偿——否则半透明背景叠在彩色渐变上文字会糊成一团。
