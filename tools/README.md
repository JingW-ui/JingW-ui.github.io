# tools/ 共享层迁移配方

> 目标：**视觉逐像素不变**。所有 40 个编号工具已迁移到共享层 `common.css` / `common.js`，A/B 像素对比 + computed-style 扫描 + console + toast 行为四重验证通过（**PASS 364 / FAIL 0**，桌面 1280×900 + 手机 375×667 双视口）。

## 迁移进度（已完成）

- **试点 3 页**（提交 `c9af1bc`）：`06-text-case-converter`、`29-unit-converter`、`38-drawing-board`。
- **全量 37 页**（本次提交）：01–05、07–28、30–37、39–40。净减 ~119 行。
- **验证方式**：`git show HEAD:…` 起 8082 起旧版、工作树 8081 起新版，Playwright 逐页 A/B：①截图像素 diff=0；②`getComputedStyle` 43 属性全元素扫描一致；③console 无错误、common.css/js 返回 200；④toast 行为复刻（Family A 复用、Family C 移除、Family B 不抛错）。非确定性内容页（15 时钟 / 32 随机 / 33 随机密码 / 35 名言 API）由 harness 冻结 Date + 播种 Math.random + 屏蔽外部 API 保证前后一致。

## 例外与保留（有意为之）

| 页 | 例外 | 原因 |
|----|------|------|
| `01-json-formatter` | 保留 `navigator.clipboard.writeText` | 本页无 toast，复制反馈走 `setStatus`（状态栏），转 `copyText` 会凭空引入 toast 视觉 |
| `22-color-picker`、`32-random-generator` | 保留 `navigator.clipboard.writeText` | 无 toast 机制，转 `copyText` 会引入新视觉 |
| `35-todo-list` | **Family B**，保留内联 `showToast` | class 切换式 toast（2200–3000ms），本轮不统一，toast 保持内联 |
| `04-markdown-editor` | Family A 但 `configureToast({duration:2000})` | 原 toast 时长 2000ms，非默认 1800ms |
| `34-file-previewer`、`39-unicode-tool`、`40-lorem-generator` | **Family C**，`configureToast({reuse:false,duration:2000,styles:{…#24292f 底部居中…}})` | create/destroy 式 toast，底部居中 `#24292f` 2000ms |
| `05-text-diff`、`17-countdown-timer`、`27-base-converter`、`28-scientific-calculator`、`36-screen-ruler` | 无 toast | 原页即无 toast，未引入 |
| `38-drawing-board` | 保留 `saveCanvas`（data-URL）/ `copyCanvas`（图片 ClipboardItem） | data-URL 下载与图片复制不转 `downloadBlob`/`copyText` |

## 共享层是什么

- `tools/common.css` — GitHub-light 骨架（短命名方言令牌 + body/header/card/btn/textarea/label），约 25 条规则。
- `tools/common.js` — 经典脚本（非 ES module），暴露 5 个全局：`configureToast` / `showToast` / `copyText` / `escapeHtml` / `downloadBlob`。

**加载顺序是硬约束**（link 在页面内联 `<style>` **之前**，script 在页面内联 `<script>` **之前**）：

```html
<link rel="stylesheet" href="../common.css">
<style>…页内规则…</style>
…
<script src="../common.js"></script>
<script>…页内脚本…</script>
```

## 迁移步骤

### 1. 快照基线（不入库）
桌面 `1280×900` + 手机 `375×667` 截图，记录 console 报错。

### 2. 令牌方言归一
- full-names（01-05）：`--bg-secondary→--bg2`、`--bg-tertiary→--bg3`、`--text-secondary→--text2`、`--green-hover→--green2`。
- 无短名的额外令牌（`--red`/`--blue`/`--shadow-md` 等）保留在页内局部 `:root`。
- card-style（34/36/39/40）：**不得删 `--bg`**（须覆盖 common 的 `--bg:#fff`），保留 `--card` 相关令牌。

### 3. 剥骨架 CSS（核心规则）
**只删"与 common.css 对应规则逐字节相同"的规则**；有一处不同就保留内联（内联声明优先级更高，可安全覆盖共享）。

⚠️ **三个高频回归陷阱**（试点实测）：

| 陷阱 | 现象 | 修法 |
|------|------|------|
| **子集规则** | 页内 `.card{…}` 没写 `display`，common 的 `display:flex;flex-direction:column` 泄漏 | 子集规则必须**显式中和**不需要的公共属性：`display:block;flex-direction:row`、`box-shadow:none`、`min-height:0`、`justify-content:flex-start` 等 |
| **`.btn-primary` 顺序** | 页内 `.btn` 与 common 的 `.btn` padding/font-size 不同；把 `.btn-primary` 提进 common.css 后排在页内 `.btn` 之前，同特异性按源码顺序 `.btn` 赢 → 主按钮变白 | 页内 `.btn` 与 common 不同时，**`.btn-primary`/`:hover` 必须留在内联**（插在页内 `.btn` 之后），恢复获胜顺序 |
| **body 全高泄漏** | common body `min-height:100vh;display:flex` 泄漏进容器式 / 画板页 | 保留页内 `body` 并追加 `min-height:0` / `display:block;flex-direction:row` |

### 4. 删本地 `showToast`（务必删干净）
遗留的 `function showToast` 会**遮蔽共享版并绕过 `configureToast`**——最高概率回归点。
- Family A（默认）：删本地后直接复用共享 `showToast(msg)`（懒建 `#_toast` 复用，1800ms 淡出，右下）。
- Family C（create/destroy，底部居中 `#24292f` 2000ms）：删本地后加一行 `configureToast({reuse:false,duration:2000,styles:{…原视觉…}})`，现有 `showToast(msg)` 调用点零改动即复刻。
- Family B（class 切换 2200-3000ms，35/biji/create_icon/script_forge/glb_viewer_meshy）：**本轮不统一**，toast 保持内联。

### 5. 改 copy
`navigator.clipboard.writeText(X).then(()=>showToast(M))` → `copyText(X)` 或 `copyText(X, M)`（M≠"已复制"时）。
注意**生成 HTML 里的 `onclick` 属性**（如 29 的 `onclick="copyText('${val}')"`；值内含引号需先确认安全）。

### 6. 工具函数
仅在页面已有 DOM 版 `escapeHtml` / Blob `downloadBlob` 时启用全局版；data-URL 下载、图片 ClipboardItem **不转换**（38 的 `saveCanvas`/`copyCanvas` 保留原样）。

## 验证清单

1. **grep 断言**：`function showToast`→0；`navigator.clipboard.writeText`→0；`common.css`+`common.js` 引用→2/页；无残留 `cdn.`。
2. **像素对比**：`git show HEAD:路径` 起旧版静态服务，Playwright 对桌面+手机前后截图，diff=0 像素。
3. **computed-style 抽查**：`body`/`.card`/`.btn`/`header`/`.card-header` 前后 getComputedStyle 一致（含 `display`/`flex-direction`/`min-height`/`box-shadow`）。
4. **console 干净**：无 ReferenceError/TypeError；common.css/js 返回 200。
5. **toast 行为**：触发后 `#_toast` 恰好 1 个，二次触发仍 1 个（不重复建）。

## 明确不做
Family B toast 统一（35/biji/create_icon/script_forge/glb_viewer_meshy）、非编号页（biji/create_icon/glb_viewer_meshy/script_forge 等）迁移、tools/index.html 数据驱动化、ES module 化编号工具。
