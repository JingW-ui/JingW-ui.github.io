/* ============================================================
   世界实时监控 - 应用入口
   初始化 / 定时刷新 / 交互 / 失败隔离
   ============================================================ */

import { CONFIG, FEEDS, FILTERS, LEGEND } from './config.js';
import { FEED_IMPL, loadFeed, feedStatus, cacheGet, cacheSet } from './feeds.js';
import { initMap } from './map.js';
import { initMarkerLayer, renderMarkers, highlightMarker, clearHighlight } from './markers.js';
import * as panels from './panels.js';

const $ = id => document.getElementById(id);

const enabledFeeds = FEEDS.filter(f => f.enabled);

const state = {
  pool: new Map(),      // feedKey -> markers[]
  markers: [],          // 合并后全部(按时间倒序)
  filter: 'all',
  selectedId: null,
  autoRefresh: true,
  backoff: {},          // feedKey -> 退避倍率
  lastFetch: {},        // feedKey -> 上次成功拉取时间
};

const busy = new Set();
const timers = new Map(); // feedKey -> timeoutId

/* ---------------- 刷新调度 ---------------- */

function schedule(cfg) {
  if (!state.autoRefresh) return;
  if (timers.has(cfg.key)) clearTimeout(timers.get(cfg.key));
  const backoff = state.backoff[cfg.key] || 1;
  const delay = Math.min(cfg.refreshMs * backoff, cfg.maxBackoffMs);
  const t = setTimeout(() => refreshFeed(cfg), delay);
  timers.set(cfg.key, t);
}

async function refreshFeed(cfg) {
  if (busy.has(cfg.key)) return;
  busy.add(cfg.key);
  const impl = FEED_IMPL[cfg.key];
  const markers = await loadFeed(impl);
  busy.delete(cfg.key);

  const ok = feedStatus[cfg.key].state === 'ok';
  state.backoff[cfg.key] = ok ? 1 : Math.min((state.backoff[cfg.key] || 1) * 2, 8);
  if (ok) {
    state.lastFetch[cfg.key] = Date.now();
    if (markers.length) cacheSet('feed_' + cfg.key, { ts: Date.now(), markers });
  }
  state.pool.set(cfg.key, markers);
  renderAll();
  panels.renderSourceStatus(feedStatus, enabledFeeds);
  schedule(cfg);
}

function refreshAll(manual) {
  enabledFeeds.forEach((cfg, i) => {
    setTimeout(() => refreshFeed(cfg), i * 900 + (manual ? 0 : Math.random() * 600));
  });
}

/* ---------------- 汇总渲染 ---------------- */

function renderAll() {
  const all = [];
  for (const arr of state.pool.values()) all.push(...arr);
  all.sort((a, b) => (b.time ? b.time : 0) - (a.time ? a.time : 0));
  state.markers = all;

  const filtered = state.filter === 'all' ? all : all.filter(m => m.type === state.filter);

  // 地图与列表按当前筛选展示;若选中项被筛掉则取消选中
  if (state.selectedId && !filtered.some(m => m.id === state.selectedId)) {
    state.selectedId = null;
  }

  renderMarkers(filtered);
  highlightMarker(state.selectedId);
  panels.renderList(filtered, state.selectedId);
  panels.renderTicker(filtered);

  const quakes = all.filter(m => m.feedKey === 'usgs');
  panels.renderStats({
    total: all.length,
    nature: all.filter(m => m.feedKey === 'eonet').length,
    strongQuakes: quakes.filter(m => m.mag >= 6).length,
    quakes: quakes.length,
  });

  if (state.selectedId) {
    const m = all.find(x => x.id === state.selectedId);
    if (m) panels.renderDetail(m);
  }
  setUpdated(all);
}

function setUpdated(all) {
  const latest = all.map(m => m.time).filter(Boolean).sort((a, b) => b - a)[0];
  panels.setLastUpdated(latest || new Date());
}

/* ---------------- 选中与详情 ---------------- */

function select(id) {
  state.selectedId = id;
  const m = state.markers.find(x => x.id === id);
  highlightMarker(id);
  panels.renderList(state.filter === 'all' ? state.markers : state.markers.filter(x => x.type === state.filter), id);
  panels.renderDetail(m || null);
  const listItem = document.querySelector(`.event-item[data-id="${id}"]`);
  if (listItem) listItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

function deselect() {
  state.selectedId = null;
  clearHighlight();
  panels.renderList(state.filter === 'all' ? state.markers : state.markers.filter(x => x.type === state.filter), null);
  panels.renderDetail(null);
}

/* ---------------- 事件绑定 ---------------- */

function bindUI() {
  // 地图标记
  const svg = $('mapSvg');
  svg.addEventListener('click', e => {
    const g = e.target.closest ? e.target.closest('.marker') : null;
    if (g) select(g.dataset.id);
    else deselect();
  });
  svg.addEventListener('mousemove', e => {
    const g = e.target.closest ? e.target.closest('.marker') : null;
    if (g) {
      const m = state.markers.find(x => x.id === g.dataset.id);
      if (m) {
        const rect = g.getBoundingClientRect();
        panels.showTooltip(panels.markerTooltipHTML(m), rect.left + rect.width / 2, rect.top + rect.height / 2);
      }
    } else {
      panels.hideTooltip();
    }
  });
  svg.addEventListener('mouseleave', () => panels.hideTooltip());

  // 筛选标签
  $('tabs').addEventListener('click', e => {
    const btn = e.target.closest('.tab');
    if (!btn) return;
    state.filter = btn.dataset.key;
    panels.renderTabs(FILTERS, state.filter);
    renderAll();
  });

  // 事件列表
  $('eventList').addEventListener('click', e => {
    const item = e.target.closest('.event-item');
    if (item) select(item.dataset.id);
  });

  // 底部滚动条
  $('ticker').addEventListener('click', e => {
    const item = e.target.closest('.ticker-item');
    if (item) {
      select(item.dataset.id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  // 手动刷新
  $('refreshBtn').addEventListener('click', e => {
    const btn = e.currentTarget;
    btn.classList.add('spinning');
    setTimeout(() => btn.classList.remove('spinning'), 700);
    refreshAll(true);
  });

  // 自动刷新开关
  $('autoSwitch').addEventListener('click', () => {
    state.autoRefresh = !state.autoRefresh;
    $('autoSwitch').setAttribute('aria-checked', state.autoRefresh);
    if (state.autoRefresh) refreshAll(false);
    else timers.forEach(t => clearTimeout(t));
  });

  // 后台标签页暂停,回前台补拉过期数据
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) return;
    enabledFeeds.forEach(cfg => {
      const since = state.lastFetch[cfg.key] || 0;
      if (Date.now() - since > cfg.refreshMs) refreshFeed(cfg);
    });
  });
}

/* ---------------- 启动 ---------------- */

async function init() {
  panels.injectTickerKeyframes();
  panels.renderTabs(FILTERS, state.filter);
  panels.renderLegend(LEGEND);
  panels.renderSourceStatus(feedStatus, enabledFeeds);

  // 先渲染地图,再初始化标记层(依赖地图 marker 组)
  await initMap($('mapSvg'));
  initMarkerLayer();
  $('mapLoading').classList.add('hidden');

  // 先用会话缓存秒开上次快照
  for (const cfg of enabledFeeds) {
    const c = cacheGet('feed_' + cfg.key);
    if (c && c.markers && c.markers.length) state.pool.set(cfg.key, c.markers);
  }
  renderAll();

  bindUI();
  refreshAll(false);
}

init().catch(err => {
  console.error('初始化失败:', err);
});
