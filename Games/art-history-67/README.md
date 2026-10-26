# 67：一部藝術史 — 站内部署说明

本目录是 GitHub 项目 **meme67-art-history**（《67：一部藝術史 · 67 — A Brief History of Art》，作者/版权人 **Tunai-0511**）源代码的部署副本，经少量适配后挂载于本站游戏中心。

## 授权与素材边界

- 本目录托管的**全部内容均为 MIT 许可的源代码**（`LICENSE`），以及未修改的官方第三方库（`vendor/p5.min.js` — LGPL-2.1，`vendor/p5.brush.js` — MIT，声明见 `NOTICE.md`）。
- 上游**媒体资产一律未转载、未再托管**：影片（67.mp4）、官方封面（docs/cover.jpg）、配音音频样本（audio/words_fast/）、预渲染磁贴帧（public/tiles/）均属「保留所有权利」范围（见 `LICENSE-MEDIA.md`），本目录不包含其中任何文件。
- 上游明文欢迎「用这份代码做自己的作品」（`LICENSE-MEDIA.md`）；本站页面与卡片缩略图均为本站自行运行该代码的渲染产物。

## 相对上游源码的修改（均为 MIT 许可范围内的适配）

1. `index.html`：`/src/...` 绝对路径改为相对路径；舞台 1920×1080 增加 scale-to-fit 自适应缩放（居中、等比）。
2. `src/main.js`：场景脚本加载路径 `/src/scenes/` → `src/scenes/`（子目录部署适配）。
3. `player.js`（新增）：上游 `public/index.html` 是给 Puppeteer 逐帧渲染用的采集页，浏览器直接打开会停在 t=0。本驱动提供**双模式播放**：默认先尝试实时渲染（影片时间按真实时钟推进，逐帧计时）；若本机渲染过重（单帧 >4s 或近 4 帧均值 >1.6s）或渲染连续出错，**自动降级到「画廊模式」**——用预烘焙静帧（`tiles/<id>/001.jpg`，本站自行渲染）做 CSS 合成的交叉淡入幻灯，沿用影片同一 82s 时间线与年代字幕，纯 DOM 合成、无主线程阻塞风险。进入播放前还有一次 ~50ms 的画布性能探针（WebGL clear + 2D 笔画微基准）：软件渲染 WebGL 的弱机会直接进画廊模式，不会在首帧上卡死。另有 `?t=秒` 起播、`?gallery=1` 强制画廊、`?still` 单帧 QA、`?notrans=1`（上游原有开关）。
4. `src/scenes/finale.js`：结尾 15 宫格马赛克的上游实现依赖 720 张预渲染磁贴 jpg（不随源码分发，且属受限媒体）。本部署改为**每年代一张静帧**（`tiles/<id>/001.jpg`，由本站用该 MIT 场景代码自行渲染，非上游媒体），磁贴随节拍弹入 + 全局闪光仍然保留，仅磁贴内部的逐帧动画省略；某年代静帧缺失时回退上游的灰色占位。
5. 排除：`audio/`、`tools/`、`briefs/`、`docs/`、`package.json`、`cover.html`、`src/cover.js`（渲染管线与受限媒体，页面上用不到）。

## 其他说明

- 场景标注字体（Papyrus、Herculanum、Songti TC、Bodoni 72 等）是 macOS 系统字体，未随源码分发；Windows/Linux 上由 Canvas 自动回退，字形略有差异，属正常现象。
- 全片 1920×1080 程序渲染，对 GPU 有一定要求；低性能设备帧率下降时影片时间轴仍按真实时间推进（等效掉帧，不卡进度）。
- 播放循环周期 82 秒（与 `timeline.json` 的 duration 一致；若替换 timeline 请同步 `player.js` 里的 `DUR`）。
