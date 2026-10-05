[中文](./README.md) | English

# JingW-ui.github.io

> A fully static personal site: 76 online tools, 11 Windows desktop applications, and 39 browser games — all free, ad-free, and build-free, hosted on GitHub Pages.

**Live site**：<https://jingw-ui.github.io>

## ✨ Screenshots

<table>
  <tr><td align="center"><a href="https://jingw-ui.github.io/"><img src="docs/readme/home.webp" alt="Home" width="100%"></a><br><b>Home</b> · Site-wide navigation + random picks</td></tr>
  <tr><td align="center"><a href="https://jingw-ui.github.io/tools/"><img src="docs/readme/tools.webp" alt="Online Toolbox" width="100%"></a><br><b>Online Toolbox</b> · 76 ready-to-use tools</td></tr>
  <tr><td align="center"><a href="https://jingw-ui.github.io/Games/"><img src="docs/readme/games.webp" alt="Game Center" width="100%"></a><br><b>Game Center</b> · 39 browser games</td></tr>
  <tr><td align="center"><a href="https://jingw-ui.github.io/softwares/"><img src="docs/readme/softwares.webp" alt="Software Downloads" width="100%"></a><br><b>Software Downloads</b> · 11 Windows apps</td></tr>
</table>

## What's Inside

| Module | Count | Description | Stack |
|--------|-------|-------------|-------|
| [Online Toolbox](https://jingw-ui.github.io/tools/) | 76 | Ready-to-use browser tools: image processing, format conversion, text & dev utilities. No install, no sign-up. | Vanilla HTML / CSS / JS |
| [Software Downloads](https://jingw-ui.github.io/softwares/) | 11 | Release pages for Windows desktop apps: introductions, source repos, and downloadable releases | Python (PySide6 / PyTorch / YOLOv8) |
| [Game Center](https://jingw-ui.github.io/Games/) | 39 | Browser games: casual, puzzle, action — just open and play | Canvas / vanilla JS |
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
├── Games/                                  # 39 browser games (one subdirectory each)
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

## License

The root [LICENSE](LICENSE) is **MIT** and covers **only original work** in this repo. Third-party content and personal content are excluded — each directory keeps its own LICENSE / page notice:

- ✅ **MIT applies**: the home page, original tools under `tools/`, original games under `Games/` (included third-party games excluded — see below), and the glassmorphism design system — free to use and adapt; keep the copyright notice.
- 🔎 **Third-party content**: keeps its original license or inclusion notice, e.g. `Games/remake` (MIT mirror), `Games/operation-ironhold` (MIT), `tools/handraw-style` (MIT mirror), `tools/60s` (React/MIT), embedded three.js (MIT). `Games/smash-karts`, `Games/magic-carpet`, and `Games/bait-fish` have no upstream open-source license — included for learning only and removed upon request.
- 🚫 **Not open-sourced**: personal resume, job-hunting records, and photos under `cv/`, `resume/`, `videos/`, `carousel/`, `ppt/`, `reports/`, `resources/`, `tracker/`, `imgs/` — browsable online but not licensed; no redistribution, scraping, or model-training use.

---

For the author's background (education, competitions, internships), see the [online resume](https://jingw-ui.github.io/resume/).
