/* ============================================================
   世界实时监控 - 面板渲染(纯 DOM,不含业务逻辑)
   ============================================================ */

const $ = id => document.getElementById(id);

/* ---------------- 时间工具 ---------------- */

export function timeAgo(date) {
  if (!date || isNaN(date)) return '—';
  const diff = Date.now() - date.getTime();
  if (diff < 60 * 1000) return '刚刚';
  if (diff < 3600 * 1000) return Math.floor(diff / 60000) + ' 分钟前';
  if (diff < 86400 * 1000) return Math.floor(diff / 3600000) + ' 小时前';
  if (diff < 7 * 86400 * 1000) return Math.floor(diff / 86400000) + ' 天前';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function fmtTime(date) {
  if (!date || isNaN(date)) return '—';
  const p = n => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())} ${p(date.getHours())}:${p(date.getMinutes())}`;
}

const srcLabel = key => key === 'usgs' ? 'USGS' : 'NASA EONET';

/* ---------------- 顶栏 ---------------- */

export function setLastUpdated(date) {
  $('lastUpdated').textContent = date ? '更新于 ' + fmtTime(date) : '—';
}

export function renderSourceStatus(feedStatus, feeds) {
  const box = $('sourceStatus');
  box.innerHTML = '';
  for (const f of feeds) {
    const st = feedStatus[f.key];
    const cls = !st ? 'loading' : st.state;
    const dot = document.createElement('span');
    dot.className = 'src-dot ' + cls;
    dot.title = `${f.label}(${f.icon}) ${!st ? '加载中' : st.state === 'ok' ? '正常' : '不可用'}`;
    box.appendChild(dot);
  }
}

/* ---------------- 筛选标签 ---------------- */

export function renderTabs(filters, activeKey) {
  const box = $('tabs');
  box.innerHTML = '';
  for (const f of filters) {
    const btn = document.createElement('button');
    btn.className = 'tab' + (f.key === activeKey ? ' active' : '');
    btn.textContent = f.label;
    btn.dataset.key = f.key;
    box.appendChild(btn);
  }
}

/* ---------------- 图例 ---------------- */

export function renderLegend(legend) {
  const box = $('legend');
  box.innerHTML = '';
  for (const item of legend) {
    const span = document.createElement('span');
    span.className = 'legend-item';
    span.innerHTML = `<span class="dot" style="background:${item.color}"></span>${item.label}`;
    box.appendChild(span);
  }
}

/* ---------------- 事件列表 ---------------- */

export function renderList(markers, selectedId) {
  const list = $('eventList');
  const empty = $('listEmpty');
  $('listCount').textContent = markers.length;
  list.innerHTML = '';
  empty.hidden = markers.length > 0;
  for (const m of markers) {
    const item = document.createElement('div');
    item.className = 'event-item' + (m.id === selectedId ? ' selected' : '');
    item.dataset.id = m.id;
    item.innerHTML = `
      <span class="ev-dot" style="background:${m.color}"></span>
      <div class="ev-body">
        <div class="ev-title">${escapeHtml(m.title)}</div>
        <div class="ev-meta">
          <span>${timeAgo(m.time)}</span>
          <span class="ev-src">${srcLabel(m.feedKey)}</span>
        </div>
      </div>`;
    list.appendChild(item);
  }
}

/* ---------------- 详情卡 ---------------- */

export function renderDetail(marker) {
  const box = $('detail');
  if (!marker) {
    box.innerHTML = `<div class="detail-empty">点击地图或列表中的事件查看详情</div>`;
    return;
  }
  const rows = [
    ['类型', `<span class="detail-chip" style="background:${marker.color}">${escapeHtml(marker.categoryLabel)}</span>`],
    ['时间', fmtTime(marker.time) + '（' + timeAgo(marker.time) + '）'],
    ['位置', `纬度 ${marker.lat.toFixed(2)} · 经度 ${marker.lon.toFixed(2)}`],
  ];
  if (marker.mag != null) rows.push(['震级', marker.mag.toFixed(1)]);
  if (marker.details) rows.push(['详情', escapeHtml(marker.details)]);
  box.innerHTML = `
    <div class="detail-head">
      <span class="dot" style="background:${marker.color}"></span>
      <span class="detail-title">${escapeHtml(marker.title)}</span>
    </div>
    ${rows.map(r => `<div class="detail-row"><span class="k">${r[0]}</span><span class="v">${r[1]}</span></div>`).join('')}
    ${marker.link ? `<a class="detail-link" href="${marker.link}" target="_blank" rel="noopener">查看源数据 ↗</a>` : ''}`;
}

/* ---------------- 统计 ---------------- */

export function renderStats(stats) {
  const box = $('stats');
  const items = [
    ['今日事件', stats.total],
    ['活跃自然事件', stats.nature],
    ['24h 强震(≥6)', stats.strongQuakes],
    ['24h 地震(≥4)', stats.quakes],
  ];
  box.innerHTML = items.map(([label, value]) => `
    <div class="stat">
      <div class="stat-value">${value}</div>
      <div class="stat-label">${label}</div>
    </div>`).join('');
}

/* ---------------- 底部滚动条 ---------------- */

export function renderTicker(markers) {
  const box = $('ticker');
  if (!markers.length) {
    box.innerHTML = `<div class="ticker-empty">暂无事件</div>`;
    return;
  }
  const items = markers.slice(0, 40).map(m => `
    <span class="ticker-item" data-id="${m.id}">
      <span class="dot" style="background:${m.color}"></span>
      <span>${escapeHtml(shorten(m.title, 30))}</span>
      <span class="t-time">${timeAgo(m.time)}</span>
    </span>`).join('');
  // 复制一份实现无缝滚动
  box.innerHTML = `<div class="ticker-track">${items}${items}</div>`;
  const track = box.firstElementChild;
  const half = track.scrollWidth / 2;
  track.style.animation = `ticker-scroll ${Math.max(30, half / 40)}s linear infinite`;
}

/* 无缝滚动关键帧由 JS 注入,速率随内容长度自适应 */
export function injectTickerKeyframes() {
  const css = `@keyframes ticker-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }`;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
}

/* ---------------- 地图 Tooltip ---------------- */

export function showTooltip(html, x, y) {
  const tip = $('mapTooltip');
  tip.innerHTML = html;
  tip.hidden = false;
  // 相对 .map-wrap 定位
  const wrap = $('mapSvg').parentElement;
  const rect = wrap.getBoundingClientRect();
  let left = x - rect.left;
  let top = y - rect.top;
  tip.style.left = Math.min(left, rect.width - 260) + 'px';
  tip.style.top = top + 'px';
}

export function hideTooltip() {
  $('mapTooltip').hidden = true;
}

export function markerTooltipHTML(m) {
  return `<div class="tt-title">${escapeHtml(m.title)}</div>
          <div class="tt-time">${timeAgo(m.time)} · ${escapeHtml(m.categoryLabel)} · ${m.lat.toFixed(2)}, ${m.lon.toFixed(2)}</div>`;
}

/* ---------------- 工具 ---------------- */

function escapeHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function shorten(str, n) {
  return str.length > n ? str.slice(0, n) + '…' : str;
}
