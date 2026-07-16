# 设计令牌参考

本系统的"配色盘"与布局/动画骨架。所有组件都引用这里的 CSS 变量，改一处即全局生效。

## 目录

- [CSS 变量系统](#css-变量系统)
- [色彩使用指南](#色彩使用指南)
- [字体系统](#字体系统)
- [字号层级](#字号层级)
- [布局系统](#布局系统)
- [响应式断点](#响应式断点)
- [动画系统](#动画系统)
- [背景装饰元素](#背景装饰元素)

---

## CSS 变量系统

整套设计建立在 CSS 自定义属性之上，换肤只需替换变量值。

```css
:root {
    /* 背景渐变 */
    --bg-gradient-1: #e7f1f0;  /* 浅青绿 */
    --bg-gradient-2: #dfe9ec;  /* 浅灰蓝 */
    --bg-gradient-3: #e6edf2;  /* 浅蓝灰 */

    /* 卡片样式 */
    --card-bg: rgba(255, 255, 255, 0.50);          /* 半透明白 */
    --card-bg-strong: rgba(255, 255, 255, 0.68);   /* 更不透明的白 */
    --card-border: rgba(255, 255, 255, 0.55);      /* 半透明白边框 */

    /* 文字层级 */
    --text-primary: #2c3e50;    /* 主文字 - 深蓝灰 */
    --text-secondary: #5a6c7d;  /* 次要文字 - 中蓝灰 */
    --text-muted: #8e9aaf;      /* 弱化文字 - 浅蓝灰 */

    /* 强调色 */
    --accent-teal: #2dd4bf;     /* 青绿 - 主要强调 */
    --accent-blue: #3b82f6;     /* 蓝色 - 链接/交互 */
    --accent-pink: #f472b6;     /* 粉色 - 特殊标记 */

    /* 阴影层级 */
    --shadow-sm: 0 2px 8px rgba(20,40,50,0.05);
    --shadow-md: 0 6px 24px rgba(20,40,50,0.08);
    --shadow-lg: 0 12px 40px rgba(20,40,50,0.12);

    /* 圆角尺寸 */
    --radius-sm: 14px;
    --radius-md: 20px;
    --radius-lg: 28px;

    /* 过渡动画 */
    --transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 色彩使用指南

- **背景**: 使用 135° 三色渐变 `linear-gradient(135deg, var(--bg-gradient-1) 0%, var(--bg-gradient-2) 50%, var(--bg-gradient-3) 100%)`
- **主文字**: 用于标题、重要内容
- **次要文字**: 用于正文、描述
- **弱化文字**: 用于辅助信息、时间戳、标签
- **青绿色**: 用于图标、标签、主要交互元素
- **蓝色**: 用于链接、数据高亮
- **粉色**: 用于特殊标记、通知

强调色克制使用——它们是点缀而非主色，铺满会破坏"清新通透"的整体观感。

## 字体系统

### 字体栈

```css
body {
    font-family: 'Noto Sans SC', -apple-system, BlinkMacSystemFont,
                 'Microsoft YaHei', sans-serif;
}
```

### 等宽字体

数据展示（统计数值、时钟）用等宽字体，避免数字跳动：

```css
.stat-value, .clock-display {
    font-family: 'Courier New', monospace;
}
```

## 字号层级

- **标题**: 24px (welcome-title), 18px (section-title)
- **正文**: 13.5px (about-text), 14px (recommend h4)
- **辅助**: 11.5px (label, tag), 11px (muted text)
- **数据**: 17px (stat-value), 44px (clock-display)

字号整体偏小（正文 ~13.5px），这是为了匹配主页紧凑的信息密度。若新页面信息更稀疏，可适当放大正文到 14~15px，但保持层级关系不变。

## 布局系统

### 三栏网格布局

```css
.main-container {
    max-width: 1380px;
    margin: 0 auto;
    padding: 56px 20px 12px;
    display: grid;
    grid-template-columns: 248px 1fr 312px;
    gap: 20px;
    position: relative;
    z-index: 1;
}
```

**尺寸说明**:
- 左栏（导航）: 248px
- 中栏（主内容）: 自适应
- 右栏（工具/信息）: 312px
- 间距: 20px
- 最大宽度: 1380px

`z-index: 1` 让容器浮在背景装饰（`z-index: 0`）之上。

## 响应式断点

两档断点：平板隐藏右栏退化为双栏，手机退化为单栏。

```css
/* 平板: 隐藏右栏 */
@media (max-width: 1200px) {
    .main-container {
        grid-template-columns: 232px 1fr;
    }
    .sidebar-right {
        display: none;
    }
}

/* 手机: 单栏布局 */
@media (max-width: 768px) {
    .main-container {
        grid-template-columns: 1fr;
        padding: 44px 16px 8px;
    }
    .sidebar-left {
        position: static;
    }
}
```

## 动画系统

### 基础过渡

所有交互过渡统一走这个缓动曲线，保证全站节奏一致：

```css
--transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
```

### 关键帧动画

```css
/* 浮动动画：背景光斑缓慢漂移 */
@keyframes float {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    33% { transform: translate(30px, -30px) rotate(120deg); }
    66% { transform: translate(-20px, 20px) rotate(240deg); }
}

/* 脉动动画：光斑呼吸 + 徽章图标闪烁 */
@keyframes pulse {
    0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
    50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.45; }
}

/* 闪烁动画（时钟分隔符） */
@keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
}
```

注意 `pulse` 的 `translate(-50%, -50%)` 是为居中定位的背景光斑准备的；若用于非居中元素（如徽章图标），应去掉该 translate，否则会被推偏。

## 背景装饰元素

三团高斯模糊的彩色光斑，固定在视口、不响应点击，是营造"通透"氛围的关键。它们 `z-index: 0`，被 `main-container`（`z-index: 1`）盖在底下。

```css
.bg-decoration {
    position: fixed;
    border-radius: 50%;
    filter: blur(90px);
    opacity: 0.45;
    pointer-events: none;
    z-index: 0;
}

.bg-decoration-1 {
    width: 560px;
    height: 560px;
    background: radial-gradient(circle, rgba(94,234,212,0.30) 0%, transparent 70%);
    top: -180px;
    left: -120px;
    animation: float 22s ease-in-out infinite;
}

.bg-decoration-2 {
    width: 480px;
    height: 480px;
    background: radial-gradient(circle, rgba(125,211,252,0.28) 0%, transparent 70%);
    bottom: -140px;
    right: -120px;
    animation: float 26s ease-in-out infinite reverse;
}

.bg-decoration-3 {
    width: 380px;
    height: 380px;
    background: radial-gradient(circle, rgba(45,212,191,0.18) 0%, transparent 70%);
    top: 48%;
    left: 52%;
    transform: translate(-50%, -50%);
    animation: pulse 16s ease-in-out infinite;
}
```

三团光斑用不同尺寸、不同颜色（青绿/天蓝/青）、不同动画时长（22s/26s/16s）错开，避免节奏雷同显得机械。`reverse` 让第二团反向漂移，增加自然感。
