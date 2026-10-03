[English](./README.en.md) | 中文

# JingW-ui.github.io

> 纯静态个人站点：76 个在线工具、11 款 Windows 软件、36 个网页小游戏，全部免费、无广告、无构建，由 GitHub Pages 托管。

**在线访问**：<https://jingw-ui.github.io>

## 项目组成

| 模块 | 规模 | 说明 | 技术栈 |
|------|------|------|--------|
| [在线工具箱](https://jingw-ui.github.io/tools/) | 76 个 | 浏览器直接使用的实用小工具：图片处理、格式转换、文本与开发辅助等，免安装、免注册 | 原生 HTML / CSS / JS |
| [软件下载](https://jingw-ui.github.io/softwares/) | 11 款 | Windows 桌面软件发布页：软件介绍、源码仓库与 Release 下载 | Python（PySide6 / PyTorch / YOLOv8） |
| [游戏中心](https://jingw-ui.github.io/Games/) | 36 个 | 原创网页小游戏：休闲、益智、动作，打开即玩 | Canvas / 原生 JS |
| [个人主页](https://jingw-ui.github.io/) | — | 全站导航与各模块随机推荐入口 | 原生 HTML / CSS / JS |
| [简历 / 演示 / 获奖 / 幻灯片](https://jingw-ui.github.io/resume/) | 4 个模块 | resume、videos、carousel、ppt 四组静态页面 | HTML / CSS |

## 数据成果

| 指标 | 数据 |
|------|------|
| GitHub Stars | ![PI-MAPP](https://img.shields.io/github/stars/JingW-ui/PI-MAPP?style=flat-square&label=PI-MAPP) ![AutoTask-UI-](https://img.shields.io/github/stars/JingW-ui/AutoTask-UI-?style=flat-square&label=AutoTask-UI-) |
| 软件下载量（Releases） | ![PI-MAPP](https://img.shields.io/github/downloads/JingW-ui/PI-MAPP/total?style=flat-square&label=PI-MAPP) ![AutoTask-UI-](https://img.shields.io/github/downloads/JingW-ui/AutoTask-UI-/total?style=flat-square&label=AutoTask-UI-) ![MediScreen-Brain](https://img.shields.io/github/downloads/JingW-ui/MediScreen-Brain/total?style=flat-square&label=MediScreen-Brain) |
| B 站播放 | **9.6w+**（截至 2026-10-03：微机原理复习 6.9w · AutoTask 演示 1.4w · 目标检测演示 1.3w） |

## 技术栈

**本站页面**：![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black) ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css&logoColor=white)（原生实现，无框架、无构建）

**发布软件**：![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white) ![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=flat-square&logo=pytorch&logoColor=white) ![Qt](https://img.shields.io/badge/Qt-41CD52?style=flat-square&logo=qt&logoColor=black)（GUI 基于 PySide6，视觉模型基于 YOLOv8 / PyTorch）

**工程**：![Git](https://img.shields.io/badge/Git-F05032?style=flat-square&logo=git&logoColor=white) GitHub Pages 自动部署

## 目录结构

```
JingW-ui.github.io/
├── index.html                              # 个人主页：全站导航 + 随机推荐
├── tools/                                  # 76 个在线工具（每个工具一个子目录）
├── softwares/                              # 11 款 Windows 软件的下载索引
├── Games/                                  # 36 个网页小游戏（每个游戏一个子目录）
├── resume/  cv/  videos/  carousel/  ppt/  # 简历 / 求职视频 / 获奖画廊 / 幻灯片
├── skills/                                 # AI Agent Skills
├── imgs/  resources/                       # 图片与公共资源
└── sitemap.xml  llms.txt  llms-full.txt  robots.txt   # SEO/GEO：站点地图 + AI 爬虫清单
```

交互式结构图：[gitdiagram.com/jingw-ui/jingw-ui.github.io](https://gitdiagram.com/jingw-ui/jingw-ui.github.io)

## 部署

- 纯静态 HTML，push 到 `main` 后 GitHub Pages 自动发布，无构建步骤。
- `robots.txt` 显式放行 AI 与模型训练爬虫；`llms.txt` / `llms-full.txt` 提供面向大模型的站点索引。
- AI 快速阅读本仓库：[gitingest.com/JingW-ui/JingW-ui.github.io](https://gitingest.com/JingW-ui/JingW-ui.github.io)

---

作者背景（教育、竞赛、实习经历）见[在线简历](https://jingw-ui.github.io/resume/)。
