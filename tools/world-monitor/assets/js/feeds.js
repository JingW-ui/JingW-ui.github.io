/* ============================================================
   世界实时监控 - 数据源 adapter
   统一标记结构 Marker:
   { id, feedKey, type, categoryLabel, color, lat, lon, severity(0-1),
     title, time(Date), details, link }
   每个数据源实现 fetch() + normalize() 即可接入面板。
   ============================================================ */

import { EONET_CATEGORIES, DEFAULT_CATEGORY } from './config.js';

/* ---------------- 工具函数 ---------------- */

function magColor(m) {
  if (m >= 7) return '#dc2626';
  if (m >= 6) return '#f97316';
  if (m >= 5) return '#f59e0b';
  return '#22c55e';
}

/* 归一化 EONET 类别 */
function classify(categories) {
  const titles = (categories || []).map(c => String(c.title || '').toLowerCase().trim());
  for (const t of titles) {
    if (EONET_CATEGORIES[t]) return EONET_CATEGORIES[t];
  }
  return DEFAULT_CATEGORY;
}

/* 从 EONET geometry 提取经纬度(Point 取坐标;Polygon/MultiPoint 取外环均值) */
function coordsOf(geo) {
  const c = geo.coordinates;
  if (!c || !c.length) return [null, null];
  if (geo.type === 'Point') return [c[0], c[1]];
  const pts = geo.type === 'MultiPoint' ? c : (c[0] || []);
  let lon = 0, lat = 0, n = 0;
  for (const p of pts) {
    if (p && typeof p[0] === 'number') { lon += p[0]; lat += p[1]; n++; }
  }
  return n ? [lon / n, lat / n] : [null, null];
}

/* ---------------- 数据源实现 ---------------- */

const usgsFeed = {
  key: 'usgs',
  fetch() {
    const start = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const url = 'https://earthquake.usgs.gov/fdsnws/event/1/query' +
      '?format=geojson&starttime=' + encodeURIComponent(start) +
      '&minmagnitude=4&orderby=time&limit=100';
    return fetch(url).then(r => {
      if (!r.ok) throw new Error('USGS HTTP ' + r.status);
      return r.json();
    });
  },
  normalize(data) {
    return (data.features || [])
      .filter(f => f.geometry && f.geometry.coordinates)
      .map(f => {
        const p = f.properties || {};
        const [lon, lat, depth] = f.geometry.coordinates;
        const mag = p.mag != null ? p.mag : 0;
        return {
          id: 'usgs-' + f.id,
          feedKey: 'usgs',
          type: 'quakes',
          categoryLabel: '地震',
          color: magColor(mag),
          lat, lon,
          severity: Math.min(1, Math.max(0.15, (mag - 3.5) / 4.5)),
          title: `${mag.toFixed(1)} 级地震 · ${p.place || '未知地点'}`,
          time: new Date(p.time),
          details: `震源深度 ${(depth != null ? depth : 0).toFixed(0)} km`,
          link: p.url || null,
          mag,
        };
      });
  },
};

const eonetFeed = {
  key: 'eonet',
  fetch() {
    return fetch('https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=200').then(r => {
      if (!r.ok) throw new Error('EONET HTTP ' + r.status);
      return r.json();
    });
  },
  normalize(data) {
    const out = [];
    (data.events || []).forEach(ev => {
      const geo = (ev.geometry && ev.geometry.length) ? ev.geometry[0] : null;
      if (!geo) return;
      const [lon, lat] = coordsOf(geo);
      if (lon == null || lat == null || lon > 180 || lon < -180) return;
      const cat = classify(ev.categories);
      const src = (ev.sources && ev.sources[0]) || null;
      out.push({
        id: 'eonet-' + ev.id,
        feedKey: 'eonet',
        type: cat.type,
        categoryLabel: cat.label,
        color: cat.color,
        lat, lon,
        severity: 0.5,
        title: ev.title,
        time: new Date(geo.date),
        details: cat.label + (src ? ' · 来源见链接' : ''),
        link: src ? src.url : null,
      });
    });
    return out;
  },
};

export const FEED_IMPL = {
  usgs: usgsFeed,
  eonet: eonetFeed,
};

/* ---------------- 加载与状态 ---------------- */

/* 数据源健康状态:ok / down */
export const feedStatus = {};

export async function loadFeed(impl) {
  try {
    const data = await impl.fetch();
    const markers = impl.normalize(data);
    feedStatus[impl.key] = { state: 'ok', at: Date.now(), error: null };
    return markers;
  } catch (err) {
    feedStatus[impl.key] = {
      state: 'down',
      at: Date.now(),
      error: (err && err.message) ? err.message : String(err),
    };
    return [];
  }
}

/* ---------------- 会话缓存(返回页面时秒开上次快照) ---------------- */

const PREFIX = 'wm_';

export function cacheGet(key) {
  try {
    const raw = sessionStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

export function cacheSet(key, val) {
  try { sessionStorage.setItem(PREFIX + key, JSON.stringify(val)); } catch (e) { /* ignore */ }
}
