# 世界实时监控 World Monitor

轻量纯前端"全球实时态势感知"仪表盘,复刻 [koala73/worldmonitor](https://github.com/koala73/worldmonitor) 的核心概念(世界地图 + 实时事件面板),但零后端、零 API Key,完全适配 GitHub Pages 静态部署。

## 功能

- 🗺️ **SVG 世界地图**:world-atlas TopoJSON 渲染,脉冲式事件标记
- 🌊 **实时地震**(USGS):近 24h M≥4 地震,按震级着色与缩放
- 🌋 **自然事件**(NASA EONET):活跃野火 / 洪水 / 风暴 / 火山 / 山体滑坡等
- 📋 分类筛选、事件列表、选中详情卡、统计面板、底部滚动事件条
- ⚙️ 自动刷新(可关)、手动刷新、会话缓存秒开、单源失败隔离

## 数据源

| 数据源 | 端点 | 说明 |
|---|---|---|
| USGS 地震 | `earthquake.usgs.gov/fdsnws/event/1/query` | 近 24h, M≥4 |
| NASA EONET | `eonet.gsfc.nasa.gov/api/v3/events` | 活跃自然事件 |
| 地图 | `cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json` | TopoJSON |

所有数据源均为免费公开接口,浏览器直接跨域访问(CORS `*`),无任何密钥。

## 目录结构

```
world-monitor/
  index.html                # 壳页面
  assets/css/style.css      # 玻璃态设计系统(与 tools/index.html 一致)
  assets/js/
    config.js               # 数据源配置 + 类别映射 + 图例
    feeds.js                # 数据源 adapter(统一 fetch/normalize/容错)
    map.js                  # TopoJSON → SVG 世界地图渲染
    markers.js              # 事件标记层(脉冲动画)
    panels.js               # 左侧列表 / 右侧详情 / 统计 / 滚动条
    app.js                  # 初始化、刷新调度、交互
```

## 如何扩展(新增数据面板)

统一接口:`Marker = { id, feedKey, type, categoryLabel, color, lat, lon, severity, title, time, details, link }`

1. **`config.js`** → `FEEDS` 数组加一项:`{ key, label, icon, enabled, refreshMs, maxBackoffMs, type }`
2. **`feeds.js`** → 新增 `xxxFeed = { key, fetch(), normalize() }`,注册进 `FEED_IMPL`
3. 完成。渲染层(地图/列表/详情)零改动。

若新类别需要独立筛选标签,在 `config.js` 的 `FILTERS` 与 `LEGEND` 追加对应 `type` 即可。

## 本地运行

```bash
# 任选其一
python -m http.server 8080
# 或 npx serve
```
浏览器打开 `http://localhost:8080/tools/world-monitor/`。

> 注:使用了 ES Module 与 CDN 依赖,需通过 HTTP 服务访问,不能直接 `file://` 双击打开。
