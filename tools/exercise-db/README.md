# 健身动作数据库 Exercise Database

1,324 个健身动作的浏览检索工具:按**身体部位 / 器械 / 目标肌群**筛选,支持中英文搜索,动作缩略图经 CDN 加载。

数据源自 [hasaneyldrm/exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset)(MIT),裁剪为中文 + 英文分步指令(1.46MB)后静态内嵌;动作缩略图版权 © Gym Visual,经 jsdelivr CDN 引用(多节点 fallback)并署名,未复制进仓库。

## 功能

- 🔍 中英文搜索(动作名 / 编号)
- 🏷️ 部位芯片 + 器械 / 肌群下拉筛选
- 🖼️ 卡片画廊(懒加载缩略图,分页 150/页)
- ▶️ 动图预览:悬停卡片 → 右下角小预览;点击卡片 → 居中放大播放(遮罩/×/Esc 关闭)
- 📅 周训计划:按部位安排一周训练,推拉腿/上下肢/全身模板一键生成,单日可换一批/改目标,数据自动保存到 localStorage
- 🔧 CDN 多节点 fallback,单节点失效自动切换

## 目录结构

```
exercise-db/
  index.html
  scripts/build_data.py      # 数据裁剪脚本(可从 CDN 或本地重新生成)
  assets/
    data/exercises.js        # 裁剪数据(1324 条, 1.46MB)
    css/style.css            # 玻璃态设计系统
    js/config.js             # 中文词表(部位/器械/肌群)
    js/app.js                # 检索/筛选/弹窗逻辑
```

## 重新生成数据

```bash
python scripts/build_data.py                       # 从 jsdelivr CDN 下载生成
SOURCE=/path/exercises.json python scripts/build_data.py   # 或用本地源文件
```

## 本地运行

```bash
python -m http.server 8080   # 或 npx serve
# 打开 http://localhost:8080/tools/exercise-db/
```

> 使用了 ES Module 与 CDN 媒体,需通过 HTTP 服务访问。
