# UI 设计系统参考

从 60s-web 的 `styles.css`（4560 行）中提炼的设计规范。

## 目录

- [CSS 变量系统](#css-变量系统)
- [色彩方案](#色彩方案)
- [排版系统](#排版系统)
- [间距与布局](#间距与布局)
- [卡片组件](#卡片组件)
- [导航组件](#导航组件)
- [搜索框](#搜索框)
- [按钮系统](#按钮系统)
- [表单元素](#表单元素)
- [动效规范](#动效规范)
- [天气图标艺术](#天气图标艺术)
- [响应式断点](#响应式断点)
- [外壳主题变体](#外壳主题变体)
- [壁纸系统](#壁纸系统)
- [滚动条定制](#滚动条定制)

---

## CSS 变量系统

整个设计系统建立在 CSS 自定义属性之上，切换主题只需替换变量值。

```css
/* 浅色主题 */
:root {
  --accent: #0f9b8e;           /* 薄荷绿主色 */
  --accent-dark: #087b72;      /* 主色深色变体 */
  --app-bg: #f6f8f8;           /* 应用背景 */
  --text: #1f2937;             /* 正文文字 */
  --heading: #111827;          /* 标题文字 */
  --line: #e3e8eb;             /* 边框线 */
  --muted: #7c8796;            /* 辅助文字 */
  --surface: rgba(255,255,255,0.92);      /* 卡片表面 */
  --surface-strong: #fff;                 /* 实色表面 */
  --surface-soft: #f7f9fb;               /* 柔和表面 */
  --surface-tint: #f8fbfd;               /* 微调色表面 */
  --input-bg: #fff;                       /* 输入框背景 */
  --nav-bg: rgba(255,255,255,0.92);       /* 导航背景 */
  --shadow: 0 10px 30px rgba(31,41,55,0.08);        /* 大阴影 */
  --soft-shadow: 0 5px 18px rgba(31,41,55,0.06);    /* 柔和阴影 */
  --scrollbar-track: rgba(15,23,42,0.05);
  --scrollbar-thumb: rgba(15,155,142,0.4);
  --scrollbar-thumb-hover: rgba(8,123,114,0.68);
  --mobile-nav-height: 0px;
  --shell-width: 1536px;       /* 最大内容宽度 */
  --page-gutter: 56px;         /* 页面边距 */
  color-scheme: light;
}

/* 深色主题 */
.theme-dark {
  --accent: #37d8c5;
  --accent-dark: #78efe0;
  --app-bg: #07100f;
  --text: #d8e5e3;
  --heading: #f4fbfa;
  --line: rgba(153,185,179,0.18);
  --muted: #90a7a3;
  --surface: rgba(14,29,27,0.82);
  --surface-strong: #10201e;
  --surface-soft: #142421;
  --surface-tint: #172a27;
  --input-bg: #0d1b19;
  --nav-bg: rgba(12,25,23,0.86);
  --shadow: 0 18px 46px rgba(0,0,0,0.36);
  --soft-shadow: 0 10px 28px rgba(0,0,0,0.25);
  --scrollbar-track: rgba(255,255,255,0.06);
  --scrollbar-thumb: rgba(55,216,197,0.44);
  --scrollbar-thumb-hover: rgba(120,239,224,0.72);
  color-scheme: dark;
}
```

---

## 色彩方案

| 用途 | 浅色 | 深色 |
|------|------|------|
| 主色 | `#0f9b8e` | `#37d8c5` |
| 主色深 | `#087b72` | `#78efe0` |
| 背景 | `#f6f8f8` | `#07100f` |
| 卡片 | `rgba(255,255,255,0.92)` | `rgba(14,29,27,0.82)` |
| 标题 | `#111827` | `#f4fbfa` |
| 正文 | `#1f2937` | `#d8e5e3` |
| 辅助 | `#7c8796` | `#90a7a3` |
| 错误 | `#c94c4c` | `#ef8a8a` |
| 警告 | `#b45309`（背景 `#fff7ed`） | 同 |
| 成功 | 主色 | 主色 |

**设计原则：**
- 深色主题不是简单反转，而是偏绿灰色调（`#07100f`），避免纯黑
- 表面使用半透明 rgba + `backdrop-filter: blur(16px)` 实现毛玻璃
- 边框使用低透明度颜色，不要硬边

---

## 排版系统

```css
font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
  "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;

font-synthesis: none;
text-rendering: optimizeLegibility;
-webkit-font-smoothing: antialiased;
```

**字号梯度：**

| 用途 | 大小 | 字重 |
|------|------|------|
| 品牌名 | 22px | 800 |
| 页面标题 | 26px | 800 |
| 卡片标题 | 14px | 800 |
| 正文 | 14px | 700 |
| 辅助文字 | 12px | 700 |
| 迷你标签 | 11px | 700 |

**特点：** 全文使用粗体（700-800），营造力量感。中文优先使用 PingFang SC / Microsoft YaHei。

---

## 间距与布局

```css
/* 最大内容宽度 + 居中 */
main {
  width: min(var(--shell-width), calc(100% - var(--page-gutter)));
  margin: 0 auto;
  /* 1536px 最大宽度，两侧留 56px 边距 */
}

/* 首页双栏布局 */
.home-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.18fr) minmax(0, 1fr);
  gap: 18px;
}

/* 卡片内边距 */
.card { padding: 0; }  /* 卡片无外边距，内部用 grid gap */
.card-title { padding: 18px 18px 12px; }

/* 通用间距单位 */
gap: 8px;   /* 紧凑 */
gap: 12px;  /* 标准 */
gap: 18px;  /* 宽松 */
```

---

## 卡片组件

```css
.card {
  position: relative;
  min-width: 0;
  display: grid;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--surface);
  box-shadow: var(--soft-shadow);
  overflow: hidden;
}

/* 卡片标题行 */
.card-title {
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 18px 12px;
}

.card-title span {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--heading);
}

.card-title b {
  font-size: 14px;
  font-weight: 800;
}

/* 状态指示器 */
.status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  border-radius: 999px;
  background: var(--surface-soft);
  color: var(--muted);
  font-size: 11px;
  font-weight: 800;
}

.status.loading { background: rgba(15,155,142,0.08); color: var(--accent-dark); }
.status.error { background: rgba(201,76,76,0.08); color: #c94c4c; }
```

---

## 导航组件

```css
/* 顶部导航栏 */
.topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  height: 60px;
  display: grid;
  grid-template-columns: minmax(220px, 260px) minmax(420px, 1fr) minmax(88px, 128px);
  align-items: center;
  gap: 18px;
  padding: 0 max(32px, calc((100vw - var(--shell-width)) / 2 + 32px));
  border-bottom: 1px solid var(--line);
  background: var(--nav-bg);
  backdrop-filter: blur(16px);  /* 毛玻璃 */
}

/* 导航按钮 */
.topbar nav button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 100%;
  padding: 0 4px;
  border: 0;
  border-bottom: 4px solid transparent;  /* 下划线指示器 */
  background: transparent;
  color: #252b35;
  font-weight: 700;
}

.topbar nav button.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

/* 移动端底部导航 */
.mobile-nav-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 30;
  height: 64px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-top: 1px solid var(--line);
  background: var(--nav-bg);
  backdrop-filter: blur(16px);
  padding-bottom: env(safe-area-inset-bottom);
}
```

---

## 搜索框

```css
.search-box {
  width: min(820px, 100%);
  height: 68px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr) 110px;
  align-items: center;
  gap: 14px;
  padding: 8px 12px 8px 24px;
  border: 1px solid var(--line);
  border-radius: 16px;     /* 大圆角 */
  background: #fff;
  box-shadow: var(--shadow);
}

.search-box input {
  min-width: 0;
  border: 0;
  outline: 0;
  color: #1f2937;
  font-size: 16px;
}

.search-box button {
  height: 48px;
  border: 0;
  border-radius: 12px;
  background: var(--accent);
  color: #fff;
  font-weight: 800;
  font-size: 15px;
}
```

---

## 按钮系统

```css
/* 主按钮 */
button, .primary-button {
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 0 18px;
  border: 0;
  border-radius: 8px;
  background: var(--accent);
  color: #fff;
  font-weight: 800;
  transition: all 0.2s ease;
}

/* 轮廓按钮 */
.outline-button {
  border: 1px solid var(--line);
  background: var(--surface-strong);
  color: var(--heading);
}

/* 柔和主色按钮 */
.primary-subtle {
  background: rgba(15,155,142,0.1);
  color: var(--accent-dark);
}

/* 图标按钮（圆形） */
.theme-toggle, .settings-shortcut {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: 50%;
  background: var(--surface-strong);
  color: var(--accent-dark);
  box-shadow: var(--soft-shadow);
}
```

---

## 表单元素

```css
/* 输入框 */
input, select, textarea {
  height: 40px;
  padding: 0 11px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--input-bg);
  color: var(--heading);
  outline-color: var(--accent);  /* 聚焦时轮廓用主色 */
}

/* 开关 */
.switch-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.switch {
  position: relative;
  width: 44px;
  height: 24px;
  border-radius: 999px;
  background: #d1d5db;
  transition: background 0.2s;
}

.switch.on { background: var(--accent); }

.switch::after {
  content: "";
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.15);
  transition: transform 0.2s;
}

.switch.on::after { transform: translateX(20px); }
```

---

## 动效规范

```css
/* 全局过渡 */
* { transition: all 0.2s ease; }

/* 加载旋转 */
@keyframes spin {
  to { transform: rotate(360deg); }
}
.spin { animation: spin 1s linear infinite; }

/* 骨架屏 */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.skeleton {
  background: linear-gradient(90deg, var(--surface-soft) 25%, var(--surface-tint) 50%, var(--surface-soft) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.8s ease-in-out infinite;
  border-radius: 4px;
}

/* 卡片入场 */
@keyframes card-enter {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.card { animation: card-enter 0.3s ease both; }
```

---

## 天气图标艺术

纯 CSS 实现的天气图标，不用图片：

```css
.weather-art {
  position: relative;
  width: 40px;
  height: 28px;
  display: inline-block;
}

.weather-art .sun-dot {
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #f59e0b;
  top: 2px;
  right: 4px;
}

.weather-art .cloud-a,
.weather-art .cloud-b {
  position: absolute;
  border-radius: 999px;
  background: #94a3b8;
}

.weather-art .cloud-a {
  width: 22px;
  height: 10px;
  bottom: 4px;
  left: 2px;
}

/* 晴天隐藏云，雨天显示雨滴等 */
.weather-art.sunny .cloud-a,
.weather-art.sunny .cloud-b { display: none; }
.weather-art.rainy .rain-a,
.weather-art.rainy .rain-b {
  /* 雨滴动画 */
}
```

---

## 响应式断点

```css
/* 大屏 → 平板 */
@media (max-width: 960px) {
  .home-layout {
    grid-template-columns: minmax(0, 1fr);  /* 双栏变单栏 */
  }
  .topbar {
    grid-template-columns: auto 1fr auto;
  }
}

/* 平板 → 手机 */
@media (max-width: 640px) {
  body { padding: 30px 15px 20px; }
  .topbar nav { display: none; }  /* 隐藏顶部导航，显示底部 */
  .mobile-nav { display: flex; }
  .search-box {
    height: 54px;
    border-radius: 12px;
    grid-template-columns: 24px minmax(0, 1fr) 82px;
  }
  .footer-inner { flex-wrap: wrap; }
}

/* 小手机 */
@media (max-width: 520px) {
  .home-module-settings { width: calc(100vw - 24px); }
  .card-title { padding: 16px 14px 10px; }
  .metric { min-height: 68px; padding: 10px 11px; }
}
```

---

## 外壳主题变体

三套外壳风格，通过 `.chrome-{theme}` class 切换：

```css
/* 经典（默认）：固定顶栏 + 底部栏 */
/* 无额外样式，基础样式即经典 */

/* 悬浮：顶栏和底栏浮起为卡片 */
.chrome-floating .topbar {
  width: min(var(--shell-width), calc(100% - var(--page-gutter)));
  margin: 14px auto 0;
  padding: 0 26px;
  border: 1px solid var(--line);
  border-radius: 8px;
  box-shadow: var(--soft-shadow);
}

.chrome-floating .footer-inner {
  border-color: var(--line);
  background: rgba(255,255,255,0.9);
  box-shadow: var(--soft-shadow);
}

/* 极简：去掉边框和阴影 */
.chrome-minimal .topbar {
  border-bottom-color: rgba(227,232,235,0.62);
  background: rgba(255,255,255,0.7);
  box-shadow: none;
}

.chrome-minimal .topbar nav button.active {
  border-bottom-color: transparent;
  color: var(--accent-dark);
}

/* 极简的下划线指示器 */
.chrome-minimal .topbar nav button.active::after {
  content: "";
  width: 24px;
  height: 3px;
  position: absolute;
  bottom: 9px;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 999px;
  background: var(--accent);
}
```

---

## 壁纸系统

五种壁纸模式，通过 `style` 属性动态设置：

```typescript
// 默认：渐变（由 CSS 背景处理）
{}

// 薄荷：轻绿色调
{ background: "linear-gradient(135deg, rgba(15,155,142,0.16), rgba(37,99,235,0.08) 45%, rgba(246,248,248,1) 100%)" }

// 纸面：干净留白
{ background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(246,248,248,1)), radial-gradient(circle at 20% 18%, rgba(15,155,142,0.06), transparent 28rem)" }

// 晨光：暖色氛围
{ background: "linear-gradient(135deg, rgba(255,244,229,0.95), rgba(239,247,245,1) 52%, rgba(246,248,248,1))" }

// 自定义：本地图片 + 暗色遮罩
{
  backgroundImage: "linear-gradient(180deg, rgba(246,248,248,0.84), rgba(246,248,248,0.9)), url(\"...\")",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundAttachment: "fixed",
}
```

---

## 滚动条定制

```css
/* Firefox */
html {
  scrollbar-gutter: stable;
  scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track);
  scrollbar-width: thin;
}

/* WebKit */
*::-webkit-scrollbar { width: 10px; height: 10px; }
*::-webkit-scrollbar-track {
  background: var(--scrollbar-track);
  border-radius: 999px;
}
*::-webkit-scrollbar-thumb {
  border: 2px solid transparent;
  border-radius: 999px;
  background: var(--scrollbar-thumb);
  background-clip: content-box;
}
*::-webkit-scrollbar-thumb:hover {
  background: var(--scrollbar-thumb-hover);
  background-clip: content-box;
}
```

---

## 关键设计原则总结

1. **毛玻璃层叠**：表面用半透明 rgba + backdrop-filter，透出背景渐变
2. **粗体排版**：全文 700-800 字重，力量感强
3. **大圆角**：搜索框 16px，卡片 8px，按钮 8px，药丸 999px
4. **柔和阴影**：避免硬阴影，用大模糊半径 + 低透明度
5. **微动效**：0.2s ease 全局过渡，不过度
6. **三档主题**：经典/悬浮/极简，通过 body class 一键切换
7. **响应式优先**：960px / 640px / 520px 三个断点
8. **暗色不是反转**：偏绿灰的深色基调，与主色呼应
