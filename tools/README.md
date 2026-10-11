# tools/ 在线工具箱

> 76 browser-based utilities — image, text, time, calc and live data dashboards. Free, no ads, no build step, self-hostable.

76 个浏览器即开即用的在线工具：免安装、免注册、无广告，纯原生 HTML/CSS/JS 前端实现，无后端、无构建步骤——**源码全开放，下载即可自部署**。

**在线使用**：<https://jingw-ui.github.io/tools/>（完整列表、搜索与分类筛选见该页）

## 分类速览

| 分类 | 数量 | 代表工具 |
|------|-----:|----------|
| 图片工具 | 15 | 图片压缩、背景移除、二维码、画板、GPT Image 提示词画廊 |
| 字符处理 | 17 | JSON 格式化、Markdown 编辑器、正则测试与可视化、加密解密 |
| 时间与日期 | 5 | 时间戳转换、农历日历、世界时钟墙 |
| 计算与换算 | 6 | 科学计算器、单位/进制换算、贷款计算器、毫秒薪计时器 |
| 信息聚合 | 18 | 每天60秒、60s 信息流、GitHub 热门榜、世界实时监控、健身动作库 |
| 实用杂项 | 15 | 密码生成器、文件哈希校验、PDF 工具、待办清单、深呼吸放松 |

另收录 3 个外部导航站点作为推荐外链，与本地工具同卡片展示。

## 取用与自部署

所有页面均为纯静态文件，源码即站点本身：

- **整站部署**：`git clone` 本仓库（或 GitHub Code → Download ZIP），将 `tools/` 放到任意静态托管——GitHub Pages、Vercel、Netlify、Nginx 等均可，无需构建；
- **单独取用某个工具**：40 个编号工具引用共享层 `tools/common.css` 与 `tools/common.js`，拷贝时请连同这两个文件一起带走（保持相对路径结构）；其余工具目录自包含，直接拷走即用；
- 少数工具调用外部数据接口（热榜、名言等），部署后联网即可正常使用。

## 工程约定

- 每个工具一个子目录，静态文件直出，push 即发布；
- 新工具建议复用共享层 `tools/common.css`（GitHub-light 骨架）与 `tools/common.js`（toast / 复制 / 下载 / escapeHtml 全局函数），加载顺序：`common.css` 在页内 `<style>` 之前，`common.js` 在页内 `<script>` 之前。

## 许可

本目录本站原创工具遵循仓库根 [MIT License](../LICENSE)；`handraw-style`（MIT 镜像）、`60s`（React/MIT）等第三方收录内容保留其原始许可。
