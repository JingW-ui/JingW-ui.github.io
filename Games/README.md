# Games/ 游戏中心

> 39 playable browser mini-games — action, puzzle, 3D scenes and toys. Open and play, no install, self-hostable.

39 个网页小游戏：打开即玩、免安装、无广告，以 Canvas / 原生 JS 为主，部分 3D 作品基于 Three.js——**源码全开放，下载即可自部署**。

**在线游玩**：<https://jingw-ui.github.io/Games/>（分类标签页与搜索见该页）

## 分类速览

| 分类 | 数量 | 代表游戏 |
|------|-----:|----------|
| 动作 · 竞速 | 18 | 鹈鹕骑单车、卡丁车大乱斗、深空漂移战机、谷歌恐龙快跑 |
| 益智 · 牌类 | 6 | 人生重开模拟器、数独挑战、切积木 |
| 3D 场景 · 氛围 | 7 | 雨夜便利店、木漏时光、赛博回廊、3D 地球模型 |
| 玩具 · 音乐 | 8 | 赛博木鱼、按键钢琴、形态工坊、3D 炫光骰子 |

## 取用与自部署

每个游戏一个自包含子目录，无站内跨目录依赖：

- **整站部署**：`git clone` 本仓库（或 GitHub Code → Download ZIP），将 `Games/` 放到任意静态托管——GitHub Pages、Vercel、Netlify、Nginx 等均可，无需构建；
- **单独取用某个游戏**：直接拷贝该游戏子目录到你的站点即可；
- 少数游戏引用公共 CDN（three.js、gsap、Tailwind、Google Fonts 等），部署后联网即可正常加载。

## 收录声明

- 本站原创游戏遵循仓库根 [MIT License](../LICENSE)；
- `remake`（MIT 镜像）、`operation-ironhold`（MIT）等第三方收录游戏保留其原始许可；
- `smash-karts`、`magic-carpet`、`bait-fish` 上游未设开源许可，本站仅供学习交流，如有侵权即删。
