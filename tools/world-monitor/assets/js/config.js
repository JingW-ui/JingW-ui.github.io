/* ============================================================
   世界实时监控 - 全局配置
   新增数据面板只需:1) 在 FEEDS 加一项配置 2) 在 feeds.js 实现 fetch/normalize
   ============================================================ */

export const CONFIG = {
  title: '世界实时监控',
  map: {
    geoUrl: 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json',
    width: 960,
    height: 480,
    maxAgeMs: 24 * 3600 * 1000, // 地图数据缓存时长(会话内)
  },
};

/* 筛选标签(与 marker.type 对应) */
export const FILTERS = [
  { key: 'all', label: '全部' },
  { key: 'quakes', label: '地震' },
  { key: 'wildfires', label: '野火' },
  { key: 'floods', label: '洪水' },
  { key: 'storms', label: '风暴' },
  { key: 'volcanoes', label: '火山' },
  { key: 'other', label: '其他' },
];

/* 数据源配置 */
export const FEEDS = [
  {
    key: 'usgs',
    label: '地震',
    icon: '🌊',
    enabled: true,
    refreshMs: 5 * 60 * 1000,
    maxBackoffMs: 10 * 60 * 1000,
    type: 'quakes',
  },
  {
    key: 'eonet',
    label: '自然事件',
    icon: '🌍',
    enabled: true,
    refreshMs: 10 * 60 * 1000,
    maxBackoffMs: 15 * 60 * 1000,
    type: 'nature',
  },
];

/* EONET 事件类别(title 归一化) → 过滤器类型 / 中文标签 / 颜色 */
const _c = (type, label, color) => ({ type, label, color });
export const EONET_CATEGORIES = {
  wildfires: _c('wildfires', '野火', '#ef4444'),
  floods: _c('floods', '洪水', '#3b82f6'),
  'severe storms': _c('storms', '风暴', '#8b5cf6'),
  storms: _c('storms', '风暴', '#8b5cf6'),
  volcanoes: _c('volcanoes', '火山', '#dc2626'),
  earthquakes: _c('quakes', '地震', '#f59e0b'),
  landslides: _c('other', '山体滑坡', '#a16207'),
  drought: _c('other', '干旱', '#e8a33d'),
  'sea and lake ice': _c('other', '海冰', '#06b6d4'),
  'dust and haze': _c('other', '沙尘雾霾', '#a78bfa'),
  'dust storms': _c('other', '沙尘暴', '#c4b5fd'),
  snow: _c('other', '雪灾', '#94a3b8'),
  'temperature extremes': _c('other', '极端温度', '#fb923c'),
  manmade: _c('other', '人为事件', '#64748b'),
  'water color': _c('other', '水华', '#22d3ee'),
  glaciers: _c('other', '冰川', '#67e8f9'),
};
export const DEFAULT_CATEGORY = _c('other', '其他', '#64748b');

/* 图例 */
export const LEGEND = [
  { type: 'quakes', label: '地震', color: '#f59e0b' },
  { type: 'wildfires', label: '野火', color: '#ef4444' },
  { type: 'floods', label: '洪水', color: '#3b82f6' },
  { type: 'storms', label: '风暴', color: '#8b5cf6' },
  { type: 'volcanoes', label: '火山', color: '#dc2626' },
  { type: 'other', label: '其他', color: '#64748b' },
];
