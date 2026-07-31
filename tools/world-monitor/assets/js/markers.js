/* ============================================================
   世界实时监控 - 标记层
   将 Marker 数组渲染为地图上的脉冲圆点
   ============================================================ */

import { toXY, getMarkerGroup } from './map.js';

const NS = 'http://www.w3.org/2000/svg';

let group = null;
let byId = new Map(); // id -> markerElement

export function initMarkerLayer() {
  group = getMarkerGroup();
  byId = new Map();
}

export function renderMarkers(markers) {
  if (!group) return;
  // 清空现有标记
  while (group.firstChild) group.removeChild(group.firstChild);
  byId.clear();
  for (const m of markers) {
    group.appendChild(createMarker(m));
  }
}

function createMarker(m) {
  const [x, y] = toXY(m.lon, m.lat);
  const r = 2.5 + m.severity * 6.5;

  const g = document.createElementNS(NS, 'g');
  g.setAttribute('class', 'marker');
  g.setAttribute('data-id', m.id);
  g.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)})`);

  // 涟漪
  const pulse = document.createElementNS(NS, 'circle');
  pulse.setAttribute('class', 'marker-pulse');
  pulse.setAttribute('r', r.toFixed(1));
  pulse.setAttribute('fill', m.color);
  g.appendChild(pulse);

  // 实心点
  const dot = document.createElementNS(NS, 'circle');
  dot.setAttribute('class', 'marker-dot');
  dot.setAttribute('r', r.toFixed(1));
  dot.setAttribute('fill', m.color);
  g.appendChild(dot);

  // 选中环
  const ring = document.createElementNS(NS, 'circle');
  ring.setAttribute('class', 'marker-ring');
  ring.setAttribute('r', (r + 2.5).toFixed(1));
  g.appendChild(ring);

  byId.set(m.id, g);
  return g;
}

/* 高亮选中标记 */
export function highlightMarker(id) {
  for (const [mid, el] of byId) {
    el.classList.toggle('selected', mid === id);
  }
}

export function clearHighlight() {
  for (const el of byId.values()) el.classList.remove('selected');
}
