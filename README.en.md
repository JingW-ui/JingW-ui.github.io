[中文](./README.md) | English

# JingW-ui.github.io

> A fully static personal site: 76 online tools, 11 Windows desktop applications, and 36 browser games — all free, ad-free, and build-free, hosted on GitHub Pages.

**Live site**：<https://jingw-ui.github.io>

## What's Inside

| Module | Count | Description | Stack |
|--------|-------|-------------|-------|
| [Online Toolbox](https://jingw-ui.github.io/tools/) | 76 | Ready-to-use browser tools: image processing, format conversion, text & dev utilities. No install, no sign-up. | Vanilla HTML / CSS / JS |
| [Software Downloads](https://jingw-ui.github.io/softwares/) | 11 | Release pages for Windows desktop apps: introductions, source repos, and downloadable releases | Python (PySide6 / PyTorch / YOLOv8) |
| [Game Center](https://jingw-ui.github.io/Games/) | 36 | Original browser games: casual, puzzle, action — just open and play | Canvas / vanilla JS |
| [Home](https://jingw-ui.github.io/) | — | Site-wide navigation with randomized recommendations | Vanilla HTML / CSS / JS |
| [Resume / Videos / Awards / Slides](https://jingw-ui.github.io/resume/) | 4 sections | Static pages: resume, videos, carousel, ppt | HTML / CSS |

## Metrics

| Metric | Data |
|--------|------|
| GitHub Stars | ![PI-MAPP](https://img.shields.io/github/stars/JingW-ui/PI-MAPP?style=flat-square&label=PI-MAPP) ![AutoTask-UI-](https://img.shields.io/github/stars/JingW-ui/AutoTask-UI-?style=flat-square&label=AutoTask-UI-) |
| Software Downloads (Releases) | ![PI-MAPP](https://img.shields.io/github/downloads/JingW-ui/PI-MAPP/total?style=flat-square&label=PI-MAPP) ![AutoTask-UI-](https://img.shields.io/github/downloads/JingW-ui/AutoTask-UI-/total?style=flat-square&label=AutoTask-UI-) ![MediScreen-Brain](https://img.shields.io/github/downloads/JingW-ui/MediScreen-Brain/total?style=flat-square&label=MediScreen-Brain) |
| Bilibili views | **300k+** ([Microcomputer Principles review series](https://www.bilibili.com/video/BV1Sd4y1J7k5/) 227k · AutoTask demo 14k · Object detection demo 13k, as of 2026-10-03) |

## Tech Stack

**Site pages**: ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black) ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css&logoColor=white) (vanilla, no framework, no build step)

**Shipped software**: ![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white) ![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=flat-square&logo=pytorch&logoColor=white) ![Qt](https://img.shields.io/badge/Qt-41CD52?style=flat-square&logo=qt&logoColor=black) (GUI built with PySide6, vision models on YOLOv8 / PyTorch)

**Tooling**: ![Git](https://img.shields.io/badge/Git-F05032?style=flat-square&logo=git&logoColor=white) auto-deployed via GitHub Pages

## Directory Layout

```
JingW-ui.github.io/
├── index.html                              # Home: navigation + random picks
├── tools/                                  # 76 online tools (one subdirectory each)
├── softwares/                              # Download index for 11 Windows apps
├── Games/                                  # 36 browser games (one subdirectory each)
├── resume/  cv/  videos/  carousel/  ppt/  # Resume / demo videos / awards gallery / slides
├── skills/                                 # AI Agent Skills
├── imgs/  resources/                       # Images and shared assets
└── sitemap.xml  llms.txt  llms-full.txt  robots.txt   # SEO/GEO: sitemap + AI-crawler policy
```

Interactive diagram: [gitdiagram.com/jingw-ui/jingw-ui.github.io](https://gitdiagram.com/jingw-ui/jingw-ui.github.io)

## Deployment

- Pure static HTML — pushing to `main` triggers an automatic GitHub Pages deploy, no build step.
- `robots.txt` explicitly allows AI and model-training crawlers; `llms.txt` / `llms-full.txt` provide LLM-oriented site indexes.
- Read this repo quickly with AI: [gitingest.com/JingW-ui/JingW-ui.github.io](https://gitingest.com/JingW-ui/JingW-ui.github.io)

---

For the author's background (education, competitions, internships), see the [online resume](https://jingw-ui.github.io/resume/).
